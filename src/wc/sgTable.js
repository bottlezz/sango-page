//This file will be the web component
//It only needs to run, not be imported by main.js

import { getDatabase, ref, child, get, set, onValue } from "firebase/database";
import { gameController } from "../gameController.js";
import commonCss from "./css/common.css";
import "./sgArea.js";
import "./sgPlayer.js";
import "./sgJiangArea.js";
import * as appData from "../data/appData.js";

const template = document.createElement("template");
template.innerHTML = `
<style>
${commonCss}
</style>

<div name="game-menu" class="widget">
  <div name="gameId-field">
    <label>Game id</label>
    <input type="text" id="gameId"> <br> <br>
  </div>
  <div name="name-field">
    <label>Your name</label>
    <input type="text" id="userName" value="John"><br><br>
  </div>
  <button name="play-btn" class="game-menu-button">Play</button>
  <button name="reset-btn" class="game-menu-button">Reset DB</button>
</div>
<div name="tableDecks"></div>
<div name="players"></div>
`;

const initData = appData.initDataMock1;
class SgTable extends HTMLElement {
  db;
  widget;
  gameController;
  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: "open" });
    let clone = template.content.cloneNode(true);
    shadowRoot.append(clone);

    this.playButton = shadowRoot.querySelector("button[name='play-btn']");
    this.resetButton = shadowRoot.querySelector("button[name='reset-btn']");

    this.wcPlayers = shadowRoot.querySelectorAll("sg-player");
    this.gameMenuWidget = shadowRoot.querySelector('div[name="game-menu"]');
    this.tableDeckWidget = shadowRoot.querySelector("div[name='tableDecks']");
    this.playersWidiget = shadowRoot.querySelector("div[name='players']");
    // this.setButton = shadowRoot.querySelector("#set-btn");
    this.playButton.addEventListener("click", () => {
      this.gameStart();
    });
    this.resetButton.addEventListener("click", () => {
      this.resetDb();
    });
  }

  init(db) {
    console.log(`game control: db connected`);
    this.db = db;
  }

  gameStart() {
    const gameId = this.shadowRoot.querySelector("#gameId").value;
    const userName = this.shadowRoot.querySelector("#userName").value;

    if (gameId) {
      this.gameMenuWidget.classList.add("hide");
      this.gameController = new gameController(db, gameId, this);
      this.gameController.userName = userName;

      this.initGame();
      get(ref(this.db, `game/${gameId}`)).then((snapshot) => {
        if (snapshot.exists()) {
          console.log("game found");
        } else {
          console.log("No data available, creating game");
          set(ref(db, `game/${gameId}`), initData);
        }
      });
    }
  }

  initGame() {
    console.log("initlizing");
    for (let i = 0; i < 8; i++) {
      const sgPlayer = document.createElement("sg-player");
      sgPlayer.init(
        ref(this.db, `game/${this.gameController.gameId}/p${i + 1}`),
        this.gameController
      );
      this.playersWidiget.appendChild(sgPlayer);
    }

    this.jiangArea = document.createElement("sg-jiangarea");
    this.jiangArea.init(
      ref(this.db, `game/${this.gameController.gameId}/tableDecks/jiang`),
      this.gameController
    );
    this.tableDeckWidget.appendChild(this.jiangArea);

    this.paiArea = document.createElement("sg-area");
    this.paiArea.init(
      ref(this.db, `game/${this.gameController.gameId}/tableDecks/pai`),
      this.gameController
    );
    this.tableDeckWidget.appendChild(this.paiArea);

    this.discardArea = document.createElement("sg-area");
    this.discardArea.init(
      ref(this.db, `game/${this.gameController.gameId}/tableDecks/discard`),
      this.gameController
    );
    this.tableDeckWidget.appendChild(this.discardArea);
  }

  lockPlayerSelection() {
    this.dataset.owner = gameController.userName;
    this.classList.add("player-seated");
  }
  resetDb() {
    set(ref(db), {});
  }
}

customElements.define("sg-table", SgTable);
