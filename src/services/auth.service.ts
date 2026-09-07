import { deleteApp, initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { auth, db, firebaseConfig } from "./firebase";
import type { UserProfile, UserRole } from "../types/user";

export async function login(email: string, password: string) {
  await signInWithEmailAndPassword(auth, email, password);
}

export async function logout() {
  await signOut(auth);
}

export async function fetchUserProfile(
  uid: string,
): Promise<UserProfile | null> {
  const snapshot = await getDoc(doc(db, "users", uid));
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  return {
    uid,
    email: data.email ?? "",
    displayName: data.displayName ?? "",
    role: data.role ?? "musico",
    avatar: data.avatar ?? "",
  };
}

export async function fetchAllUsers(): Promise<UserProfile[]> {
  const q = query(collection(db, "users"), orderBy("displayName"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      uid: d.id,
      email: data.email ?? "",
      displayName: data.displayName ?? "",
      role: data.role ?? "musico",
      avatar: data.avatar ?? "",
    };
  });
}

interface NewUserInput {
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
  avatar: string;
}

// Crea la cuenta de Auth desde una segunda instancia de Firebase App (mismo
// proyecto), así signInWithEmailAndPassword/createUserWithEmailAndPassword
// no pisa la sesión del admin que está logueado en la app principal.
export async function createUserAccount({
  email,
  password,
  displayName,
  role,
  avatar,
}: NewUserInput): Promise<void> {
  const secondaryApp = initializeApp(
    firebaseConfig,
    `admin-create-user-${Date.now()}`,
  );
  const secondaryAuth = getAuth(secondaryApp);

  try {
    const credential = await createUserWithEmailAndPassword(
      secondaryAuth,
      email,
      password,
    );

    // El doc de perfil se escribe con la sesión principal (el admin), que es
    // la que tiene permiso según las reglas de Firestore.
    await setDoc(doc(db, "users", credential.user.uid), {
      email,
      displayName,
      role,
      avatar,
      createdAt: serverTimestamp(),
    });
  } finally {
    await signOut(secondaryAuth);
    await deleteApp(secondaryApp);
  }
}
