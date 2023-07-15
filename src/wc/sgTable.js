//This file will be the web component
//It only needs to run, not be imported by main.js

import { getDatabase, ref, child, get, set, onValue } from "firebase/database";
import { gameController } from "../gameController.js";
import commonCss from "./css/common.css";
import tableCss from "./css/sgTable.css";
import "./sgArea.js";
import "./sgPlayer.js";
import "./sgJiangArea.js";

const template = document.createElement("template");
template.innerHTML = `
<style>
${commonCss}
</style>
<div class = "table-container">
  <div name="tableDecks"></div>
  <div name="players"></div>
</div>
`;

class SgTable extends HTMLElement {
  db;
  widget;
  gameController;
  tableRef;
  playerNumber = 6;
  constructor(db, gameController) {
    super();
    this.db = db;
    this.gameController = gameController;
    this.gameController.rootComponent = this;

    const shadowRoot = this.attachShadow({ mode: "open" });
    let clone = template.content.cloneNode(true);
    shadowRoot.append(clone);

    this.tableDeckWidget = shadowRoot.querySelector("div[name='tableDecks']");
    this.playersWidiget = shadowRoot.querySelector("div[name='players']");

    this.initGame();
  }

  initGame() {
    console.log("initlizing");
    for (let i = 0; i < this.playerNumber; i++) {
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

export { SgTable };
customElements.define("sg-table", SgTable);
