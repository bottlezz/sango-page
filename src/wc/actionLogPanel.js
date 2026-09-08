import {ref, onValue} from 'firebase/database';

export function installActionLog(table) {
  const panel = document.createElement('section');
  panel.className = 'action-log';
  panel.setAttribute('aria-label', '行动日志');
  panel.innerHTML = `<header class="log-header"><strong>行动日志</strong><small>实时同步</small><button type="button" aria-label="折叠行动日志" aria-expanded="true">−</button></header>
    <ol class="log-list" role="log" aria-live="polite" aria-relevant="additions" aria-label="玩家行动记录"></ol>
    <footer class="log-footer"><span>暂无记录</span></footer>`;
  table.shadowRoot.querySelector('.table-container').append(panel);
  const list = panel.querySelector('.log-list'), count = panel.querySelector('.log-footer span');
  const rows = new Map();
  panel.querySelector('button').addEventListener('click', event => {
    const collapsed = panel.classList.toggle('collapsed');
    event.currentTarget.textContent = collapsed ? '+' : '−';
    event.currentTarget.setAttribute('aria-expanded', String(!collapsed));
    event.currentTarget.setAttribute('aria-label', collapsed ? '展开行动日志' : '折叠行动日志');
  });
  const controller = table.gameController;
  const unsubscribe = onValue(ref(controller.db, `game/${controller.gameId}/actionLogs`), snapshot => {
    const entries = Object.entries(snapshot.val() || {}).sort((a,b) => a[0].localeCompare(b[0]));
    const atBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 30;
    const keys = new Set(entries.map(([key])=>key));
    for (const [key,row] of rows) if (!keys.has(key)) {row.remove(); rows.delete(key);}
    for (const [key,entry] of entries) {
      if (rows.has(key)) continue;
      const row = document.createElement('li');row.className = 'log-entry';
      const time = document.createElement('time');
      const date = new Date(typeof entry.timestamp === 'number' ? entry.timestamp : Date.now());
      time.textContent = date.toLocaleTimeString('zh-CN',{hour12:false,hour:'2-digit',minute:'2-digit'});
      time.title = date.toLocaleString('zh-CN');time.dateTime = date.toISOString();
      const text = document.createElement('p'), actor = document.createElement('b');
      actor.textContent = `${entry.actor || '玩家'} `;
      text.append(actor, document.createTextNode(`${entry.action ? entry.action + '：' : ''}${(entry.changes || []).join('；')}`));
      row.append(time,text);rows.set(key,row);list.append(row);
    }
    count.textContent = entries.length ? `最近 ${entries.length} 条 · 最多保留 500 条` : '暂无记录';
    if (atBottom) list.scrollTop = list.scrollHeight;
  }, () => { count.textContent = '日志加载失败，请刷新重试'; });
  return () => {unsubscribe();panel.remove();};
}
