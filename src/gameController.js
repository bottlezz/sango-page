import {
  getDatabase,
  ref,
  child,
  get,
  push,
  update,
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
    // delete from game/1/p1/shoupai/cards/key
    // add to game/1/p2/shoupai/cards with "/newKey" and value
    console.log(`move item from: ${fromPath} to: ${toPath}`);
    let dbRef = ref(this.db);
    get(child(dbRef, fromPath)).then((snapshot) => {
      if (snapshot.exists()) {
        const value = snapshot.val();
        // console.log("mpove value :");
        // console.log(value);
        const newKey = push(child(dbRef, toPath)).key;
        // console.log(newKey);
        const updates = {};
        updates[fromPath] = null;
        updates[toPath + "/" + newKey] = value;
        update(dbRef, updates);
      }
    });
  }
}

export { gameController };
