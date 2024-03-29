import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// import "./wc/sgTable.js";
import { SgGameMenu } from "./wc/sgGameMenu.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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
const db = getDatabase(app);

window.db = db;
window.appData = {};
//let sgTable = document.querySelector("sg-table");
const appDom = document.querySelector(`div[name="app"]`);
const gameMenu = new SgGameMenu(db);
appDom.appendChild(gameMenu);
// sgTable.init(db);
