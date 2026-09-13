import {get, onDisconnect, onValue, push, ref, remove, set} from 'firebase/database';

export function installRoomPresence(controller) {
  const roomRef=ref(controller.db,`roomPresence/${controller.gameId}`);
  let stopped=false;
  let generation=0;
  let current=null;

  const unsubscribe=onValue(ref(controller.db,'.info/connected'),snapshot=>{
    const version=++generation;
    if(snapshot.val()!==true){current=null;return;}

    const connectionRef=push(roomRef);
    const disconnect=onDisconnect(connectionRef);
    current={connectionRef,disconnect};
    (async()=>{
      try{
        await disconnect.remove();
        if(stopped||version!==generation){await disconnect.cancel();return;}
        await set(connectionRef,true);
      }catch(error){
        if(current?.connectionRef===connectionRef)current=null;
        console.warn('Unable to register room presence',error);
      }
    })();
  });

  return ()=>{
    stopped=true;generation++;unsubscribe();
    const entry=current;current=null;
    if(!entry)return;
    entry.disconnect.cancel().catch(()=>{});
    remove(entry.connectionRef).catch(()=>{});
  };
}

export async function loadActiveRooms(db) {
  const snapshot=await get(ref(db,'roomPresence'));
  return Object.entries(snapshot.val()||{}).map(([roomId,connections])=>({
    roomId,
    connectionCount:Object.keys(connections||{}).length,
  })).filter(room=>room.connectionCount>0).sort((left,right)=>{
    const a=Number(left.roomId),b=Number(right.roomId);
    return Number.isFinite(a)&&Number.isFinite(b)?a-b:left.roomId.localeCompare(right.roomId);
  });
}
