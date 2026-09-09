function lockKey(resource) {
  return btoa(resource).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

export async function acquireLocks(resources, context) {
  const unique = [...new Set(resources)].sort();
  const token = context.newToken();
  const acquired = [];
  const expiresAt = Date.now() + context.ttlMs;
  try {
    for (const resource of unique) {
      const lockPath = `${context.lockRootPath}/${lockKey(resource)}`;
      const lockRef = context.makeRef(lockPath);
      const result = await context.runTransaction(lockRef, current => {
        if (current?.expiresAt > Date.now() && current.token !== token) return undefined;
        return {token, expiresAt};
      }, {applyLocally: false});
      if (!result.committed || result.snapshot.val()?.token !== token) throw Error('该区域正在被其他玩家操作，请重试');
      acquired.push(lockPath);
    }
    return {
      token,
      releasePatch: () => Object.fromEntries(acquired.map(path => [path, null])),
      release: () => acquired.length ? context.updateRoot(Object.fromEntries(acquired.map(path => [path, null]))) : Promise.resolve(),
    };
  } catch (error) {
    if (acquired.length) await context.updateRoot(Object.fromEntries(acquired.map(path => [path, null])));
    throw error;
  }
}
