import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";

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
