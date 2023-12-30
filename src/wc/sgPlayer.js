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
        <span class="player-key"> </span><span>: </span>
        [<span class="player-role">-</span><span class="player-role-marker">匿</span>]
        <span class="player-name"></span>
      </div> 
      <div class="hp-holder"><span class="hp"></span></div>
      <div name="deck-area" class="decks">
        <div class="hand-count"><span>2</span></div>
        <div class="area1-count"><span>2<span></div>
        <div class="area2-count"><span>2<span></div>
        <div class="jiang-pick"><span class="material-symbols-outlined">
        group
        </span></div>
      </div>
    </div>
    <div class="pai-info">
    
    </div>
  </div>
  <div name="addtional-area">
    <div class="debuff-area">
      <span class="debuff debuff-0 "><span class="material-symbols-outlined">
      flip_camera_android
      </span></span>
      <span class="debuff debuff-1"><span class="material-symbols-outlined">
      link
      </span></span>
    </div>
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
    this.handArea = document.createElement("sg-area");

    this.handArea.classList.add("hide");

    this.jiangArea = document.createElement("sg-jiangarea");
    this.jiangArea.classList.add("hide");

    this.jiang1Area = document.createElement("sg-jiangarea");
    this.jiang1Area.classList.add("jiang-block");

    this.jiang2Area = document.createElement("sg-jiangarea");
    this.jiang2Area.classList.add("jiang-block");

    this.zhuangArea = document.createElement("sg-area");

    this.panArea = document.createElement("sg-area");

    this.other1Area = document.createElement("sg-area");
    this.other2Area = document.createElement("sg-area");
    this.other1Area.classList.add("hide");
    this.other2Area.classList.add("hide");

    playerDeckAreaWdight.append(this.zhuangArea);
    this.addtionalArea.append(this.panArea);

    paiInfo.append(this.handArea);
    paiInfo.append(this.other1Area);
    paiInfo.append(this.other2Area);
    openInfo.append(this.jiang1Area);
    openInfo.append(this.jiang2Area);

    this.widget.append(this.jiangArea);
    this.addEventListener("dragenter", (e) => {
      e.preventDefault();
      this.dragOnView.classList.add("drag-over");
    });

    this.addEventListener("dragleave", (e) => {
      this.dragOnView.classList.remove("drag-over");
    });

    this.addEventListener("drop", (e) => {
      this.dragOnView.classList.remove("drag-over");
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
    this.jiangArea.classList.add("current-player");
    this.jiang1Area.classList.add("current-player");
    this.jiang2Area.classList.add("current-player");
    this.hpWc.classList.add("current-player");

    this.handArea.classList.remove("hide");
    this.other1Area.classList.remove("hide");
    this.other2Area.classList.remove("hide");

    this.gameController.lockPlayerSelection();
    this.widget.appendChild(this.playerGameArea);
  }

  renderJiang() {}

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

    onValue(child(playerRef, "/name"), (snapshot) => {
      if (snapshot.exists()) {
        const playerName = snapshot.val();
        playerNameItem.innerHTML = playerName;
        if (this.gameController.userName == playerName) {
          this.assginAsCurrentPlayer();
        }
      }
    });

    onValue(child(playerRef, "/role"), (snapshot) => {
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

    onValue(child(playerRef, "/debuff"), (snapshot) => {
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
        }
        console.log(this.debuff);
      }
    });

    for (let i = 0; i < 2; i++) {
      this.shadowRoot
        .querySelector(`.debuff-${i}`)
        .addEventListener("click", () => {
          if (this.debuff[i] == "0") {
            this.debuff = this.debuff.replaceAt(i, "1");
          } else {
            this.debuff = this.debuff.replaceAt(i, "0");
          }
          console.log("debuff click");
          set(child(playerRef, "/debuff"), this.debuff);
        });
    }

    this.shadowRoot
      .querySelector(".jiang-pick")
      .addEventListener("click", () => {
        this.jiangArea.classList.toggle("hide");
      });

    this.shadowRoot
      .querySelector(".hand-count")
      .addEventListener("click", () => {
        this.handArea.classList.toggle("hide");
        this.other1Area.classList.add("hide");
        this.other2Area.classList.add("hide");
      });
    this.shadowRoot
      .querySelector(".area1-count")
      .addEventListener("click", () => {
        this.handArea.classList.add("hide");
        this.other1Area.classList.toggle("hide");
        this.other2Area.classList.add("hide");
      });
    this.shadowRoot
      .querySelector(".area2-count")
      .addEventListener("click", () => {
        this.handArea.classList.add("hide");
        this.other1Area.classList.add("hide");
        this.other2Area.classList.toggle("hide");
      });

    this.addDragAndDrop(
      this.shadowRoot.querySelector(".hand-count"),
      "handArea"
    );
    this.addDragAndDrop(
      this.shadowRoot.querySelector(".area1-count"),
      "other1Area"
    );
    this.addDragAndDrop(
      this.shadowRoot.querySelector(".area2-count"),
      "other2Area"
    );

    const areas = ["hand", "area1", "area2", "pan", "zhuang"];
    areas.forEach((element) => {
      this.addDragAndDrop(
        this.shadowRoot.querySelector(`.${element}-drop`),
        `${element}Area`
      );
    });

    // <div class="hand-count"><span>2</span></div>
    // <div class="area1-count"><span>2<span></div>
    // <div class="area2-count"><span>2<span></div>
    this.handCountSpan = this.shadowRoot.querySelector(`.hand-count > span`);
    this.area1CountSpan = this.shadowRoot.querySelector(`.area1-count > span`);
    this.area2CountSpan = this.shadowRoot.querySelector(`.area2-count > span`);

    onValue(child(playerRef, `/hand`), () => {
      this.handCountSpan.innerHTML = this.handArea.cardCount;
    });

    onValue(child(playerRef, `/other1`), () => {
      this.area1CountSpan.innerHTML = this.other1Area.cardCount;
    });

    onValue(child(playerRef, `/other2`), () => {
      this.area2CountSpan.innerHTML = this.other2Area.cardCount;
    });

    this.handArea.init(child(playerRef, `/hand`), this.gameController);
    this.jiangArea.init(child(playerRef, `/jiang`), this.gameController);
    this.jiang1Area.init(child(playerRef, `/jiang1`), this.gameController);
    this.zhuangArea.init(child(playerRef, `/zhuang`), this.gameController);
    this.panArea.init(child(playerRef, `/pan`), this.gameController);
    this.other1Area.init(child(playerRef, `/other1`), this.gameController);
    this.other2Area.init(child(playerRef, `/other2`), this.gameController);
    this.jiang2Area.init(child(playerRef, `/jiang2`), this.gameController);
  }

  addDragAndDrop(item, name) {
    item.addEventListener("drop", (e) => {
      e.preventDefault();
      console.log("areaDrop");
      const fromPath = e.dataTransfer.getData("text");

      // is in selected wc
      let isSelected = false;
      for (let i = 0; i < this.gameController.selectedCards.length; i++) {
        const wc = this.gameController.selectedCards[i];
        if (wc.cardRef.toString().includes(fromPath)) {
          isSelected = true;
          break;
        }
      }
      let deckRef = null;
      if (name == "handArea") {
        deckRef = this.handArea.deckRef;
      } else if (name == "other1Area") {
        deckRef = this.other1Area.deckRef;
      } else if (name == "other2Area") {
        deckRef = this.other2Area.deckRef;
      } else if (name == "zhuangArea") {
        deckRef = this.zhuangArea.deckRef;
      } else if (name == "panArea") {
        deckRef = this.panArea.deckRef;
      }

      if (!isSelected) {
        this.gameController.moveCardFromPathToRef(
          fromPath,
          child(deckRef, "/cards")
        );
      } else {
        this.gameController.dropSeletedCards(child(deckRef, "/cards"));
      }
    });
    item.addEventListener("dragover", (e) => {
      e.preventDefault();
    });
  }
}

export { SgPlayer };
customElements.define("sg-player", SgPlayer);
