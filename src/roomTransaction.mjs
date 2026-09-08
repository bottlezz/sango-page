// Keep the complete room cached until the transaction (including retries) ends.
// A one-shot get() removes its listener before the transaction starts.
export async function runLoadedTransaction(roomRef, update, api) {
  let unsubscribe;
  try {
    await new Promise((resolve, reject) => {
      unsubscribe = api.onValue(roomRef, resolve, reject);
    });
    return await api.runTransaction(roomRef, update, {applyLocally: false});
  } finally {
    unsubscribe?.();
  }
}
