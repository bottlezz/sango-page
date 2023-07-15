//This file will be the web component
//It only needs to run, not be imported by main.js

import { getDatabase, ref, child, get, set, onValue } from "firebase/database";
import { gameController } from "../gameController.js";
import commonCss from "./css/common.css";
import tableCss from "./css/sgTable.css";
import { SgArea } from "./sgArea.js";
import "./sgArea.js";
import { SgPlayer } from "./sgPlayer.js";
import "./sgJiangArea.js";

class SgTable extends HTMLElement {
  db;
  widget;
  gameController;
  shadowRoot;
  tableRef;
  playerCount = 6;
  playerDoms = [];
  constructor(db, gameController) {
    super();
    this.db = db;
    this.gameController = gameController;
    this.gameController.rootComponent = this;
    this.playerCount = this.gameController.playerCount;

    this.shadowRoot = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.append(commonCss);
    style.append(tableCss);
    const container = document.createElement("div");
    container.className = "table-container";

    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(container);

    this.initGame();
  }

  initGame() {
    const container = this.shadowRoot.querySelector(".table-container");
    const tableDeckWidget = document.createElement("div");
    tableDeckWidget.classList.add("table-public");
    container.appendChild(tableDeckWidget);
    for (let i = 0; i < this.playerCount; i++) {
      const sgPlayer = new SgPlayer();
      sgPlayer.dataset.key = `p${i + 1}`;
      container.appendChild(sgPlayer);
      this.playerDoms.push(sgPlayer);
    }
    // because bad design, current play assign function has side effects on other player widget.
    // so I have to use another loop to run init() after all sg-player is added to sg-table.
    for (let i = 0; i < this.playerCount; i++) {
      const sgPlayer = this.playerDoms[i];
      sgPlayer.init(
        ref(this.db, `game/${this.gameController.gameId}/p${i + 1}`),
        this.gameController
      );
    }

    this.jiangArea = document.createElement("sg-jiangarea");
    this.jiangArea.init(
      ref(this.db, `game/${this.gameController.gameId}/tableDecks/jiang`),
      this.gameController
    );
    tableDeckWidget.appendChild(this.jiangArea);

    this.paiArea = new SgArea();
    this.paiArea.init(
      ref(this.db, `game/${this.gameController.gameId}/tableDecks/pai`),
      this.gameController
    );
    tableDeckWidget.appendChild(this.paiArea);

    this.discardArea = document.createElement("sg-area");
    this.discardArea.init(
      ref(this.db, `game/${this.gameController.gameId}/tableDecks/discard`),
      this.gameController
    );
    tableDeckWidget.appendChild(this.discardArea);
  }

  lockPlayerSelection() {
    this.dataset.owner = gameController.userName;
    this.classList.add("player-seated");
    // assign slot
    const mainPlayer = this.gameController.currentPlayer; //p1
    const curPlayerNum = Number(mainPlayer[1]);
    for (let i = 0; i < this.playerCount; i++) {
      const slotClass = `slot${i}`;
      let counter = (curPlayerNum + i) % this.playerCount;
      if (counter == 0) {
        counter = this.playerCount;
      }
      const playerKey = `p${counter}`;
      console.log(playerKey);
      const playerDom = this.shadowRoot.querySelector(
        `sg-player[data-key="${playerKey}"]`
      );
      playerDom.classList.add(slotClass);
    }
  }
}

export { SgTable };
customElements.define("sg-table", SgTable);
