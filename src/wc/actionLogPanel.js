import {ref, onValue} from 'firebase/database';
import {createCardReveals, createCardTransfers, createLocalLogEntry, mergeLocalLogEntries} from '../localActionLog.mjs';
import paiKu from '../data/pai.json';

const LOCAL_LOG_LIMIT = 500;

function appendLogText(target,value){
  const parts=String(value).split(/([♡♢♠♣])/);
  parts.forEach(part=>{
    if(!/^[♡♢♠♣]$/.test(part)){if(part)target.append(document.createTextNode(part));return;}
    const icon=document.createElement('span');
    icon.className='log-suit';
    icon.textContent=part;
    icon.setAttribute('aria-label',({'♡':'红桃','♢':'方片','♠':'黑桃','♣':'梅花'})[part]);
    target.append(icon);
  });
}

export function installActionLog(table) {
  const panel = document.createElement('section');
  panel.className = 'action-log';
  panel.setAttribute('aria-label', '行动日志');
  panel.innerHTML = `<header class="log-header"><strong>行动日志</strong><small class="log-latest">暂无记录</small><button type="button" aria-label="折叠行动日志" aria-expanded="true">−</button></header>
    <ol class="log-list" role="log" aria-live="polite" aria-relevant="additions" aria-label="玩家行动记录"></ol>
    <footer class="log-footer"><span>暂无本地记录</span></footer>`;
  table.shadowRoot.querySelector('.table-container').append(panel);
  table.actionLogPanel=panel;
  const list = panel.querySelector('.log-list'), count = panel.querySelector('.log-footer span');
  let latestEntry=null;
  panel.querySelector('button').addEventListener('click', event => {
    const collapsed = panel.classList.toggle('collapsed');
    event.currentTarget.textContent = collapsed ? '+' : '−';
    event.currentTarget.setAttribute('aria-expanded', String(!collapsed));
    event.currentTarget.setAttribute('aria-label', collapsed ? '展开行动日志' : '折叠行动日志');
  });
  const controller = table.gameController;
  let previousRoom = null;
  const unsubscribe = onValue(ref(controller.db, `game/${controller.gameId}`), snapshot => {
    const room=snapshot.val()||{};
    // First snapshot is baseline only: never replay state or a hint that existed
    // before this client entered the room.
    if(previousRoom===null){previousRoom=room;return;}
    const transfers=createCardTransfers(previousRoom,room,paiKu);
    const reveals=createCardReveals(previousRoom,room);
    const entry=createLocalLogEntry(previousRoom,room,Date.now(),paiKu,controller.currentPlayer);previousRoom=room;
    if(transfers.length)table.dispatchEvent(new CustomEvent('card-transfers',{detail:{transfers}}));
    if(reveals.length)table.dispatchEvent(new CustomEvent('card-reveals',{detail:{reveals}}));
    if(!entry)return;
    const atBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 30;
    const mergedEntry=mergeLocalLogEntries(latestEntry,entry);
    const displayedEntry=mergedEntry||entry;
    const row=mergedEntry&&list.lastElementChild?list.lastElementChild:document.createElement('li');
    if(!mergedEntry){row.className='log-entry';row.append(document.createElement('time'),document.createElement('p'));}
    const time=row.querySelector('time'),date=new Date(entry.timestamp);
    time.textContent=date.toLocaleTimeString('zh-CN',{hour12:false,hour:'2-digit',minute:'2-digit'});
    time.title=date.toLocaleString('zh-CN');time.dateTime=date.toISOString();
    const text=row.querySelector('p'),message=`${displayedEntry.changes.join('；')}。`;text.replaceChildren();
    if(displayedEntry.actor){const actor=document.createElement('b');actor.textContent=`${displayedEntry.actor} `;text.append(actor);}
    appendLogText(text,message);
    const latest=panel.querySelector('.log-latest');latest.replaceChildren();
    appendLogText(latest,`${displayedEntry.actor?`${displayedEntry.actor} `:''}${message}`);
    if(!mergedEntry)list.append(row);
    latestEntry=displayedEntry;
    while(list.children.length>LOCAL_LOG_LIMIT)list.firstElementChild.remove();
    count.textContent=`本地记录 · ${list.children.length} 条`;
    if (atBottom) list.scrollTop = list.scrollHeight;
  }, () => { count.textContent = '本地日志监听失败，请刷新重试'; });
  return () => {unsubscribe();panel.remove();table.actionLogPanel=null;};
}
