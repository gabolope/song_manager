import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { collection, doc, initializeFirestore } from "firebase/firestore";

const prodConfig = {
  apiKey: "AIzaSyCrDtz6GBIbxyXIVpeJg863xtZAXoZMASA",
  authDomain: "song-manager-5b3bb.firebaseapp.com",
  projectId: "song-manager-5b3bb",
  storageBucket: "song-manager-5b3bb.firebasestorage.app",
  messagingSenderId: "325687043031",
  appId: "1:325687043031:web:8f83a5918c42df69f7a192",
  measurementId: "G-WXQQQV23PV",
};

// Proyecto aparte para desarrollo: `npm run dev` nunca toca los datos reales.
// La config web de Firebase no es secreta, por eso vive en el código.
const devConfig = {
  apiKey: "AIzaSyBca0xX2F9wEWOxdZf8x_2Eksnft2TrHlw",
  authDomain: "song-manager-dev-a7fd4.firebaseapp.com",
  projectId: "song-manager-dev-a7fd4",
  storageBucket: "song-manager-dev-a7fd4.firebasestorage.app",
  messagingSenderId: "738784201444",
  appId: "1:738784201444:web:1533f1ad7198c7f61dfaf1",
};

// Se exporta porque auth.service crea una app secundaria con la misma config;
// tiene que ser la elegida acá para que los usuarios se creen en el mismo proyecto.
export const firebaseConfig = import.meta.env.DEV ? devConfig : prodConfig;

const app = initializeApp(firebaseConfig);
// Los SongDTO traen campos opcionales (artist, key, tipo, tempo) que suelen
// venir undefined; sin esto, setDoc los rechaza y la escritura falla en
// silencio para cualquier canción con algún campo opcional sin definir.
export const db = initializeFirestore(app, { ignoreUndefinedProperties: true });
export const auth = getAuth(app);

// songs, book, liveSong y broadcast viven bajo `teams/{teamId}/...`. Aceptan
// null para que los hooks no tengan que repetir el chequeo: un usuario sin
// teamId (sin migrar) no tiene dónde escribir, y es mejor un error claro que
// una escritura rechazada por las reglas.
export type TeamCol = "songs" | "book" | "liveSong" | "broadcast";

function requireTeam(teamId: string | null): string {
  if (!teamId) throw new Error("Tu usuario no tiene equipo asignado");
  return teamId;
}

export function teamCol(teamId: string | null, name: TeamCol) {
  return collection(db, "teams", requireTeam(teamId), name);
}

export function teamDoc(teamId: string | null, name: TeamCol, id: string) {
  return doc(db, "teams", requireTeam(teamId), name, id);
}
