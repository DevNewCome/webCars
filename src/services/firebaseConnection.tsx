// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth'
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD-FRRatQkcs8pjb3nS8R8XlQ1qLR8BMFE",
  authDomain: "carshop-c5d16.firebaseapp.com",
  projectId: "carshop-c5d16",
  storageBucket: "carshop-c5d16.appspot.com",
  messagingSenderId: "974212543818",
  appId: "1:974212543818:web:d7840098a50869eefebdb3",
  measurementId: "G-NHQW4LSJDF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app)
const auth = getAuth(app)
const storage = getStorage(app)

export { db, auth, storage }