import {
  getDatabase,
  ref,
  child,
  get,
  remove,
  set,
  onValue,
} from "firebase/database";
class gameController {
  db;
  constructor(db) {
    this.db = db;
  }

  moveItem(fromPath, toPath) {
    // delete from game/1/p1/shoupai/key
    // add to game/1/p2/shoupai/ with value
    let dbRef = ref(this.db);
    get(child(dbRef, fromPath)).then((snapshot) => {
      if (snapshot.exists()) {
        dbRef.remove;
      }
    });
  }
}
