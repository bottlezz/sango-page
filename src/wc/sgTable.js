//This file will be the web component
//It only needs to run, not be imported by main.js

import { getDatabase, ref, child, get, set, onValue } from "firebase/database";
import { gameController } from "../gameController.js";
import commonCss from "./css/common.css";
import tableCss from "./css/sgTable.css";
import { SgArea } from "./sgArea.js";
import { SgPlayer } from "./sgPlayer.js";
import { SgPaiArea } from "./sgPaiArea.js";
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

  getRoundMenu() {
    const roundMenu = document.createElement("div");
    roundMenu.className = "round-menu";
    const rollRolesBtn = document.createElement("button");
    rollRolesBtn.innerHTML = "身份";
    rollRolesBtn.addEventListener("click", () => {
      this.gameController.assignRoles();
    });
    roundMenu.appendChild(rollRolesBtn);

    const jiangShuffleBtn = document.createElement("button");
    jiangShuffleBtn.innerHTML = "发将";
    jiangShuffleBtn.addEventListener("click", () => {
      this.gameController.dispatchJiang();
    });
    roundMenu.appendChild(jiangShuffleBtn);

    const paiShuffleBtn = document.createElement("button");
    paiShuffleBtn.innerHTML = "洗牌";
    paiShuffleBtn.addEventListener("click", () => {
      this.gameController.resetPai();
    });
    roundMenu.appendChild(paiShuffleBtn);

    const startRoundBtn = document.createElement("span");
    startRoundBtn.innerHTML = "清台";
    startRoundBtn.addEventListener("dblclick", () => {
      this.gameController.resetTable();
    });
    roundMenu.appendChild(startRoundBtn);

    return roundMenu;
  }

  getCardMenu() {
    const cardMenu = document.createElement("div");
    cardMenu.className = "card-menu hide";

    const drawButton = document.createElement("button");
    drawButton.innerHTML = "摸";
    drawButton.addEventListener("click", () => {
      this.gameController.drawSelectedCards();
    });
    const discardButton = document.createElement("button");
    discardButton.innerHTML = "弃";
    discardButton.addEventListener("click", () => {
      this.gameController.discardSelectedCards();
    });
    const playButton = document.createElement("button");
    playButton.innerHTML = "出";
    playButton.addEventListener("click", () => {
      this.gameController.discardSelectedCards();
    });
    const showButton = document.createElement("button");
    showButton.innerHTML = "亮";
    showButton.addEventListener("click", () => {
      this.gameController.showSelectedCards();
    });

    const peakButton = document.createElement("button");

    cardMenu.appendChild(drawButton);
    cardMenu.appendChild(discardButton);

    cardMenu.appendChild(playButton);
    cardMenu.appendChild(showButton);
    // cardMenu.appendChild(peakButton);
    return cardMenu;
  }

  initGame() {
    const container = this.shadowRoot.querySelector(".table-container");
    const tableDeckWidget = document.createElement("div");
    tableDeckWidget.classList.add("table-public");

    const roundMenu = this.getRoundMenu();
    const cardMenu = this.getCardMenu();
    this.cardMenu = cardMenu;
    tableDeckWidget.append(cardMenu);
    tableDeckWidget.appendChild(roundMenu);

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

    this.paiArea = new SgPaiArea();
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

  hideCardMenu() {
    if (!this.classList.contains("hide")) {
      this.cardMenu.classList.add("hide");
    }
  }

  showCardMenu() {
    this.cardMenu.classList.remove("hide");
  }
}

export { SgTable };
customElements.define("sg-table", SgTable);
