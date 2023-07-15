import {
  child,
  getDatabase,
  get,
  update,
  set,
  ref,
  onValue,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
} from "firebase/database";

import commonCss from "./css/common.css";
import { gameController } from "../gameController";
import { SgTable } from "./sgTable";
import jiangKu from "../data/jiang.json"
import paiKu from "../data/pai.json"
import * as appData from "../data/appData.js";

const template = document.createElement("template");
template.innerHTML = `
<style>
${commonCss}
</style>
<div name="login-menu" class="widget">
  <div name="gameId-field">
    <label>Game id</label>
    <input type="text" id="gameId" value="1"> <br> <br>
  </div>
  <div name="name-field">
    <label>Your name</label>
    <input type="text" id="userName" value="John"><br><br>
  </div>
  <div name="name-field">
    <label>Player number</label>
    <input type="text" id="playerNumber" value="6"><br><br>
  </div>
  <button name="play-btn" class="game-menu-button">Play</button>
  <button name="reset-btn" class="game-menu-button">Reset DB</button>
</div>
<div name="seat-menu" class="widget hide">
</div>
`;


class SgGameMenu extends HTMLElement {
  db;
  gameController;
  tableRef;
  shadowRoot;
  playerNumber = 6;
  gameId = 1;
  subs = [];
  constructor(db) {
    super();
    const shadowRoot = this.attachShadow({ mode: "open" });
    let clone = template.content.cloneNode(true);
    shadowRoot.append(clone);

    this.db = db;
    this.shadowRoot = shadowRoot;
    this.loginMenu = shadowRoot.querySelector(`div[name="login-menu"]`);
    this.playButton = shadowRoot.querySelector("button[name='play-btn']");
    this.resetButton = shadowRoot.querySelector("button[name='reset-btn']");

    this.playButton.addEventListener("click", () => {
      this.onPlayClick();
    });
    this.resetButton.addEventListener("click", () => {
      this.onResetClick();
    });
  }

  getInitData(playerNum) {
    let initData = {};
    if (playerNum == 6) {
      initData = appData.initDataMock6;
    } else {
      initData = appData.initDataMock8;
    }

    const initJiangDeckCards = Object.keys(jiangKu).map((key) => {
      return { id: key, show: "0" };
    });
    const initPaiDeckCards = Object.keys(paiKu).map((key) => {
      return { id: key, show: "0" };
    });

    initData.tableDecks.jiang = {
      cards: initJiangDeckCards,
      display: "normal",
    };
    initData.tableDecks.pai = {
      cards: initPaiDeckCards,
      display: "normal",
    };
    return initData;
  }

  onPlayClick() {
    const gameId = this.shadowRoot.querySelector("#gameId").value;
    const userName = this.shadowRoot.querySelector("#userName").value;
    const playerNum = this.shadowRoot.querySelector("#playerNumber").value;

    if (!userName || !playerNum || !gameId) return;
    if (playerNum != 6) {
      playerNum = 8;
    }
    this.playerNumber = playerNum;
    this.userName = userName;
    this.gameId = gameId;

    this.gameController = new gameController(db, gameId);
    this.gameController.userName = userName;
    this.tableRef = ref(db, `game/${gameId}`);

    get(this.tableRef).then((snapshot) => {
      if (snapshot.exists()) {
        console.log("game found");
        const game = snapshot.val();
        for (let i = 0; i < game.pCount; i++) {
          const key = "p" + i;
          console.log(key);
          if (game[key] && game[key].name == userName) {
            // user connected. go into talbe
            console.log("user connected");
            this.joinSeat(key);
            return;
          } else {
            this.renderSeatMenu();
          }
        }
      } else {
        //Create game
        console.log("No data available, creating game");
        set(this.tableRef, this.getInitData(playerNum));
        this.renderSeatMenu();
      }
      this.loginMenu.classList.add("hide");
    });
  }

  renderSeatMenu() {
    const seatMenu = this.shadowRoot.querySelector(`div[name="seat-menu"]`);
    // console.log("render seat");
    seatMenu.classList.remove("hide");
    seatMenu.innerHTML = ""
    for (let i = 0; i < this.playerNumber; i++) {
      const seatDom = document.createElement("div");
      const key = `p${i + 1}`;
      seatDom.append(`${key}: `)
      const playerNameRef = ref(this.db, `game/${this.gameId}/${key}/name`);
      seatMenu.appendChild(seatDom);
      const unSub = onValue(playerNameRef, (snapshot) => {
        const pName = snapshot.val();
        if (pName != "empty") {
          seatDom.innerHTML = `${key}: Seat is taken by ${pName}`;
        } else {
          const joinButton = document.createElement("button");
          joinButton.innerText = "Join";
          joinButton.addEventListener("click", () => {
            this.joinSeat(key);
          })
          seatDom.appendChild(joinButton);
        }
      });
      this.subs.push(unSub);
    }
  }

  onResetClick() {
    set(ref(db), {});
  }


  joinSeat(key) {
    const playerNameRef = ref(this.db, `game/${this.gameId}/${key}/name`);
    set(playerNameRef, this.userName);
    this.renderTable();
    this.removeSelf();
  }
  removeSelf() {
    this.parentNode.removeChild(this);
  }

  disconnectedCallback() {
    // console.log("disconnected");
    this.subs.forEach((unSub) => {
      unSub();
    })
  }

  renderTable() {
    const table = new SgTable(this.db, this.gameController);
    this.parentNode.appendChild(table);
  }
}

export { SgGameMenu };
customElements.define("sg-gamemenu", SgGameMenu);
