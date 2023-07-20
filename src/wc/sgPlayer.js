import {
  getDatabase,
  get,
  update,
  set,
  ref,
  onValue,
  child,
  onChildAdded,
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
    <p>
      <span class="player-key"></span>
      [<span class="player-role">-</span><span class="player-role-marker">匿</span>]
      <span>: </span>
      <span class="debuff debuff-0">[翻面]</span><span class="debuff debuff-1">[连环]</span>
      <span> - </span>
      <span class="player-name"></span> 
    </p>
    <p><span class="hp"></span></p>
    <div name="deck-area" calss="widget"></div>
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
  }

  assginAsCurrentPlayer() {
    this.gameController.currentPlayer = this.playerRef.key;
    this.classList.add("current-player");
    this.widget.classList.add("current-player");
    this.gameController.lockPlayerSelection();
  }

  init(playerRef, gameController) {
    this.playerRef = playerRef;
    this.gameController = gameController;
    this.widget.classList.remove("hide");

    const hpSpan = this.shadowRoot.querySelector(".hp");
    const hpWc = document.createElement("sg-hpbar");
    hpSpan.append(hpWc);
    hpWc.init(child(playerRef, "/hp"), gameController);

    const playerKeySpan = this.shadowRoot.querySelector(".player-key");
    const playerRoleSpan = this.shadowRoot.querySelector(".player-role");
    const playerNameSpan = this.shadowRoot.querySelector(".player-name");
    playerKeySpan.innerHTML = this.playerRef.key;

    onValue(child(playerRef, "/name"), (snapshot) => {
      if (snapshot.exists()) {
        const playerName = snapshot.val();
        playerNameSpan.innerHTML = playerName;
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

    const playerDeckAreaWdight = this.shadowRoot.querySelector(
      `div[name="deck-area"]`
    );

    this.handArea = document.createElement("sg-area");
    this.handArea.init(child(playerRef, `/hand`), this.gameController);

    this.jiangArea = document.createElement("sg-jiangarea");
    this.jiangArea.init(child(playerRef, `/jiang`), this.gameController);

    this.zhuangArea = document.createElement("sg-area");
    this.zhuangArea.init(child(playerRef, `/zhuang`), this.gameController);

    this.panArea = document.createElement("sg-area");
    this.panArea.init(child(playerRef, `/pan`), this.gameController);

    this.other1Area = document.createElement("sg-area");
    this.other1Area.init(child(playerRef, `/other1`), this.gameController);
    this.other2Area = document.createElement("sg-area");
    this.other2Area.init(child(playerRef, `/other2`), this.gameController);
    // this.other3Area = document.createElement("sg-area");
    // this.other3Area.init(child(playerRef, `/other3`), this.gameController);

    playerDeckAreaWdight.append(this.handArea);
    playerDeckAreaWdight.append(this.jiangArea);
    playerDeckAreaWdight.append(this.zhuangArea);
    playerDeckAreaWdight.append(this.panArea);
    playerDeckAreaWdight.append(this.other1Area);
    playerDeckAreaWdight.append(this.other2Area);
  }

  renderPlayer(playerName) {
    console.log(`render player: ${this.playerRef.key}`);
    const playerNameWidget = this.shadowRoot.querySelector(
      "label[name='player-name']"
    );
    playerNameWidget.innerHTML = `${this.playerRef.key} : ${playerName}`;
  }
}

export { SgPlayer };
customElements.define("sg-player", SgPlayer);
