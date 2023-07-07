//This file will be the web component
//It only needs to run, not be imported by main.js
import "./player.js";
import { getDatabase, ref, child, get, set, onValue } from "firebase/database";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    div[data-display="hide"] {
        display: none
    }
  </style>
  <div name="widget" data-display="">
  
    <slot name="content"></slot>
    <label>game id</label>
    <input type="text" id="gameId" name="fname"><br><br>
    <button name="create-btn">Play</button>
    <button name="reset-btn">Reset DB</button>
  </div>
  <div>
    <sg-player>p1</sg-player>
    <sg-player>p2</sg-player>
  </div>
`;
const tableInitData = {
  p1: { name: "p1", hand: [], state: "off" },
  p2: { name: "p2", hand: [], state: "off" },
};

class Table extends HTMLElement {
  db;
  widget;
  appData;

  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: "open" });
    let clone = template.content.cloneNode(true);
    shadowRoot.append(clone);

    this.createButton = shadowRoot.querySelector("button[name='create-btn']");
    this.resetButton = shadowRoot.querySelector("button[name='reset-btn']");

    this.wcPlayers = shadowRoot.querySelectorAll("sg-player");
    this.gameIdBox = shadowRoot.querySelector("#gameId");
    this.gameMenuWidget = shadowRoot.querySelector('div[name="widget"]');
    // this.setButton = shadowRoot.querySelector("#set-btn");
    this.createButton.addEventListener("click", () => {
      this.gameStart();
    });
    this.resetButton.addEventListener("click", () => {
      this.resetDb();
    });
  }

  gameStart() {
    const gameId = this.gameIdBox.value;

    if (gameId) {
      this.appData.gameId = gameId;
      let dbRef = ref(this.db);
      get(child(dbRef, `game/${gameId}`))
        .then((snapshot) => {
          if (snapshot.exists()) {
            console.log("game found");
            // console.log(snapshot.val());
            this.renderGame(snapshot.val());
          } else {
            console.log("No data available, creating");
            set(ref(db, `game/${gameId}`), tableInitData).then(() => {
              this.renderGame(tableInitData);
            });
          }
        })
        .catch((error) => {
          console.error(error);
        });

      // set(ref(db, `game/${gameId}`), { name: 1 });
      // console.log("game- start");
    }
  }

  renderGame(gameData) {
    console.log("initlizing");
    this.gameMenuWidget.dataset.display = "hide";
    let i = 0;
    for (const prop in gameData) {
      console.log(`game/${this.appData.gameId}/${prop}`);
      this.wcPlayers[i].init(
        ref(db, `game/${this.appData.gameId}/${prop}`),
        this.appData
      );
      i++;
    }
  }

  init(db) {
    console.log(`game control: db connected`);
    this.db = db;
    this.appData = {};
  }

  resetDb() {
    set(ref(db), {});
  }
}

customElements.define("sg-table", Table);
