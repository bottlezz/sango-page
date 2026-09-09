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
import { installCardDrag } from "../cardDrag.js";
import { installActionLog } from './actionLogPanel.js';

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
    const topbar = document.createElement("header");
    topbar.className = "topbar";
    topbar.innerHTML = `<span class="seal">杀</span><span class="brand">SANGO · 双将3v3</span>
      <span class="room"></span><span class="seat-label" aria-live="polite">座次：未入座</span>
      <span class="mode"><i class="live-dot" aria-hidden="true"></i><span>手动桌面 · 技能与结算由玩家执行</span></span>
      <button type="button" class="top-btn">操作说明</button>`;
    topbar.querySelector(".room").textContent = `房间 ${String(this.gameController.gameId).padStart(3, "0")}`;
    const help = document.createElement("dialog");
    help.className = "table-help";
    help.setAttribute("aria-label", "操作说明");
    help.innerHTML = `<h3>操作说明</h3><p>点击卡牌可选中或取消选择，支持多选。</p>
      <p>拖到玩家卡片后，选择目标区域；取消或按 Esc 保留原位。</p>
      <p>通过侧栏调整血量、翻面和连环。技能与结算由玩家执行。</p>
      <form method="dialog"><button class="top-btn">关闭</button></form>`;
    topbar.querySelector("button").addEventListener("click", () => help.showModal());
    const publicTools = document.createElement("details");
    publicTools.className = "public-tools";
    const toolsToggle = document.createElement("summary");
    toolsToggle.textContent = "公共工具";
    const toolsMenu = this.getRoundMenu();
    toolsMenu.setAttribute("aria-label", "公共工具");
    publicTools.append(toolsToggle, toolsMenu);
    topbar.append(publicTools);
    toolsMenu.addEventListener("click", event => {
      if (event.target.closest("button")) publicTools.open = false;
    });
    this.shadowRoot.addEventListener("click", event => {
      if (!event.composedPath().includes(publicTools)) publicTools.open = false;
    });
    publicTools.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        publicTools.open = false;
        toolsToggle.focus();
      }
    });
    this.shadowRoot.append(topbar, help);
    this.shadowRoot.appendChild(container);

    this.initGame();
    this.disposeDrag = installCardDrag(this);
    this.disposeLog = installActionLog(this);
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

    const dealBtn = document.createElement("button");
    dealBtn.textContent = "发牌";
    dealBtn.title = "所有玩家手牌为空时，按座次从牌堆给每人发四张牌";
    dealBtn.addEventListener("click", async () => {
      dealBtn.disabled = true;
      try {
        await this.gameController.dealCards();
      } catch (error) {
        window.alert(error.message);
      } finally {
        dealBtn.disabled = false;
      }
    });
    roundMenu.appendChild(dealBtn);

    const paiShuffleBtn = document.createElement("button");
    paiShuffleBtn.innerHTML = "洗牌";
    paiShuffleBtn.addEventListener("click", () => {
      this.gameController.resetPai();
    });
    roundMenu.appendChild(paiShuffleBtn);

    const startRoundBtn = document.createElement("button");
    startRoundBtn.innerHTML = "清台";
    startRoundBtn.className = "clear-table";
    startRoundBtn.addEventListener("click", () => {
      this.gameController.resetTable();
    });
    roundMenu.appendChild(startRoundBtn);

    return roundMenu;
  }

  disconnectedCallback() {
    queueMicrotask(() => { if (!this.isConnected) {this.disposeDrag?.(); this.disposeLog?.();} });
  }

  getCurrentPlayerDom() {
    const playerKey = this.gameController.currentPlayer;
    return this.playerDoms.find((player) => player.dataset.key === playerKey);
  }

  getCardMenu() {
    const cardMenu = document.createElement("div");
    cardMenu.className = "card-menu hide";
    cardMenu.setAttribute("aria-label", "已选卡牌操作");
    const selectionLabel = document.createElement("span");
    selectionLabel.className = "selection-label";
    cardMenu.append(selectionLabel);

    const drawButton = document.createElement("button");
    drawButton.innerHTML = "摸";
    drawButton.addEventListener("click", () => {
      this.gameController.drawSelectedCards().catch(error => window.alert(error.message || '移动失败，请重试')); 
    });
    const discardButton = document.createElement("button");
    discardButton.innerHTML = "弃";
    discardButton.addEventListener("click", () => {
      this.gameController.discardSelectedCards().catch(error => window.alert(error.message || '移动失败，请重试')); 
    });
    const playButton = document.createElement("button");
    playButton.innerHTML = "出";
    playButton.addEventListener("click", () => {
      this.gameController.discardSelectedCards().catch(error => window.alert(error.message || '移动失败，请重试')); 
    });
    const showButton = document.createElement("button");
    showButton.innerHTML = "亮";
    showButton.addEventListener("click", () => {
      this.gameController.showSelectedCards().catch(error => window.alert(error.message || '更新失败，请重试'));
    });

    const cancelButton = document.createElement("button");
    cancelButton.textContent = "取消选择";
    cancelButton.addEventListener("click", () => {
      [...this.gameController.selectedCards].forEach(card => card.unselectCard());
    });

    cardMenu.appendChild(drawButton);
    cardMenu.appendChild(discardButton);

    cardMenu.appendChild(playButton);
    cardMenu.appendChild(showButton);
    cardMenu.appendChild(cancelButton);
    // cardMenu.appendChild(peakButton);
    return cardMenu;
  }

  initGame() {
    const container = this.shadowRoot.querySelector(".table-container");
    const tableDeckWidget = document.createElement("div");
    tableDeckWidget.classList.add("table-public");


    const cardMenu = this.getCardMenu();
    this.cardMenu = cardMenu;


    container.appendChild(tableDeckWidget);
    const opponentRail = document.createElement("div");
    opponentRail.className = "opponent-rail";
    opponentRail.setAttribute("aria-label", "其他玩家，按座次排列");
    container.appendChild(opponentRail);
    this.opponentRail = opponentRail;
    for (let i = 0; i < this.playerCount; i++) {
      const sgPlayer = new SgPlayer();
      sgPlayer.dataset.key = `p${i + 1}`;
      opponentRail.appendChild(sgPlayer);
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

    this.paiArea = new SgPaiArea();
    this.paiArea.init(
      ref(this.db, `game/${this.gameController.gameId}/tableDecks/pai`),
      this.gameController
    );
    const pilePanel = document.createElement("section");
    pilePanel.className = "deck-panel";
    pilePanel.innerHTML = "<header><strong>牌堆</strong><span class='pile-count'>0 张</span></header>";
    pilePanel.appendChild(this.paiArea);
    tableDeckWidget.appendChild(pilePanel);

    this.discardArea = document.createElement("sg-area");
    this.discardArea.init(
      ref(this.db, `game/${this.gameController.gameId}/tableDecks/discard`),
      this.gameController
    );
    const discardPanel = document.createElement("section");
    discardPanel.className = "public-cards-panel";
    discardPanel.innerHTML =
      "<header><strong>公共区 · 弃牌与结算</strong><span class='pool-count'>0 张</span></header>";
    discardPanel.append(this.cardMenu, this.discardArea);
    tableDeckWidget.appendChild(discardPanel);
    this.addEventListener('cards-updated', () => {
      pilePanel.querySelector('.pile-count').textContent = `${this.paiArea.cardArea.children.length} 张`;
      discardPanel.querySelector('.pool-count').textContent = `${this.discardArea.cardArea.children.length} 张`;
    });
  }

  lockPlayerSelection() {
    this.dataset.owner = gameController.userName;
    this.classList.add("player-seated");
    // assign slot
    const mainPlayer = this.gameController.currentPlayer; //p1
    this.shadowRoot.querySelector(".seat-label").textContent = `座次：${mainPlayer}`;
    const curPlayerNum = Number(mainPlayer[1]);
    this.playerDoms.forEach((player) => {
      for (let slot = 0; slot < this.playerCount; slot++) {
        player.classList.remove(`slot${slot}`);
      }
    });

    // Slots follow the table perimeter clockwise from the local player:
    // local -> four seats across the top from left to right -> right side.
    for (let offset = 0; offset < this.playerCount; offset++) {
      const seatNumber = ((curPlayerNum - 1 + offset) % this.playerCount) + 1;
      const playerDom = this.shadowRoot.querySelector(
        `sg-player[data-key="p${seatNumber}"]`
      );
      playerDom.classList.add(`slot${offset}`);
    }
    const currentPlayerDom = this.shadowRoot.querySelector(
      `sg-player[data-key="${mainPlayer}"]`
    );
    this.shadowRoot.querySelector(".table-container").appendChild(currentPlayerDom);
  }

  hideCardMenu() {
    if (!this.classList.contains("hide")) {
      this.cardMenu.classList.add("hide");
    }
  }

  showCardMenu() {
    this.cardMenu.querySelector(".selection-label").textContent = `已选 ${this.gameController.selectedCards.length} 张`;
    this.cardMenu.classList.remove("hide");
  }
}

export { SgTable };
customElements.define("sg-table", SgTable);
