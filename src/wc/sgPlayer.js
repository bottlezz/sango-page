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
<div name="widget" class="widget hide">
  <div name="player-game-area" class="hide">
    <p><label name="player-name">pName</label> </p>
    <p><span class="hp"></span></p>
    <div name="deck-area" calss="widget"></div>
  </div>
</div>
`;

class SgPlayer extends HTMLElement {
  playerRef;
  gameController;
  shadowRoot;
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

    onValue(child(playerRef, "/name"), (snapshot) => {
      if (snapshot.exists()) {
        const playerName = snapshot.val();
        this.renderPlayer(playerName);
      }
    });

    onValue(child(playerRef, "/hp"), (snapshot) => {});

    const playerDeckAreaWdight = this.shadowRoot.querySelector(
      `div[name="deck-area"]`
    );

    this.handArea = document.createElement("sg-area");
    this.handArea.init(child(playerRef, `/hand`), this.gameController);

    this.jiangArea = document.createElement("sg-jiangarea");
    this.jiangArea.init(child(playerRef, `/jiang`), this.gameController);
    playerDeckAreaWdight.append(this.handArea);
    playerDeckAreaWdight.append(this.jiangArea);
  }

  renderPlayer(playerName) {
    console.log(`render player: ${this.playerRef.key}`);
    const playerNameWidget = this.shadowRoot.querySelector(
      "label[name='player-name']"
    );
    playerNameWidget.innerHTML = `${this.playerRef.key} : ${playerName}`;
    this.shadowRoot
      .querySelector(`div[name="player-game-area"]`)
      .classList.remove("hide");
    if (this.gameController.userName == playerName) {
      this.assginAsCurrentPlayer();
    }
    
  }
}

export {SgPlayer};
customElements.define("sg-player", SgPlayer);
