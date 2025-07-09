// src/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCytyjqSGgfe27frjFJGh7l6r0IW-Yvlzc",
  authDomain: "simjutam-8bd50.firebaseapp.com",
  databaseURL: "https://simjutam-8bd50-default-rtdb.firebaseio.com", // 꼭 있어야 함!
  projectId: "simjutam-8bd50",
  storageBucket: "simjutam-8bd50.firebasestorage.app",
  messagingSenderId: "61101600520",
  appId: "1:61101600520:web:8534815d97cf8d11cd46bd"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const auth = getAuth(app);
