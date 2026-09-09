import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyCrDtz6GBIbxyXIVpeJg863xtZAXoZMASA",
  authDomain: "song-manager-5b3bb.firebaseapp.com",
  projectId: "song-manager-5b3bb",
  storageBucket: "song-manager-5b3bb.firebasestorage.app",
  messagingSenderId: "325687043031",
  appId: "1:325687043031:web:8f83a5918c42df69f7a192",
  measurementId: "G-WXQQQV23PV",
};

const app = initializeApp(firebaseConfig);
// Los SongDTO traen campos opcionales (artist, key, tipo, tempo) que suelen
// venir undefined; sin esto, setDoc los rechaza y la escritura falla en
// silencio para cualquier canción con algún campo opcional sin definir.
export const db = initializeFirestore(app, { ignoreUndefinedProperties: true });
export const auth = getAuth(app);
