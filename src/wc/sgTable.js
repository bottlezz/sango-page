//This file will be the web component
//It only needs to run, not be imported by main.js

import { getDatabase, ref, child, get, set, onValue } from "firebase/database";
import { gameController } from "../gameController.js";
import { commonStyle } from "../constants.js";
import "./sgArea.js";
import "./sgPlayer.js";

const template = document.createElement("template");
template.innerHTML = `
${commonStyle}
<div name="widget" data-display="">

  <slot name="content"></slot>
  <label>game id</label>
  <input type="text" id="gameId"><br><br>
  <button name="create-btn">Play</button>
  <button name="reset-btn">Reset DB</button>
</div>
<div name="tableDecks"> </div>
<div name="players"></div>
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
const jiangDeckMock1 = {
  cards: [
    { id: "j1", visibleTo: "none" },
    { id: "j2", visibleTo: "none" },
    { id: "j3", visibleTo: "none" },
  ],
  display: "normal",
};

const paiDeckMock1 = {
  cards: [
    { id: "p1", visibleTo: "none" },
    { id: "p2", visibleTo: "none" },
    { id: "p3", visibleTo: "none" },
  ],
  display: "normal",
};

const tableDecksMock = {
  jiang: { ...deckMock },
  pai: { ...deckMock },
  discard: { ...deckMock },
};

const cardMock = {
  id: "j1",
  visableTo: "none",
};

const tableMock = {
  p1: { ...playerMock, name: "p1" },
  p2: { ...playerMock, name: "p2" },
  tableDecks: {
    jiang: jiangDeckMock1,
    pai: paiDeckMock1,
    discard: { ...deckMock },
  },
};

class SgTable extends HTMLElement {
  db;
  widget;
  gameController;
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
    this.playersWidiget = shadowRoot.querySelector("div[name='players']");
    // this.setButton = shadowRoot.querySelector("#set-btn");
    this.createButton.addEventListener("click", () => {
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
    const gameId = this.gameIdBox.value;
    this.gameMenuWidget.dataset.display = "hide";
    this.gameController = new gameController(db, gameId);
    if (gameId) {
      this.initGame();
      get(ref(this.db, `game/${gameId}`)).then((snapshot) => {
        if (snapshot.exists()) {
          console.log("game found");
        } else {
          console.log("No data available, creating game");
          set(ref(db, `game/${gameId}`), tableMock);
        }
      });
    }
  }

  initGame() {
    console.log("initlizing");
    for (let i = 0; i < 2; i++) {
      const sgPlayer = document.createElement("sg-player");
      sgPlayer.init(
        ref(this.db, `game/${this.gameController.gameId}/p${i + 1}`),
        this.gameController
      );
      this.playersWidiget.appendChild(sgPlayer);
    }

    // this.jiangArea = document.createElement("sg-area");
    // this.jiangArea.init(
    //   ref(this.db, `game/${this.gameController.gameId}/tableDecks/jiang`),
    //   this.gameController
    // );
    // this.tableDeckWidget.appendChild(this.jiangArea);
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

  resetDb() {
    set(ref(db), {});
  }
}

customElements.define("sg-table", SgTable);
