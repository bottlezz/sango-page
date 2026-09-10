// One pointer-driven drag session per table. Card geometry is read once per
// session, and invalidated only by layout/data changes, not every pointer event.
export function installCardDrag(table) {
  const controller = table.gameController;
  let drag, frame = 0, suppressUntil = 0, highlighted;
  const abort = new AbortController(), options = {signal: abort.signal};
  const status = document.createElement('div');
  status.setAttribute('role', 'status');
  status.style.cssText = 'position:fixed;bottom:12px;left:50%;transform:translateX(-50%);z-index:10002;padding:8px 16px;border-radius:8px;background:#103a2f;color:#f4ead2;display:none';
  document.body.append(status);
  let statusTimer;
  function announce(text) { status.textContent = text; status.style.display = 'block'; clearTimeout(statusTimer); statusTimer = setTimeout(() => status.style.display = 'none', 4000); }
  function mobileDragDisabled() { return table.shadowRoot.querySelector('.table-container')?.classList.contains('mobile-layout-active'); }
  function areaOf(card) { return card.getRootNode().host; }
  function hit(x,y) {
    let element = document.elementFromPoint(x,y);
    while (element?.shadowRoot) { const inner = element.shadowRoot.elementFromPoint(x,y); if (!inner || inner === element) break; element = inner; }
    let area, player;
    while (element) {
      if (element.cardArea && element.cardsRef) area ||= element;
      if (element.localName === 'sg-player') player = element;
      element = element.parentElement || element.getRootNode().host;
    }
    if (area && drag.cards.every(card => areaOf(card) === area)) return {blocked:true};
    if (player) {
      // Local area boxes are explicit drop targets; opponents still use the picker.
      if (player.dataset.key === controller.currentPlayer
        && [player.handArea, player.zhuangArea, player.other1Area, player.other2Area].includes(area)) return {area};
      return {player};
    }
    return area?.isTable ? {area} : {};
  }
  function setHighlight(element) {
    if (element === highlighted) return;
    highlighted?.classList.remove('drag-target'); element?.classList.add('drag-target'); highlighted = element;
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(tick); }
  function start() {
    const d = drag, r = d.card.getBoundingClientRect();
    d.active = true; d.origin = r; d.dx=d.startX-r.left; d.dy=d.startY-r.top;
    const selected = controller.selectedCards.includes(d.card) ? [...controller.selectedCards] : [d.card];
    d.cards = selected.sort((a,b) => areaOf(a)===areaOf(b)?Number(a.style.order)-Number(b.style.order):0);
    d.paths = d.cards.map(card => card.dataset.path);
    d.ghost = document.createElement('div');
    d.ghost.style.cssText = `position:fixed;left:0;top:0;margin:0;padding:0;border:0;overflow:visible;background:transparent;pointer-events:none;z-index:10000;width:${r.width}px;height:${r.height}px;filter:drop-shadow(0 10px 9px #0008)`;
    const face = document.createElement('div'); face.className=d.card.className;
    face.style.cssText=`display:block;width:${r.width}px;height:${r.height}px;transform:rotate(-5deg) scale(1.1);pointer-events:none`;
    face.attachShadow({mode:'open'}).innerHTML=d.card.shadowRoot.innerHTML;
    face.shadowRoot.querySelector('.card-block').classList.remove('selected');
    d.ghost.append(face);
    if (d.cards.length>1) {
      face.style.boxShadow='4px 4px 0 #ae8b50,8px 8px 0 #856735';
      const badge=document.createElement('span');badge.textContent=d.cards.length;
      badge.style.cssText='position:absolute;right:-15px;top:-12px;border-radius:12px;background:#e2b84b;color:#241800;padding:3px 7px;font:bold 12px sans-serif';d.ghost.append(badge);
    }
    document.body.append(d.ghost);
    // Top-layer ghost remains visible over an open opponent-area popover.
    d.ghost.setAttribute('popover','manual');d.ghost.showPopover();
    d.cards.forEach(card=>card.classList.add('drag-source'));
    const popover=d.card.getRootNode().host?.getRootNode().querySelector?.('.pai-info:popover-open');
    popover?.hidePopover();
  }
  function tick() {
    frame=0; const d=drag;if(!d?.active||d.waiting)return;
    if(mobileDragDisabled()){finish(false);return;}
    const target=hit(d.x,d.y);d.target=target;setHighlight(target.player||target.area);
    d.ghost.style.transform=`translate3d(${d.x-d.dx}px,${d.y-d.dy}px,0)`;
    if(d.released)drop();
  }
  async function drop() {
    const d=drag;d.waiting=true;
    if(d.target.blocked){finish(false);return;}
    if(d.target.player){
      const player=d.target.player;
      player.openDropPicker(d.paths[0],d.paths,ok=>finish(ok));
      if(!player.dropPicker.open)finish(false);
      return;
    }
    if(!d.target.area){finish(false);return;}
    const paths=d.paths.filter((path,index)=>areaOf(d.cards[index])!==d.target.area);
    if(!paths.length){finish(false);return;}
    try {await controller.moveOrderedCards(paths,d.target.area.cardsRef);await finish(true);}
    catch(error){announce(error.message || '移动失败，请重试');await finish(false);}
  }
  async function finish(ok=false) {
    const d=drag;if(!d)return;drag=null;cancelAnimationFrame(frame);frame=0;setHighlight(null);
    if(!d.active)return;
    if(ok){d.cards.forEach(card=>{if(card.isConnected)card.unselectCard();});}
    const end=ok?{opacity:0}:{transform:`translate3d(${d.origin.left}px,${d.origin.top}px,0)`};
    try {await d.ghost.animate([{transform:d.ghost.style.transform,opacity:1},end],{duration:ok?140:220,easing:'ease-out',fill:'forwards'}).finished;}finally{d.cards.forEach(card=>card.classList.remove('drag-source'));d.ghost.remove();}
  }
  table.addEventListener('pointerdown',e=>{
    const card=e.composedPath().find(node=>node.localName==='sg-card');
    if(!card||e.button!==0||drag||mobileDragDisabled())return;
    const area=areaOf(card),player=area?.getRootNode()?.host;
    if(player?.localName==='sg-player'
      && player.dataset.key!==controller.currentPlayer
      && ['zhuang-area','pan-area'].includes(area?.areaType))return;
    drag={card,id:e.pointerId,startX:e.clientX,startY:e.clientY};
  },options);
  document.addEventListener('pointermove',e=>{
    if(!drag||drag.waiting||e.pointerId!==drag.id)return;
    if(!drag.active&&Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>6){
      window.getSelection?.().removeAllRanges();
      start();
    }
    if(drag.active){e.preventDefault();drag.x=e.clientX;drag.y=e.clientY;schedule();}
  },{...options,passive:false});
  document.addEventListener('pointerup',e=>{if(!drag||drag.waiting||e.pointerId!==drag.id)return;if(!drag.active){drag=null;return;}suppressUntil=Date.now()+400;drag.x=e.clientX;drag.y=e.clientY;drag.released=true;schedule();},options);
  table.addEventListener('click',e=>{if(Date.now()<suppressUntil){e.preventDefault();e.stopImmediatePropagation();}},{...options,capture:true});
  document.addEventListener('pointercancel',()=>{if(!drag?.waiting)finish(false);},options);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&drag&&!drag.waiting){e.preventDefault();finish(false);}},{...options,capture:true});
  window.addEventListener('blur',()=>{if(!drag?.waiting)finish(false);},options);
  window.addEventListener('resize',()=>{if(drag)schedule();},options);
  document.addEventListener('scroll',()=>{if(drag?.active&&!drag.waiting)schedule();},{...options,capture:true,passive:true});
  return ()=>{abort.abort();finish(false);status.remove();clearTimeout(statusTimer);};
}
