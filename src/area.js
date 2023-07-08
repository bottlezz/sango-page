import {
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

const template = document.createElement("template");
template.innerHTML = `
  <div name="widget" data-display="">
    <div name="card-area"> </div>
  </div>
`;

class SgArea extends HTMLElement {
  deckRef;
  shadowRoot;
  cardArea;
  cards = {};
  constructor() {
    super();
    this.shadowRoot = this.attachShadow({ mode: "open" });
    let clone = template.content.cloneNode(true);

    this.shadowRoot.append(clone);
    this.cardArea = this.shadowRoot.querySelector("div[name='card-area']");
  }

  init(deckRef, appData) {
    this.deckRef = deckRef;
    this.appData = appData;
    get(deckRef).then((snapshot) => {
      if (snapshot.exists()) {
        console.log(snapshot.val());
        // this.cards = { ...snapshot.val() };
      }
    });

    onChildAdded(deckRef + "/cards", (snapshot) => {
      console.log("on child added: ");
      console.log(snapshot.val());
    });
    onChildChanged(deckRef + "/cards", (snapshot) => {
      console.log("on child changed: ");
      console.log(snapshot.val());
    });
    onChildRemoved(deckRef + "/cards", (snapshot) => {
      console.log("on child changed: ");
      console.log(snapshot.val());
    });
  }
}

customElements.define("sg-area", SgArea);

export { SgArea };
