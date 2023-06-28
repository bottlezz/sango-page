// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAckrIfuhLhmrtrtmHHwQQoBkF6lfFtLIY",
  authDomain: "sanguosha-a3368.firebaseapp.com",
  databaseURL: "https://sanguosha-a3368-default-rtdb.firebaseio.com",
  projectId: "sanguosha-a3368",
  storageBucket: "sanguosha-a3368.appspot.com",
  messagingSenderId: "619109039096",
  appId: "1:619109039096:web:4a4ed7755e270a1d4a740d",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
