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
import { commonStyle } from "../constants.js";
const template = document.createElement("template");
template.innerHTML = `
${commonStyle}
<div name="widget" class="widget hide">
  <div name="empty-info" class="hide">
    <p> this slot is empty, enter an unique name: <input type="text" name="username"> then, click <button name="join-btn">Join</button> to join</p>
  </div>
  <label name="player-name">pName</label>
  <button name="leave-btn">leave</button>
  <button name="rejoin-btn">rejoin</button>
  <div name="deck-area" calss="widget"></div>
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
    this.joinButton = this.shadowRoot.querySelector("button[name='join-btn']");
    this.leaveButton = this.shadowRoot.querySelector(
      "button[name='leave-btn']"
    );
    this.joinButton.addEventListener("click", () => {
      this.joinSeat();
    });
    this.leaveButton.addEventListener("click", () => {
      this.leaveSeat();
    });
    this.shadowRoot
      .querySelector("button[name='rejoin-btn']")
      .addEventListener("click", () => {
        this.reJoinSeat();
      });
    this.widget = this.shadowRoot.querySelector("div[name='widget']");
  }

  joinSeat() {
    const updates = {};
    updates["state"] = "on";
    updates["name"] = this.shadowRoot.querySelector(
      `input[name="username"]`
    ).value;
    this.gameController.currentPlayer = this.playerRef.key;
    this.widget.classList.add("current-player");
    update(this.playerRef, updates);
  }

  reJoinSeat() {
    this.gameController.currentPlayer = this.playerRef.key;
  }
  leaveSeat() {
    const updates = {};
    updates["state"] = "off";
    updates["name"] = "empty";
    this.gameController.currentPlayer = null;
    update(this.playerRef, updates);
  }

  init(playerRef, gameController) {
    this.playerRef = playerRef;
    this.gameController = gameController;
    this.widget.classList.remove("hide");

    onValue(playerRef, (snapshot) => {
      if (snapshot.exists()) {
        const playerData = snapshot.val();
        this.renderPlayer(playerData);
      }
    });

    this.handArea = document.createElement("sg-area");
    this.handArea.init(child(playerRef, `/hand`), this.gameController);
    const playerDeckAreaWdight = this.shadowRoot.querySelector(
      `div[name="deck-area"]`
    );
    playerDeckAreaWdight.appendChild(this.handArea);
  }

  renderPlayer(playerData) {
    console.log(`render player: ${this.playerRef.key}`);
    console.log(playerData);
    const doc = this.shadowRoot;
    const playerNameWidget = doc.querySelector("label[name='player-name'");
    playerNameWidget.innerHTML = playerData.name;
    if (playerData.state) {
      let emptyInfo = doc.querySelector("div[name='empty-info']");
      if (playerData.state == "off") {
        emptyInfo.classList.remove("hide");
      } else {
        emptyInfo.classList.add("hide");
      }
    }
  }
}

customElements.define("sg-player", SgPlayer);
