import { getDatabase, get, update, set, ref, onValue } from "firebase/database";

const template = document.createElement("template");
template.innerHTML = `
  <style>
  div[data-display="hide"] {
      display: none
  }
  </style>
  <div name="widget" data-display="hide">
  <slot name="content"></slot>
  <div name="empty-info" data-display="hide">
  <p> this slot is empty, click <button name="join-btn">Join</button> to join</p>
  </div>
  <label name="player-name">pName</label>
    <input type="text" id="gameId"><br><br>

    <button name="leave-btn">leave</button>
  </div>
`;

class Player extends HTMLElement {
  playerRef;
  appData;
  shadowRoot;
  constructor() {
    super();
    this.shadowRoot = this.attachShadow({ mode: "open" });
    // let div = document.createElement('div');
    // div.textContent = 'Big Bang Theory';
    // shadowRoot.append(div);
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
    this.widget = this.shadowRoot.querySelector("div[name='widget']");
    console.log(this.widget.dataset.display);
  }

  joinSeat() {
    const updates = {};
    updates["state"] = "on";
    update(this.playerRef, updates);
  }
  leaveSeat() {
    const updates = {};
    updates["state"] = "off";
    update(this.playerRef, updates);
  }

  init(playerRef, appData) {
    this.playerRef = playerRef;
    this.appData = appData;
    this.widget.dataset.display = "";
    get(playerRef).then((snapshot) => {
      console.log(snapshot.val());
    });
    onValue(playerRef, (snapshot) => {
      const playerData = snapshot.val();
      this.renderPlayer(playerData);
    });
    this.db = db;
  }

  renderPlayer(playerData) {
    console.log("render player");
    const doc = this.shadowRoot;
    const playerNameWidget = doc.querySelector("label[name='player-name'");
    playerNameWidget.innerHTML = playerData.name;
    if (playerData.state) {
      let emptyInfo = doc.querySelector("div[name='empty-info']");
      if (playerData.state == "off") {
        emptyInfo.dataset.display = "";
      } else {
        emptyInfo.dataset.display = "hide";
      }
    }
  }
}

customElements.define("sg-player", Player);
