import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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
export const db = getFirestore(app);
export const auth = getAuth(app);
