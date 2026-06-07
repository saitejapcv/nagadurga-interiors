import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCdlBG-QDLLv6ogezv8bln508Hfts1wsU0",
  authDomain: "nagadurga-interiors.firebaseapp.com",
  projectId: "nagadurga-interiors",
  storageBucket: "nagadurga-interiors.firebasestorage.app",
  messagingSenderId: "948837999624",
  appId: "1:948837999624:web:ba185dccb32b6ca65e9dbd"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
