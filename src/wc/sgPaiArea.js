import { SgArea } from "./sgArea.js";
import paiAreaCss from "./css/sgPaiArea.css";

class SgPaiArea extends SgArea {
  constructor() {
    super();

    this.style.append(paiAreaCss);
  }
}

export { SgPaiArea };
customElements.define("sg-paiarea", SgPaiArea);
