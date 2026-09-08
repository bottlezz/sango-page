// One pointer-driven drag session per table. Card geometry is read once per
// session, and invalidated only by layout/data changes, not every pointer event.
export function installCardDrag(table) {
  const controller = table.gameController;
  let drag, frame = 0, suppressUntil = 0, highlighted, shifted;
  const abort = new AbortController(), options = {signal: abort.signal};
  const marker = document.createElement('div');
  marker.style.cssText = 'position:fixed;pointer-events:none;z-index:10001;width:3px;background:#ffe59a;border-radius:3px;box-shadow:0 0 6px #e2b84b;display:none';
  document.body.append(marker);
  const status = document.createElement('div');
  status.setAttribute('role', 'status');
  status.style.cssText = 'position:fixed;bottom:12px;left:50%;transform:translateX(-50%);z-index:10002;padding:8px 16px;border-radius:8px;background:#103a2f;color:#f4ead2;display:none';
  document.body.append(status);
  let statusTimer;
  function announce(text) { status.textContent = text; status.style.display = 'block'; clearTimeout(statusTimer); statusTimer = setTimeout(() => status.style.display = 'none', 4000); }
  function areaOf(card) { return card.getRootNode().host; }
  function orderedCards(area) { return [...area.cardArea.children].filter(card => card.cardRef).sort((a,b) => Number(a.style.order)-Number(b.style.order)); }
  function allowsReorder(area) { return !['zhuang-area', 'pan-area'].includes(area?.areaType); }
  function hit(x,y) {
    let element = document.elementFromPoint(x,y);
    while (element?.shadowRoot) { const inner = element.shadowRoot.elementFromPoint(x,y); if (!inner || inner === element) break; element = inner; }
    let area, player;
    while (element) {
      if (element.cardArea && element.cardsRef) area ||= element;
      if (element.localName === 'sg-player') player = element;
      element = element.parentElement || element.getRootNode().host;
    }
    if (player) {
      // Local area boxes are explicit drop targets; opponents still use the picker.
      if (area && drag.cards.every(card => areaOf(card) === area)) {
        return allowsReorder(area) ? {area} : {blocked:true};
      }
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
  function setShift(card) {
    if (card === shifted) return;
    shifted?.classList.remove('insert-left'); card?.classList.add('insert-left'); shifted = card;
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(tick); }
  function measure(area) {
    const view = area.cardArea, r = view.getBoundingClientRect(), moving = new Set(drag.cards);
    return {view, left:r.left+scrollX, top:r.top+scrollY, width:r.width, height:r.height,
      maxX:view.scrollWidth-view.clientWidth, maxY:view.scrollHeight-view.clientHeight,
      cards:orderedCards(area).filter(card => !moving.has(card)).map(card => {
        const rect = card.getBoundingClientRect(), dx = parseFloat(getComputedStyle(card).translate)||0;
        return {card,left:rect.left-r.left+view.scrollLeft-dx,top:rect.top-r.top+view.scrollTop,width:rect.width,height:rect.height};
      })};
  }
  function start() {
    const d = drag, r = d.card.getBoundingClientRect();
    d.active = true; d.origin = r; d.dx=d.startX-r.left; d.dy=d.startY-r.top;
    const selected = controller.selectedCards.includes(d.card) ? [...controller.selectedCards] : [d.card];
    d.cards = selected.sort((a,b) => areaOf(a)===areaOf(b)?Number(a.style.order)-Number(b.style.order):0);
    d.paths = d.cards.map(card => card.dataset.path); d.cache = new Map();
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
    if(d.invalid){d.cache.clear();d.invalid=false;}
    const target=hit(d.x,d.y);d.target=target;setHighlight(target.player||target.area);let autoScroll=false;
    if(target.area && !allowsReorder(target.area)){
      // Equipment and judgment use fixed append order, so there is no insertion marker.
      d.beforeKey=null;setShift(null);marker.style.display='none';
    }else if(target.area){
      const area=target.area;if(!d.cache.has(area))d.cache.set(area,measure(area));
      const e=d.cache.get(area),v=e.view,left=e.left-scrollX,top=e.top-scrollY;
      const horizontal=!area.isTable && area.areaType!=='pan-area';
      const p=horizontal?d.x:d.y,lo=horizontal?left:top,hi=lo+(horizontal?e.width:e.height);
      const speed=d.released?0:p<lo+24?-Math.min(8,(lo+24-p)/3):p>hi-24?Math.min(8,(p-hi+24)/3):0;
      const old=horizontal?v.scrollLeft:v.scrollTop,next=Math.max(0,Math.min(horizontal?e.maxX:e.maxY,old+speed));
      if(next!==old){if(horizontal)v.scrollLeft=next;else v.scrollTop=next;autoScroll=true;}
      const x=d.x-left+v.scrollLeft,y=d.y-top+v.scrollTop;
      const i=e.cards.findIndex(r=>y<r.top||(y<=r.top+r.height&&x<r.left+r.width/2));
      const before=i<0?null:e.cards[i],prev=i<0?e.cards.at(-1):e.cards[i-1],r=before||prev;
      d.beforeKey=before?.card.cardRef.parent.toString()===area.cardsRef.toString() ? before.card.cardRef.key : null;
      setShift(prev&&r&&Math.abs(prev.top-r.top)<8?prev.card:null);
      const mx=r?left+r.left-v.scrollLeft+(before?-3:r.width+1):left+7;
      const mt=Math.max(top+2,r?top+r.top-v.scrollTop:top+10),mb=Math.min(top+e.height-2,r?top+r.top+r.height-v.scrollTop:mt+54);
      const key=[mx,mt,mb].join(',');if(key!==d.marker){d.marker=key;marker.style.left=mx+'px';marker.style.top=mt+'px';marker.style.height=Math.max(0,mb-mt)+'px';}
      marker.style.display=mb>mt&&mx>=left&&mx<=left+e.width?'block':'none';
    }else{setShift(null);marker.style.display='none';}
    d.ghost.style.transform=`translate3d(${d.x-d.dx}px,${d.y-d.dy}px,0)`;
    if(d.released){drop();return;}if(autoScroll)schedule();
  }
  async function drop() {
    const d=drag;d.waiting=true;marker.style.display='none';setShift(null);
    if(d.target.blocked){finish(false);return;}
    if(d.target.player){
      const player=d.target.player;
      player.openDropPicker(d.paths[0],d.paths,ok=>finish(ok));
      if(!player.dropPicker.open)finish(false);
      return;
    }
    if(!d.target.area){finish(false);return;}
    try {await controller.moveOrderedCards(d.paths,d.target.area.cardsRef,d.beforeKey);await finish(true);}
    catch(error){announce(error.message || '移动失败，请重试');await finish(false);}
  }
  async function finish(ok=false) {
    const d=drag;if(!d)return;drag=null;cancelAnimationFrame(frame);frame=0;setHighlight(null);setShift(null);marker.style.display='none';
    if(!d.active)return;
    if(ok){d.cards.forEach(card=>{if(card.isConnected)card.unselectCard();});}
    const end=ok?{opacity:0}:{transform:`translate3d(${d.origin.left}px,${d.origin.top}px,0)`};
    try {await d.ghost.animate([{transform:d.ghost.style.transform,opacity:1},end],{duration:ok?140:220,easing:'ease-out',fill:'forwards'}).finished;}finally{d.cards.forEach(card=>card.classList.remove('drag-source'));d.ghost.remove();}
  }
  table.addEventListener('pointerdown',e=>{
    const card=e.composedPath().find(node=>node.localName==='sg-card');
    if(!card||e.button!==0||drag)return;
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
  window.addEventListener('resize',()=>{if(drag){drag.invalid=true;schedule();}},options);
  document.addEventListener('scroll',()=>{if(drag?.active&&!drag.waiting)schedule();},{...options,capture:true,passive:true});
  table.addEventListener('cards-updated',()=>{if(drag){drag.invalid=true;schedule();}},options);
  return ()=>{abort.abort();finish(false);marker.remove();status.remove();clearTimeout(statusTimer);};
}
