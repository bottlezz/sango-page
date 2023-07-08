//This file will be the web component
//It only needs to run, not be imported by main.js
import "./player.js";
import { getDatabase, ref, child, get, set, onValue } from "firebase/database";
import { gameController } from "./gameController.js";
import { SgArea } from "./area.js";

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
    <input type="text" id="gameId"><br><br>
    <button name="create-btn">Play</button>
    <button name="reset-btn">Reset DB</button>
  </div>
  <div name="moveWidget">
    <div>
      <p>From: <input type="text" name="move-from"> To: <input type="text" name="move-to"> </p>
      <p><button name="move-btn">move</button></p>
    </div>
  </div>
  <div name="tableDecks"> </div>
  <div>
    <sg-player></sg-player>
    <sg-player></sg-player>
  </div>
`;

const deckMock = {
  cards: [],
  display: "normal", // 自己可见，别人不可见，还没想好怎么定义这个。
};
const playerDecksMock = {
  jiang: { ...deckMock }, // wu jiang
  hand: { ...deckMock }, // shou pai
  pan: { ...deckMock }, // pan ding
  zhuang: { ...deckMock }, // zhuang bei
};

const playerMock = {
  name: "p",
  state: "off",
  ...playerDecksMock,
};

const tableDecksMock = {
  jiang: { ...deckMock },
  pai: { ...deckMock },
};

const cardMock = {
  id: "j1",
  visableTo: "none",
};

const tableMock = {
  p1: { ...playerMock, name: "p1" },
  p2: { ...playerMock, name: "p2" },
  tableDecks: { jiang: { cards: [{ ...cardMock }], display: "normal" } },
};

class SgTable extends HTMLElement {
  db;
  widget;
  appData;
  controller;
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
    this.tableDeckWidget = shadowRoot.querySelector("div[name='tableDecks']");
    // this.setButton = shadowRoot.querySelector("#set-btn");
    this.createButton.addEventListener("click", () => {
      this.gameStart();
    });
    this.resetButton.addEventListener("click", () => {
      this.resetDb();
    });
    this.moveButton = shadowRoot.querySelector("button[name='move-btn']");
    this.moveButton.addEventListener("click", () => {
      // let fromPath = shadowRoot.querySelector("input[name='move-from']").value;
      // let toPath = shadowRoot.querySelector("input[name='move-to']").value;
      let fromPath = "game/1/tableDeck/jiang/cards/0";
      let toPath = "game/1/p1/jiang/cards";
      this.controller.moveItem(fromPath, toPath);
    });
  }

  init(db) {
    console.log(`game control: db connected`);
    this.db = db;
    this.appData = {};
    this.controller = new gameController(db);
  }

  gameStart() {
    const gameId = this.gameIdBox.value;
    this.gameMenuWidget.dataset.display = "hide";
    if (gameId) {
      this.appData.gameId = gameId;
      let dbRef = ref(this.db);

      get(child(dbRef, `game/${gameId}`))
        .then((snapshot) => {
          if (snapshot.exists()) {
            console.log("game found");
            const dbData = snapshot.val();
            this.initGame(dbData);
          } else {
            console.log("No data available, creating game");

            set(ref(db, `game/${gameId}`), tableMock).then(() => {
              get(child(dbRef, `game/${gameId}`)).then((snapshot) => {
                if (snapshot.exists()) {
                  const dbData = snapshot.val();
                  this.initGame(dbData);
                } else {
                  // something wrong
                }
              });
            });
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }

  initGame(dbData) {
    console.log("initlizing");

    let i = 0;
    //render players
    for (const prop in dbData) {
      if (prop == "p" + (i + 1)) {
        console.log(`game/${this.appData.gameId}/${prop}`);
        this.wcPlayers[i].init(
          ref(this.db, `game/${this.appData.gameId}/${prop}`),
          this.appData
        );
        i++;
      }
    }

    this.jiangArea = document.createElement("sg-area");
    this.jiangArea.init(
      ref(this.db, `game/${this.appData.gameId}/tableDecks/jiang`),
      this.appData
    );
    this.tableDeckWidget.appendChild(this.jiangArea);
  }

  resetDb() {
    set(ref(db), {});
  }
}

customElements.define("sg-table", SgTable);
