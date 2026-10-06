// Migración única al modelo multi-equipo (TODO.md, paso 3).
//
// Copia las colecciones globales viejas (songs, book, liveSong, broadcast) a
// teams/{teamId}/..., crea el doc del equipo y le pone teamId a los usuarios
// que no tienen. Por defecto es un dry run: solo muestra lo que haría.
//
// Uso:
//   node scripts/migrate-to-teams.mjs --key keys/dev.json --team-id <id> --team-name "<nombre>" [--write]
//   node scripts/migrate-to-teams.mjs --key keys/dev.json --team-id <id> --delete-old [--write]
//
// --key         clave de cuenta de servicio del proyecto destino (Firebase
//               Console → Configuración → Cuentas de servicio). Van en keys/,
//               que está en .gitignore.
// --source-key  opcional: leer las colecciones viejas de OTRO proyecto. Sirve
//               para probar con los datos reales de prod escribiendo en dev
//               (a prod solo se le lee). Sin esto, origen = destino.
// --delete-old  en vez de migrar, borra las colecciones globales viejas del
//               destino. Solo si cada una tiene la misma cantidad de docs que
//               su copia en el equipo. Es el último paso, después de probar.
// --write       ejecuta de verdad; sin esto no escribe nada.

import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { cert, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const COLLECTIONS = ["songs", "book", "liveSong", "broadcast"];

const { values: args } = parseArgs({
  options: {
    key: { type: "string" },
    "source-key": { type: "string" },
    "team-id": { type: "string" },
    "team-name": { type: "string" },
    "delete-old": { type: "boolean", default: false },
    write: { type: "boolean", default: false },
  },
});

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

if (!args.key) fail("Falta --key");
if (!args["team-id"]) fail("Falta --team-id");
if (!args["delete-old"] && !args["team-name"]) fail("Falta --team-name");
if (args["delete-old"] && args["source-key"])
  fail("--delete-old borra en el destino; no se combina con --source-key");

function openDb(keyPath, appName) {
  const serviceAccount = JSON.parse(readFileSync(keyPath, "utf8"));
  const app = initializeApp({ credential: cert(serviceAccount) }, appName);
  return { db: getFirestore(app), projectId: serviceAccount.project_id };
}

const target = openDb(args.key, "target");
const source = args["source-key"]
  ? openDb(args["source-key"], "source")
  : target;

const teamId = args["team-id"];
const teamRef = target.db.collection("teams").doc(teamId);
const dry = !args.write;

console.log(`Origen:  ${source.projectId}`);
console.log(`Destino: ${target.projectId} → teams/${teamId}`);
console.log(dry ? "Modo: DRY RUN (agregá --write para ejecutar)\n" : "Modo: ESCRITURA\n");

if (args["delete-old"]) {
  await deleteOld();
} else {
  await migrate();
}

async function migrate() {
  // 1. Doc del equipo. Si ya existe se respeta su createdAt.
  const teamSnap = await teamRef.get();
  console.log(
    teamSnap.exists
      ? `teams/${teamId} ya existe (${teamSnap.data().name}); se actualiza el nombre`
      : `teams/${teamId} se crea con nombre "${args["team-name"]}"`,
  );
  if (!dry) {
    await teamRef.set(
      {
        name: args["team-name"],
        ...(teamSnap.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
      },
      { merge: true },
    );
  }

  // 2. Colecciones. Se conservan los ids: book y liveSong referencian a la
  // canción por id (liveSong.id, book/{songId}), cambiarlos rompería la
  // propagación de ediciones de songs.service.ts. Los Timestamp (createdAt
  // del book) se copian tal cual, así el orden de fallback no cambia.
  const writer = target.db.bulkWriter();
  for (const name of COLLECTIONS) {
    const [from, existing] = await Promise.all([
      source.db.collection(name).get(),
      teamRef.collection(name).get(),
    ]);
    const warn = existing.empty
      ? ""
      : ` (⚠ el destino ya tiene ${existing.size}; los mismos ids se pisan)`;
    console.log(`${name}: ${from.size} doc(s) a copiar${warn}`);
    if (dry) continue;
    for (const d of from.docs) {
      writer.set(teamRef.collection(name).doc(d.id), d.data());
    }
  }
  await writer.close();

  // 3. Usuarios del destino sin equipo. Los que ya tienen otro teamId no se
  // tocan: serían de otro equipo creado a mano.
  const users = await target.db.collection("users").get();
  let assigned = 0;
  for (const u of users.docs) {
    const current = u.get("teamId");
    if (current === teamId) continue;
    if (current) {
      console.log(`  users/${u.id} (${u.get("email")}) ya está en "${current}", se saltea`);
      continue;
    }
    assigned++;
    console.log(`  users/${u.id} (${u.get("email")}) → teamId ${teamId}`);
    if (!dry) await u.ref.update({ teamId });
  }
  console.log(`users: ${assigned} usuario(s) a asignar de ${users.size}`);

  console.log(dry ? "\nDry run terminado, no se escribió nada." : "\n✓ Migración terminada.");
}

async function deleteOld() {
  // Chequeo de seguridad: no borrar una colección vieja si su copia en el
  // equipo no tiene la misma cantidad de docs (migración incompleta o se
  // migró a otro teamId).
  for (const name of COLLECTIONS) {
    const [oldCount, newCount] = await Promise.all([
      target.db.collection(name).count().get(),
      teamRef.collection(name).count().get(),
    ]);
    const o = oldCount.data().count;
    const n = newCount.data().count;
    console.log(`${name}: ${o} viejo(s), ${n} en el equipo`);
    if (o !== n) fail(`${name} no coincide; no se borra nada`);
  }
  if (dry) {
    console.log("\nDry run: con --write se borran las 4 colecciones viejas.");
    return;
  }
  for (const name of COLLECTIONS) {
    await target.db.recursiveDelete(target.db.collection(name));
    console.log(`✓ ${name} borrada`);
  }
}
