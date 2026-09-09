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
import menuCss from "./css/sgGameMenu.css";
import { gameController } from "../gameController";
import { SgTable } from "./sgTable";
import * as appData from "../data/appData.js";

const template = document.createElement("template");
template.innerHTML = `
<style>
${commonCss}
${menuCss}
</style>
<main class="menu-shell">
  <header class="brand">
    <div class="brand-emblem" aria-hidden="true">杀</div>
    <h1>三国杀 <span>双将 3v3</span></h1>
  </header>
  <div name="login-menu" class="widget">
    <div class="card-heading">
      <h2>加入对局</h2>
      <p>输入房间号和昵称，即可入座。</p>
    </div>
    <form class="login-form">
      <div class="field" name="gameId-field">
        <label for="gameId">房间号</label>
        <div class="input-wrap"><span class="input-icon" aria-hidden="true">#</span><input type="text" id="gameId" value="6" required aria-describedby="room-hint"></div>
        <p class="field-hint" id="room-hint">输入房间号即可进入对局。</p>
      </div>
      <div class="field" name="name-field">
        <label for="userName">你的昵称</label>
        <div class="input-wrap"><svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 21v-3a7 7 0 0 1 14 0v3"/></svg><input type="text" id="userName" placeholder="请输入你的昵称" autocomplete="nickname" required></div>
      </div>
      <div name="name-field" class="hide">
        <label for="playerCount">玩家人数</label>
        <input type="text" id="playerCount" value="6">
      </div>
      <button type="submit" name="play-btn" class="game-menu-button">进入游戏 <span aria-hidden="true">↗</span></button>
    </form>
    <div class="card-footer"><button type="button" name="reset-btn">重置数据库</button></div>
  </div>
  <div name="seat-menu" class="widget hide"></div>
</main>
`;

class SgGameMenu extends HTMLElement {
  db;
  gameController;
  tableRef;
  shadowRoot;
  playerCount = 6;
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

    shadowRoot.querySelector(".login-form").addEventListener("submit", (event) => {
      event.preventDefault();
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
      // initData = appData.initDataMock8;
      initData = appData.initDataMock6;
    }

    initData.tableDecks.jiang = {
      cards: this.gameController.getShuffledJiang(),
      display: "normal",
    };
    initData.tableDecks.pai = {
      cards: this.gameController.getShuffledPai(),
      display: "normal",
    };
    return initData;
  }

  async lookupRoom(userName) {
    const roomPath = `game/${this.gameId}`;
    const countSnapshot = await get(ref(this.db, `${roomPath}/pCount`));
    if (!countSnapshot.exists()) return null;
    const playerCount = Number(countSnapshot.val());
    const names = await Promise.all(Array.from({ length: playerCount }, (_, index) =>
      get(ref(this.db, `${roomPath}/p${index + 1}/name`))
    ));
    const reconnectIndex = names.findIndex(snapshot => snapshot.val() === userName);
    return {
      playerCount,
      reconnectSeat: reconnectIndex < 0 ? null : `p${reconnectIndex + 1}`,
    };
  }

  async onPlayClick() {
    const gameId = this.shadowRoot.querySelector("#gameId").value;
    const userName = this.shadowRoot.querySelector("#userName").value;
    let playerNum = this.shadowRoot.querySelector("#playerCount").value;

    if (!userName || !playerNum || !gameId) return;
    if (playerNum != 6) {
      playerNum = 8;
    }
    this.playerCount = playerNum;
    this.userName = userName;
    this.gameId = gameId;

    this.gameController = new gameController(this.db, gameId);
    this.gameController.userName = userName;
    this.gameController.playerCount = playerNum;
    this.tableRef = ref(this.db, `game/${gameId}`);

    const room = await this.lookupRoom(userName);
    if (room) {
      this.playerCount = room.playerCount;
      this.gameController.playerCount = room.playerCount;
      if (room.reconnectSeat) {
        this.joinSeat(room.reconnectSeat);
        return;
      }
      this.renderSeatMenu();
    } else {
      await set(this.tableRef, this.getInitData(playerNum));
      this.renderSeatMenu();
    }
    this.loginMenu.classList.add("hide");
  }

  renderSeatMenu() {
    const seatMenu = this.shadowRoot.querySelector(`div[name="seat-menu"]`);
    // console.log("render seat");
    seatMenu.classList.remove("hide");
    seatMenu.innerHTML = "";
    for (let i = 0; i < this.playerCount; i++) {
      const seatDom = document.createElement("div");
      const key = `p${i + 1}`;
      const playerNameRef = ref(this.db, `game/${this.gameId}/${key}/name`);
      seatDom.append(`${i + 1} 号座位：`);
      seatMenu.appendChild(seatDom);
      const unSub = onValue(playerNameRef, (snapshot) => {
        const pName = snapshot.val();
        if (pName != "empty") {
          seatDom.textContent = `${i + 1} 号座位：${pName} 已入座`;
        } else {
          const joinButton = document.createElement("button");
          joinButton.innerText = "入座";
          joinButton.addEventListener("click", () => {
            this.joinSeat(key);
          });
          seatDom.appendChild(joinButton);
        }
      });
      this.subs.push(unSub);
    }
  }

  onResetClick() {
    const password = window.prompt("作者的微信昵称拼音（不含空格）");
    if (password === null) return;
    if (password.trim() !== "kesui") {
      window.alert("密码错误，数据库未重置。");
      return;
    }
    set(ref(this.db), {}).catch(() => {
      window.alert("数据库重置失败，请稍后重试。");
    });
  }

  joinSeat(key) {
    this.gameController.currentPlayer = key;
    const playerNameRef = ref(this.db, `game/${this.gameId}/${key}/name`);
    set(playerNameRef, this.userName);
    this.renderTable();
    this.removeSelf();
  }

  removeSelf() {
    this.parentNode.removeChild(this);
  }

  renderTable() {
    const table = new SgTable(this.db, this.gameController);
    this.parentNode.appendChild(table);
  }

  disconnectedCallback() {
    // remove database listener.
    this.subs.forEach((unSub) => {
      unSub();
    });
  }
}

export { SgGameMenu };
customElements.define("sg-gamemenu", SgGameMenu);
