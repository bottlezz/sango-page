import {
  getDatabase,
  get,
  update,
  set,
  ref,
  onValue,
  child,
  onChildAdded,
  onChildChanged,
} from "firebase/database";

import "./sgHpbar.js";
import commonCss from "./css/common.css";
import sgPlayerCss from "./css/sgPlayer.css";
import paiKu from "../data/pai.json";
import { judgmentEffects } from "../cardOrder.mjs";

const template = document.createElement("template");
template.innerHTML = `
<style>
${commonCss}
${sgPlayerCss}
</style>
<div name="widget" class="widget">
  <div name="player-game-area">
    <div class="open-info">
      <div class="player-info">
        <span class="player-key"> </span>
        <span class="player-name"></span>
        <span class="player-role">-</span><span class="player-role-marker">匿</span>
      </div> 
      <div class="hp-holder"><span class="hp"></span></div>
      <div name="deck-area" class="decks">
        <div class="hand-count"><span>2</span></div>
        <div class="area1-count"><span>2</span></div>
        <div class="area2-count"><span>2</span></div>
        <div class="jiang-pick"><span class="material-symbols-outlined">
        武将
        </span></div>
      </div>
    </div>
    <div class="pai-info">
    
    </div>
  </div>
  <div name="addtional-area">
    <div class="debuff-area">
      <span class="debuff debuff-0">翻面</span>
      <span class="debuff debuff-1">连环</span>
    </div>
  </div>
  <div class="player-toolbar" aria-label="本地玩家工具栏">
    <div class="hp-controls" aria-label="调整体力">
      <button type="button" data-action="hp-minus" aria-label="扣血" title="扣血"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10"/></svg></button>
      <button type="button" data-action="hp-plus" aria-label="加血" title="加血"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M8 3v10"/></svg></button>
    </div>
    <button type="button" data-debuff="0">翻面</button>
    <button type="button" data-debuff="1">连环</button>
    <button type="button" data-action="select-general">选将</button>
    <button type="button" data-action="hp-limit">血量上限</button>
  </div>
  <div name="drag-on-view">
    <div class="hand-drop">手牌</div>
    <div class="area1-drop">1区</div>
    <div class="area2-drop">2区</div>
    <div class="zhuang-drop">装备</div>
    <div class="pan-drop">判定</div>
  </div>
  <div name="click-on-view">
  </div> 
</div>
`;

class SgPlayer extends HTMLElement {
  playerRef;
  gameController;
  shadowRoot;
  debuff = "00";
  subs = [];
  constructor() {
    super();

    this.shadowRoot = this.attachShadow({ mode: "open" });
    let clone = template.content.cloneNode(true);

    this.shadowRoot.append(clone);
    this.widget = this.shadowRoot.querySelector("div[name='widget']");
    this.playerGameArea = this.shadowRoot.querySelector(
      `div[name="player-game-area"]`
    );
    const playerDeckAreaWdight = this.shadowRoot.querySelector(
      `div[name="deck-area"]`
    );

    this.addtionalArea = this.shadowRoot.querySelector(
      `div[name="addtional-area"]`
    );

    this.dragOnView = this.shadowRoot.querySelector(`div[name="drag-on-view"]`);
    this.clickOnView = this.shadowRoot.querySelector(
      `div[name="click-on-view"]`
    );

    const paiInfo = this.shadowRoot.querySelector(`.pai-info`);
    const openInfo = this.shadowRoot.querySelector(`.open-info`);
    const generalSlots = document.createElement("div");
    generalSlots.className = "general-slots";
    generalSlots.setAttribute("aria-label", "主将与副将");
    this.handArea = document.createElement("sg-area");

    this.handArea.classList.add("hide");

    this.jiangArea = document.createElement("sg-jiangarea");
    this.jiangArea.classList.add("general-selection");
    this.jiangArea.setAttribute("aria-label", "武将候选");
    this.generalSelectionDialog = document.createElement("div");
    this.generalSelectionDialog.className = "general-selection-dialog hide";
    const selectionHeader = document.createElement("header");
    selectionHeader.innerHTML =
      "<strong>选择武将</strong><span>七选二 · 双将3v3</span>";
    const selectionClose = document.createElement("button");
    selectionClose.type = "button";
    selectionClose.textContent = "关闭";
    selectionClose.addEventListener("click", () => {
      this.generalSelectionDialog.classList.add("hide");
      this.classList.remove("general-selection-open");
    });
    this.selectionLockButton = document.createElement("button");
    this.selectionLockButton.type = "button";
    this.selectionLockButton.className = "selection-lock";
    this.selectionLockButton.textContent = "锁定武将 0/2";
    this.selectionLockButton.disabled = true;
    this.selectionLockButton.addEventListener("click", async () => {
      this.selectionLockButton.disabled = true;
      const locked = await this.jiangArea.lockInSelected();
      if (locked) {
        this.generalSelectionDialog.classList.add("hide");
        this.classList.remove("general-selection-open");
      } else {
        this.selectionLockButton.disabled = false;
      }
    });
    this.jiangArea.addEventListener("general-selection-change", (event) => {
      const { count, locked } = event.detail;
      const generals = this.jiangArea.selectedGenerals.map(card =>
        card.shadowRoot.querySelector(".jiang-name")?.textContent || "未选择"
      );
      this.selectionStatus.textContent = `主将：${generals[0] || "未选择"}　/　副将：${generals[1] || "未选择"}`;
      this.selectionLockButton.textContent = locked
        ? "武将已锁定"
        : `锁定武将 ${count}/2`;
      this.selectionLockButton.disabled = locked || count != 2;
      this.generalSelectionDialog.classList.toggle("selection-locked", locked);
    });
    selectionHeader.append(selectionClose);
    const selectionFooter = document.createElement("footer");
    this.selectionStatus = document.createElement("span");
    this.selectionStatus.className = "selection-status";
    this.selectionStatus.textContent = "主将：未选择　/　副将：未选择";
    selectionFooter.append(this.selectionStatus, this.selectionLockButton);
    this.generalSelectionDialog.append(selectionHeader, this.jiangArea, selectionFooter);

    this.jiang1Area = document.createElement("sg-jiangarea");
    this.jiang1Area.classList.add("jiang-block");

    this.jiang2Area = document.createElement("sg-jiangarea");
    this.jiang2Area.classList.add("jiang-block");

    this.zhuangArea = document.createElement("sg-area");
    this.zhuangArea.setAttribute("aria-label", "装备区，最多四张");

    this.panArea = document.createElement("sg-area");
    this.judgmentArea = document.createElement("div");
    this.judgmentArea.className = "judgment-area";
    this.judgmentArea.setAttribute("aria-label", "判定区：乐不思蜀、兵粮寸断、闪电");
    this.judgmentArea.append(this.panArea);

    this.other1Area = document.createElement("sg-area");
    this.other2Area = document.createElement("sg-area");
    this.other1Area.setAttribute("aria-label", "区域一");
    this.other2Area.setAttribute("aria-label", "区域二");
    this.handArea.setAttribute("aria-label", "手牌区");
    this.other1Area.classList.add("hide");
    this.other2Area.classList.add("hide");

    playerDeckAreaWdight.append(this.zhuangArea);
    this.addtionalArea.append(this.judgmentArea);

    paiInfo.append(this.handArea);
    paiInfo.append(this.other1Area);
    paiInfo.append(this.other2Area);
    const areaHeading = document.createElement("header");
    areaHeading.className = "area-panel-heading";
    areaHeading.innerHTML = '<strong></strong><button type="button">关闭</button>';
    areaHeading.querySelector("button").addEventListener("click", () => paiInfo.hidePopover());
    paiInfo.prepend(areaHeading);
    const areaActions = document.createElement("footer");
    areaActions.className = "area-panel-actions";
    for (const [label, action] of [["拿取所选", "drawPai"], ["弃置所选", "discardPai"], ["亮出/暗置", "showPai"], ["取消选择", "unselectCard"]]) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.addEventListener("click", async () => {
        const cards = Object.values(this.inspectedArea?.cards || {});
        const selected = cards.filter(card => this.gameController.selectedCards.includes(card));
        try {
          if (action === 'drawPai') await this.gameController.drawSelectedCards(selected);
          else if (action === 'discardPai') await this.gameController.discardSelectedCards(selected);
          else selected.forEach(card => card[action]());
        } catch (error) { window.alert(error.message || '移动失败，请重试'); }
      });
      areaActions.append(button);
    }
    paiInfo.append(areaActions);
    paiInfo.addEventListener("dragstart", () => {
      if (paiInfo.matches(":popover-open")) paiInfo.hidePopover();
    });
    paiInfo.addEventListener('toggle', event => {
      if (event.newState === 'closed' && this.inspectedArea && !this.classList.contains('current-player')) {
        this.inspectedArea.stopCardsSubscription();
        this.inspectedArea = null;
      }
    });
    generalSlots.append(this.jiang1Area);
    generalSlots.append(this.jiang2Area);
    openInfo.append(generalSlots);

    this.widget.append(this.generalSelectionDialog);
    this.dropPicker = document.createElement("dialog");
    this.dropPicker.className = "drop-picker";
    this.dropPicker.setAttribute("aria-label", "选择卡牌放入区域");
    this.dropPicker.innerHTML = `<h3>选择放入区域</h3><p class="drop-summary"></p>
      <div class="drop-options">
        <button type="button" data-area="handArea">手牌</button>
        <button type="button" data-area="zhuangArea">装备</button>
        <button type="button" data-area="other1Area">区1</button>
        <button type="button" data-area="other2Area">区2</button>
      </div><div class="judgment-options">
        <p class="judgment-label">判定区：</p>
        <p class="judgment-summary"></p>
        <div class="drop-options">
          <button type="button" data-effect="乐不思蜀">乐不思蜀</button>
          <button type="button" data-effect="兵粮寸断">兵粮寸断</button>
          <button type="button" data-effect="闪电">闪电</button>
        </div>
      </div><p class="drop-error" role="status"></p>
      <button type="button" class="drop-cancel">取消</button>`;
    this.shadowRoot.append(this.dropPicker);
    this.dropPicker.querySelector(".drop-cancel").addEventListener("click", () => this.dropPicker.close());
    this.dropPicker.addEventListener("close", () => { this.pendingDrop = null; const done = this.dropComplete; this.dropComplete = null; done?.(Boolean(this.dropCommitted)); });
    this.dropPicker.addEventListener("cancel", (event) => {
      if (this.dropBusy) event.preventDefault();
    });
    this.dropPicker.querySelectorAll("[data-area]").forEach(button => {
      button.addEventListener("click", () => this.confirmPlayerDrop(button.dataset.area));
    });
    this.dropPicker.querySelectorAll('[data-effect]').forEach(button => {
      button.addEventListener('click', () => {
        const path = this.judgmentPaths[Object.keys(this.pendingEffects).length];
        this.pendingEffects[path] = button.dataset.effect;
        if (Object.keys(this.pendingEffects).length === this.judgmentPaths.length) {
          this.confirmPlayerDrop('panArea', this.pendingEffects);
        } else this.renderJudgmentChoices();
      });
    });
    // Capture before nested area handlers can move a card immediately.
    this.addEventListener("dragover", (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    });
    this.addEventListener("drop", (event) => {
      const path = event.dataTransfer.getData("text");
      if (path.includes("/jiang")) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      this.openDropPicker(path);
    }, true);

    this.shadowRoot
      .querySelector('[data-action="select-general"]')
      .addEventListener("click", () => this.openGeneralSelection());
    this.shadowRoot
      .querySelector('[data-action="hp-limit"]')
      .addEventListener("click", () => this.openMaxHpPicker());
    this.shadowRoot
      .querySelector('[data-action="hp-plus"]')
      .addEventListener("click", () => {
        if (!this.classList.contains("current-player") || !this.hpWc) return;
        this.hpWc.updateCurHp(Math.min(Number(this.hpWc.max), Number(this.hpWc.cur) + 1));
      });
    this.shadowRoot
      .querySelector('[data-action="hp-minus"]')
      .addEventListener("click", () => {
        if (!this.classList.contains("current-player") || !this.hpWc) return;
        this.hpWc.updateCurHp(Number(this.hpWc.cur) - 1);
      });

    // this.addEventListener("pointerenter", (e) => {
    //   console.log("touchoverpalyer");
    // });
  }

  assginAsCurrentPlayer() {
    this.gameController.currentPlayer = this.playerRef.key;
    this.classList.add("current-player");

    this.widget.classList.add("current-player");
    this.handArea.classList.add("current-player");
    this.other1Area.classList.add("current-player");
    this.other2Area.classList.add("current-player");
    this.zhuangArea.classList.add("current-player");
    this.jiangArea.classList.add("current-player");
    this.jiang1Area.classList.add("current-player");
    this.jiang2Area.classList.add("current-player");
    this.hpWc.classList.add("current-player");

    // General cards may have rendered before the player claimed their seat.
    // Propagate the local visibility state to those existing cards as well.
    [this.jiangArea, this.jiang1Area, this.jiang2Area].forEach((area) => {
      area.shadowRoot
        .querySelectorAll("sg-jiang")
        .forEach((card) => card.classList.add("current-player"));
    });
    [this.handArea, this.other1Area, this.other2Area, this.zhuangArea].forEach(
      (area) => {
        area.shadowRoot
          .querySelectorAll("sg-card")
          .forEach((card) => card.classList.add("current-player"));
      }
    );

    this.handArea.classList.remove("hide");
    this.other1Area.classList.remove("hide");
    this.other2Area.classList.remove("hide");

    [this.handArea, this.other1Area, this.other2Area].forEach(area => area.enableOverflowControls());

    this.gameController.lockPlayerSelection();
    this.playerGameArea.appendChild(this.zhuangArea);
    this.widget.appendChild(this.playerGameArea);
  }

  renderJiang() {}

  openGeneralSelection() {
    if (!this.classList.contains("current-player")) return;
    this.generalSelectionDialog.classList.remove("hide");
    this.classList.add("general-selection-open");
  }

  openMaxHpPicker() {
    if (!this.classList.contains("current-player")) return;
    this.hpWc.openMaxPicker();
  }

  init(playerRef, gameController) {
    this.playerRef = playerRef;
    this.gameController = gameController;
    this.widget.classList.remove("hide");

    const hpSpan = this.shadowRoot.querySelector(".hp");
    const hpWc = document.createElement("sg-hpbar");
    this.hpWc = hpWc;
    hpSpan.append(hpWc);
    hpWc.init(child(playerRef, "/hp"), gameController);

    const playerKeySpan = this.shadowRoot.querySelector(".player-key");
    const playerRoleSpan = this.shadowRoot.querySelector(".player-role");
    const playerNameItem = this.shadowRoot.querySelector(".player-name");
    playerKeySpan.innerHTML = this.playerRef.key;
    const subscribe = (target, callback) => this.subs.push(onValue(target, callback));

    subscribe(child(playerRef, "/name"), (snapshot) => {
      if (snapshot.exists()) {
        const playerName = snapshot.val();
        playerNameItem.textContent = playerName;
        playerNameItem.title = playerName;
        if (this.gameController.userName == playerName) {
          this.assginAsCurrentPlayer();
        }
      }
    });

    subscribe(child(playerRef, "/role"), (snapshot) => {
      if (snapshot.exists()) {
        const playerRole = snapshot.val();
        if (playerRole == "主" || playerRole == "内") {
          playerRoleSpan.classList.add("king");
        } else {
          playerRoleSpan.classList.remove("king");
        }
        playerRoleSpan.innerHTML = playerRole;
      }
    });

    String.prototype.replaceAt = function (index, replacement) {
      return (
        this.substring(0, index) +
        replacement +
        this.substring(index + replacement.length)
      );
    };

    subscribe(child(playerRef, "/debuff"), (snapshot) => {
      if (snapshot.exists()) {
        const debuff = snapshot.val();
        for (let i = 0; i < debuff.length; i++) {
          const debufSpan = this.shadowRoot.querySelector(`.debuff-${i}`);
          if (debuff[i] == "0") {
            debufSpan.classList.remove("on");
            this.debuff = this.debuff.replaceAt(i, "0");
          } else {
            if (!debufSpan.classList.contains("on")) {
              debufSpan.classList.add("on");
            }
            this.debuff = this.debuff.replaceAt(i, "1");
          }
          this.shadowRoot
            .querySelector(`[data-debuff="${i}"]`)
            .classList.toggle("active", debuff[i] != "0");
        }
        console.log(this.debuff);
      }
    });

    for (let i = 0; i < 2; i++) {
      this.shadowRoot
        .querySelector(`[data-debuff="${i}"]`)
        .addEventListener("click", () => {
          if (!this.classList.contains("current-player")) return;
          this.gameController.togglePlayerStatus(playerRef, i);
        });
    }

    this.shadowRoot
      .querySelector(".hand-count")
      .addEventListener("click", () => {
        this.openAreaPanel(this.handArea, "手牌");
      });
    this.shadowRoot
      .querySelector(".area1-count")
      .addEventListener("click", () => {
        this.openAreaPanel(this.other1Area, "区1");
      });
    this.shadowRoot
      .querySelector(".area2-count")
      .addEventListener("click", () => {
        this.openAreaPanel(this.other2Area, "区2");
      });

    // <div class="hand-count"><span>2</span></div>
    // <div class="area1-count"><span>2<span></div>
    // <div class="area2-count"><span>2<span></div>
    this.handCountSpan = this.shadowRoot.querySelector(`.hand-count > span`);
    this.area1CountSpan = this.shadowRoot.querySelector(`.area1-count > span`);
    this.area2CountSpan = this.shadowRoot.querySelector(`.area2-count > span`);

    const isLocalPlayer = playerRef.key === this.gameController.currentPlayer;
    const bindAreaCount = (area, span) => area.addEventListener('cards-updated', () => {
      const count = area.cardCount || 0;
      span.textContent = count;
      area.dataset.count = count;
    });
    if (isLocalPlayer) {
      bindAreaCount(this.handArea, this.handCountSpan);
      bindAreaCount(this.other1Area, this.area1CountSpan);
      bindAreaCount(this.other2Area, this.area2CountSpan);
    } else {
      [['hand',this.handArea,this.handCountSpan],['other1',this.other1Area,this.area1CountSpan],['other2',this.other2Area,this.area2CountSpan]]
        .forEach(([name,area,span]) => {
          const countRef = child(playerRef, `/areaCounts/${name}`);
          subscribe(countRef, async snapshot => {
          let count = Number(snapshot.val() || 0);
          if (!snapshot.exists()) {
            const legacySnapshot = await get(child(playerRef, `/${name}/cards`));
            count = Object.keys(legacySnapshot.val() || {}).length;
            await set(countRef, count);
          }
          span.textContent = count;
          area.dataset.count = count;
          });
        });
    }

    this.handArea.init(child(playerRef, `/hand`), this.gameController, {subscribe:isLocalPlayer});
    if (isLocalPlayer) {
      this.jiangArea.init(child(playerRef, `/jiang`), this.gameController);
    }
    this.jiang1Area.init(child(playerRef, `/jiang1`), this.gameController);
    this.zhuangArea.init(child(playerRef, `/zhuang`), this.gameController);
    this.panArea.init(child(playerRef, `/pan`), this.gameController);
    this.other1Area.init(child(playerRef, `/other1`), this.gameController, {subscribe:isLocalPlayer});
    this.other2Area.init(child(playerRef, `/other2`), this.gameController, {subscribe:isLocalPlayer});
    this.jiang2Area.init(child(playerRef, `/jiang2`), this.gameController);

    subscribe(child(playerRef, `/jiangLocked`), (snapshot) => {
      const locked = snapshot.exists() && snapshot.val() === true;
      this.jiangArea.setLocked(locked);
      this.jiang1Area.setLocked(locked);
      this.jiang2Area.setLocked(locked);
    });
  }

  disconnectedCallback() {
    queueMicrotask(() => {
      if (!this.isConnected) this.subs.splice(0).forEach(unsubscribe => unsubscribe());
    });
  }

  openAreaPanel(area, label) {
    if (this.classList.contains("current-player")) return;
    area.subscribeCards();
    this.inspectedArea = area;
    const panel = this.shadowRoot.querySelector(".pai-info");
    panel.setAttribute("popover", "auto");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", `${label}区域操作`);
    const name = this.shadowRoot.querySelector(".player-name").textContent || this.playerRef.key;
    panel.querySelector("strong").textContent = `${name} · ${label}`;
    [this.handArea, this.other1Area, this.other2Area].forEach(item => item.classList.toggle("hide", item !== area));
    panel.showPopover();
  }

  openDropPicker(path, paths = null, done = null) {
    const prefix = `game/${this.gameController.gameId}/`;
    if (!path.startsWith(prefix) || !/\/cards\/[^/]+$/.test(path) || this.dropPicker.open) return;
    const baseUrl = ref(this.gameController.db).toString();
    const selectedPaths = this.gameController.selectedCards.map(card =>
      card.cardRef.toString().replace(baseUrl, "")
    );
    this.pendingDrop = [...new Set(paths || (selectedPaths.includes(path) ? selectedPaths : [path]))];
    this.dropComplete = done; this.dropCommitted = false;
    const name = this.shadowRoot.querySelector(".player-name").textContent || this.playerRef.key;
    this.dropPicker.querySelector(".drop-summary").textContent = `将 ${this.pendingDrop.length} 张牌放入 ${name} 的哪个区域？`;
    this.dropPicker.querySelector(".drop-error").textContent = "";
    const judgmentPath = child(this.panArea.deckRef, '/cards').toString().replace(baseUrl, '');
    this.judgmentPaths = this.pendingDrop.filter(path => !path.startsWith(`${judgmentPath}/`));
    this.pendingEffects = {};
    this.dropPicker.querySelectorAll("button").forEach(button => { button.disabled = false; });
    this.renderJudgmentChoices();
    this.dropPicker.showModal();
  }

  renderJudgmentChoices() {
    const index = Object.keys(this.pendingEffects).length;
    this.dropPicker.querySelector('.judgment-summary').textContent = this.judgmentPaths.length > 1
      ? `第 ${index + 1} / ${this.judgmentPaths.length} 张牌（按拖入顺序选择）` : '';
    const occupied = [...this.panArea.cardArea.children].map(card => card.cardData?.judgmentEffect || paiKu[card.cardData?.id]?.name);
    this.dropPicker.querySelectorAll('[data-effect]').forEach(button => {
      button.disabled = !this.judgmentPaths.length || occupied.length + this.judgmentPaths.length > judgmentEffects.length
        || occupied.includes(button.dataset.effect) || Object.values(this.pendingEffects).includes(button.dataset.effect);
    });
  }

  async confirmPlayerDrop(areaName, effects = null) {
    if (!this.pendingDrop || this.dropBusy) return;
    const target = child(this[areaName].deckRef, "/cards");
    const baseUrl = ref(this.gameController.db).toString();
    const targetPath = target.toString().replace(baseUrl, "");
    const paths = this.pendingDrop.filter(path => !path.startsWith(`${targetPath}/`));
    if (areaName === 'panArea' && paths.length && !effects) {
      const count = this.panArea.cardArea.children.length;
      if (count + paths.length > judgmentEffects.length) {
        this.dropPicker.querySelector('.drop-error').textContent = '判定区每种效果最多一张，总共最多三张，请减少选牌。';
        return;
      }
      this.judgmentPaths = paths;
      this.pendingEffects = {};
      this.renderJudgmentChoices();
      return;
    }
    this.dropBusy = true;
    this.dropPicker.querySelectorAll("button").forEach(button => { button.disabled = true; });
    try {
      if (paths.length) await this.gameController.moveOrderedCards(paths, target, null, effects || {});
      this.dropCommitted = true;
      this.dropPicker.close();
    } catch (error) {
      console.error("Unable to move dropped cards", error);
      this.dropPicker.querySelector(".drop-error").textContent = error.message || "移动失败，请重试或取消。";
      this.pendingEffects = {};
    } finally {
      this.dropBusy = false;
      this.dropPicker.querySelectorAll("button").forEach(button => { button.disabled = false; });
      if (this.dropPicker.open) this.renderJudgmentChoices();
    }
  }

}

export { SgPlayer };
customElements.define("sg-player", SgPlayer);
