// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore";// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDz3Qr8LgOF42c1GYtDItboZBxXi6foH3I",
  authDomain: "tuni-edc73.firebaseapp.com",
  databaseURL: "https://tuni-edc73-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tuni-edc73",
  storageBucket: "tuni-edc73.appspot.com",
  messagingSenderId: "780155248570",
  appId: "1:780155248570:web:9c7cf2467f16917017c783",
  measurementId: "G-GKR2MJ02NK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);