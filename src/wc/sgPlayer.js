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
  <div name="join-seat-menu" class="hide">
    click <button name="join-btn">Join</button> to take this seat</p>
  </div>
  <div name="player-game-area" class="hide">
    <p><label name="player-name">pName</label> </p>
    <p><span class="hp"></span></p>
    <div name="deck-area" calss="widget"></div>
  </div>
</div>

<div name="change-name-menu" class="hide">
    <label>New Name</label>
    <input type="text" id="newName" value="John">
  </div>
  <button name="update-name-btn" class="game-menu-button hide">Update</button>
</div>
<button name="change-name-btn" class="game-menu-button hide">Change Name</button>
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
  // attachChangeNameListener() {
  //   const changeNameBtn = this.shadowRoot.querySelector(
  //     `button[name="change-name-btn"]`
  //   );
  //   changeNameBtn.addEventListener("click", () => {
  //     const changeNameMenuDiv = this.shadowRoot.querySelector(
  //       `div[name="change-name-menu"]`
  //     );
  //     changeNameMenuDiv.classList.remove("hide");
  //   });
  //   const updateNameBtn = this.shadowRoot.querySelector(
  //     `button[name="update-name-btn"]`
  //   );
  //   updateNameBtn.addEventListener("click", () => {
  //     newName = this.shadowRoot.querySelector(`#newName`).value;
  //     this.gameController.userName = newName;
  //   });
  // }

  joinSeat() {
    const updates = {};
    updates["state"] = "on";
    updates["name"] = this.gameController.userName;
    this.gameController.currentPlayer = this.playerRef.key;
    this.widget.classList.add("current-player");
    update(this.playerRef, updates);
  }

  assginAsCurrentPlayer() {
    this.gameController.currentPlayer = this.playerRef.key;
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
    playerNameWidget.innerHTML = playerName;
    if (playerName == "empty") {
      // display join button
      const joinSeatMenuDiv = this.shadowRoot.querySelector(
        `div[name="join-seat-menu"]`
      );
      joinSeatMenuDiv.classList.remove("hide");

      this.joinButton = this.shadowRoot.querySelector(
        "button[name='join-btn']"
      );
      this.joinButton.addEventListener("click", () => {
        this.joinSeat();
      });
    } else {
      this.shadowRoot
        .querySelector(`div[name="player-game-area"]`)
        .classList.remove("hide");
      if (this.gameController.userName == playerName) {
        this.assginAsCurrentPlayer();
      }
    }
  }
}

customElements.define("sg-player", SgPlayer);
