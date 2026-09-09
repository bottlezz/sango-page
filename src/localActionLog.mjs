import {describeChanges} from './actionLog.mjs';

// Stable protocol codes must never be reassigned to a different meaning.
// They are enums rather than hashes so decoding is collision-free and debuggable.
export const ACTION_HINT_OPCODE = Object.freeze({
  DISCARD_OTHER:'d', DRAW_FOR_OTHER:'m', TRANSFER_CARD:'t', MOVE_OTHER:'o',
  DEAL_CARDS:'c', DEAL_GENERALS:'j', ASSIGN_ROLES:'i', SHUFFLE:'s',
  RESET_DECK:'r', RESET_TABLE:'x',
});

const VALID_OPCODES = new Set(Object.values(ACTION_HINT_OPCODE));
const NONCE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const AREA_NAMES = {hand:'手牌',zhuang:'装备区',pan:'判定区',other1:'区1',other2:'区2',jiang:'选将区',jiang1:'主将',jiang2:'副将',pai:'牌堆',paiBottom:'牌堆底部',discard:'公共区'};

export function createActionNonce() {
  const bytes = new Uint8Array(4);
  if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(bytes);
  else for (let i=0;i<bytes.length;i++) bytes[i]=Math.floor(Math.random()*256);
  return [...bytes].map(value=>NONCE_CHARS[value&63]).join('');
}

// Protocol v1 is "version|opcode|actor|...args|nonce". Target, count and card
// details are intentionally omitted when the atomic state diff can infer them.
// The nonce makes consecutive identical actions observable; it is not a history ID.
export function encodeActionHint(opcode, actorSeat, args=[], nonce=createActionNonce()) {
  if (!VALID_OPCODES.has(opcode)) throw Error('未知的日志操作码');
  const match=String(actorSeat||'').match(/^p(\d+)$/);
  const fields=['1',opcode,match?Number(match[1]).toString(36):'0',...args.map(String),nonce];
  if(fields.some(value=>!value||value.includes('|')))throw Error('无效的日志提示参数');
  return fields.join('|');
}

// Unknown protocol data safely falls back to an ordinary state-diff log.
export function decodeActionHint(value) {
  if(typeof value!=='string')return null;
  const fields=value.split('|'),actor=Number.parseInt(fields[2],36),nonce=fields.at(-1);
  if(fields.length<4||fields[0]!=='1'||!VALID_OPCODES.has(fields[1])||!Number.isInteger(actor)||actor<0||!/^[A-Za-z0-9_-]{4}$/.test(nonce))return null;
  return {opcode:fields[1],actorSeat:actor?`p${actor}`:null,args:fields.slice(3,-1),nonce};
}

function playerName(room,seat){const name=room?.[seat]?.name;return name&&name!=='empty'?name:seat;}
function areaName(room,path){const [owner,area]=path.split('/');return owner==='tableDecks'?(AREA_NAMES[area]||area):`${playerName(room,owner)} 的${AREA_NAMES[area]||area}`;}
function areas(room){
  const result={};
  for(const [owner,data] of Object.entries(room||{})){
    if(owner!=='tableDecks'&&!/^p\d+$/.test(owner))continue;
    for(const [area,value] of Object.entries(data||{}))if(AREA_NAMES[area])result[`${owner}/${area}`]=value?.cards||{};
  }
  return result;
}
function moves(before,after){
  const oldAreas=areas(before),newAreas=areas(after),removed=new Map(),added=new Map(),groups=new Map();
  const add=(map,id,item)=>map.set(id,[...(map.get(id)||[]),item]);
  for(const path of new Set([...Object.keys(oldAreas),...Object.keys(newAreas)])){
    const old=oldAreas[path]||{},next=newAreas[path]||{};
    Object.keys(old).filter(key=>!next[key]||next[key].id!==old[key].id).forEach(key=>add(removed,old[key].id,{path,key}));
    Object.keys(next).filter(key=>!old[key]||old[key].id!==next[key].id).forEach(key=>add(added,next[key].id,{path,key}));
  }
  for(const [id,sources] of removed){
    const targets=added.get(id)||[];
    for(let i=0;i<Math.min(sources.length,targets.length);i++){
      if(sources[i].path===targets[i].path)continue;
      const key=`${sources[i].path}|${targets[i].path}`;
      const group=groups.get(key)||{source:sources[i].path,target:targets[i].path,count:0};group.count++;groups.set(key,group);
    }
  }
  return [...groups.values()];
}

function hintedChanges(hint,before,after){
  const moved=moves(before,after);
  switch(hint.opcode){
    case ACTION_HINT_OPCODE.DISCARD_OTHER:return moved.filter(x=>/^p\d+\//.test(x.source)&&x.target==='tableDecks/discard').map(x=>`弃置了 ${playerName(after,x.source.split('/')[0])} 的 ${x.count} 张牌`);
    case ACTION_HINT_OPCODE.DRAW_FOR_OTHER:return moved.filter(x=>/^tableDecks\/(pai|paiBottom)$/.test(x.source)&&/^p\d+\/hand$/.test(x.target)).map(x=>`让 ${playerName(after,x.target.split('/')[0])} 摸了 ${x.count} 张牌`);
    case ACTION_HINT_OPCODE.TRANSFER_CARD:return moved.filter(x=>/^p\d+\//.test(x.source)&&/^p\d+\//.test(x.target)).map(x=>`将 ${x.count} 张牌交给 ${playerName(after,x.target.split('/')[0])}`);
    case ACTION_HINT_OPCODE.MOVE_OTHER:return moved.map(x=>`将 ${x.count} 张牌从 ${areaName(after,x.source)} 移到 ${areaName(after,x.target)}`);
    case ACTION_HINT_OPCODE.DEAL_CARDS:return ['为所有玩家发牌'];
    case ACTION_HINT_OPCODE.DEAL_GENERALS:return ['为所有玩家发将'];
    case ACTION_HINT_OPCODE.ASSIGN_ROLES:return ['重新分配了身份'];
    case ACTION_HINT_OPCODE.SHUFFLE:{const names={p:'牌堆',b:'牌堆底部',d:'公共区',h:'手牌',z:'装备区',n:'判定区',o:'卡牌区',j:'选将区'};return [`洗混了${names[hint.args[0]]||'卡牌'}`];}
    case ACTION_HINT_OPCODE.RESET_DECK:return ['重置并洗混了牌堆'];
    case ACTION_HINT_OPCODE.RESET_TABLE:return ['清空了桌面'];
    default:return [];
  }
}

export function createLocalLogEntry(before,after,timestamp=Date.now()){
  const hint=before?.runtime?.a!==after?.runtime?.a?decodeActionHint(after?.runtime?.a):null;
  if(hint){const changes=hintedChanges(hint,before,after);if(changes.length)return {actor:hint.actorSeat?playerName(after,hint.actorSeat):'玩家',timestamp,changes};}
  const changes=describeChanges(before,after);
  return changes.length?{actor:null,timestamp,changes}:null;
}
