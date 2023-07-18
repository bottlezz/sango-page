import {
  child,
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

import "./sgCard.js";
import { SgArea } from "./sgArea.js";

class SgPaiArea extends SgArea {
  constructor() {
    super();
  }
}
