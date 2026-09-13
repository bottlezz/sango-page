const MOVE_DURATION=700;
const TRAIL_HOLD=500;
const TRAIL_FADE=150;
const ACTION_PREVIEW_DURATION=2500;
const SUIT_MARKS={heart:'♥',diamond:'♦',spade:'♠',club:'♣'};

function center(rect){return{x:rect.left+rect.width/2,y:rect.top+rect.height/2};}
function edge(rect,toward){
  const origin=center(rect),dx=toward.x-origin.x,dy=toward.y-origin.y;
  const scale=Math.min((rect.width/2)/Math.max(Math.abs(dx),.001),(rect.height/2)/Math.max(Math.abs(dy),.001));
  return{x:origin.x+dx*scale,y:origin.y+dy*scale};
}

export function installCardTransferAnimation(table){
  const layer=document.createElement('div');layer.className='card-transfer-layer';layer.setAttribute('aria-hidden','true');
  table.shadowRoot.append(layer);
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');

  function areaHost(path){
    const [owner,area]=String(path||'').split('/');
    if(owner==='tableDecks')return table.shadowRoot.querySelector(area==='discard'?'.public-discard-panel':'.public-deck-panel');
    if(/^p\d+$/.test(owner))return table.shadowRoot.querySelector(`sg-player[data-key="${owner}"]`);
    return null;
  }

  function revealHost(path){
    const [owner,area]=String(path||'').split('/');
    if(owner==='tableDecks')return areaHost(path);
    const player=/^p\d+$/.test(owner)?table.shadowRoot.querySelector(`sg-player[data-key="${owner}"]`):null;
    if(!player)return null;
    if(owner===table.gameController.currentPlayer){
      const generalSlots=player.shadowRoot?.querySelector(player.classList.contains('mobile-presentation')?'.mobile-general-slots':'.general-slots');
      const generalRect=generalSlots?.getBoundingClientRect();
      if(generalRect?.width&&generalRect?.height)return generalSlots;
    }
    const property={hand:'handArea',zhuang:'zhuangArea',pan:'panArea',other1:'other1Area',other2:'other2Area'}[area];
    const candidate=property?player[property]:null,rect=candidate?.getBoundingClientRect();
    return rect?.width&&rect?.height?candidate:player;
  }

  function playerHighlightSurface(player){
    if(!player?.isConnected)return null;
    if(player.classList.contains('mobile-presentation')){
      return player.shadowRoot?.querySelector('.mobile-player-summary')||null;
    }
    return player;
  }

  function highlightPlayer(player,type,duration){
    const surface=playerHighlightSurface(player);
    if(!surface?.isConnected)return;
    const mobile=surface!==player;
    const frames=type==='source'
      ? mobile
        ? [
          {filter:'brightness(1)',borderColor:'rgba(162,186,143,.14)',boxShadow:'inset 0 0 0 0 rgba(240,204,115,0)'},
          {filter:'brightness(1.12)',borderColor:'rgba(240,204,115,.9)',boxShadow:'inset 0 0 0 2px rgba(240,204,115,.82),inset 0 0 1.2rem rgba(226,184,75,.24)',offset:.1},
          {filter:'brightness(1.08)',borderColor:'rgba(240,204,115,.72)',boxShadow:'inset 0 0 0 2px rgba(240,204,115,.68),inset 0 0 1rem rgba(226,184,75,.18)',offset:.82},
          {filter:'brightness(1)',borderColor:'rgba(162,186,143,.14)',boxShadow:'inset 0 0 0 0 rgba(240,204,115,0)'},
        ]
        : [
          {filter:'brightness(1)',boxShadow:'0 0 0 0 rgba(240,204,115,0)'},
          {filter:'brightness(1.14)',boxShadow:'0 0 0 3px rgba(240,204,115,.82),0 0 1.8rem rgba(226,184,75,.58)',offset:.1},
          {filter:'brightness(1.1)',boxShadow:'0 0 0 3px rgba(240,204,115,.72),0 0 1.45rem rgba(226,184,75,.42)',offset:.82},
          {filter:'brightness(1)',boxShadow:'0 0 0 0 rgba(240,204,115,0)'},
        ]
      : mobile
        ? [
          {filter:'brightness(1)',borderColor:'rgba(162,186,143,.14)',boxShadow:'inset 0 0 0 0 rgba(132,199,170,0)'},
          {filter:'brightness(1.08) saturate(1.04)',borderColor:'rgba(154,217,189,.86)',boxShadow:'inset 0 0 0 2px rgba(154,217,189,.75),inset 0 0 1.2rem rgba(101,184,149,.26)',offset:.1},
          {filter:'brightness(1.05) saturate(1.03)',borderColor:'rgba(154,217,189,.68)',boxShadow:'inset 0 0 0 2px rgba(154,217,189,.58),inset 0 0 1rem rgba(101,184,149,.18)',offset:.82},
          {filter:'brightness(1)',borderColor:'rgba(162,186,143,.14)',boxShadow:'inset 0 0 0 0 rgba(132,199,170,0)'},
        ]
        : [
          {filter:'brightness(1)',boxShadow:'0 0 0 rgba(132,199,170,0)'},
          {filter:'brightness(1.1) saturate(1.04)',boxShadow:'0 0 1.9rem .35rem rgba(132,199,170,.62)',offset:.1},
          {filter:'brightness(1.07) saturate(1.03)',boxShadow:'0 0 1.55rem .2rem rgba(132,199,170,.44)',offset:.82},
          {filter:'brightness(1)',boxShadow:'0 0 0 rgba(132,199,170,0)'},
        ];
    surface.animate(frames,{duration,easing:'ease-out'});
  }

  function cardFace({suit,rank,name}){
    const tile=document.createElement('div');tile.className='card-reveal-tile';
    const index=document.createElement('span');index.className=`card-reveal-index ${suit}`;
    const mark=document.createElement('b');mark.textContent=SUIT_MARKS[suit]||suit;
    const number=document.createElement('em');number.textContent=rank;
    const title=document.createElement('strong');title.textContent=name;
    index.append(mark,number);tile.append(index,title);
    return tile;
  }

  function play({source,target,count,label,suppressCards=false}){
    const from=areaHost(source),to=areaHost(target);
    if(!from||!to||from===to||!from.isConnected||!to.isConnected)return;
    const fromRect=from.getBoundingClientRect(),toRect=to.getBoundingClientRect();
    if(!fromRect.width||!fromRect.height||!toRect.width||!toRect.height)return;
    const start=edge(fromRect,center(toRect)),end=edge(toRect,center(fromRect));
    const dx=end.x-start.x,dy=end.y-start.y,length=Math.hypot(dx,dy)||1,ux=dx/length,uy=dy/length;
    const group=document.createElement('div');group.className='card-transfer-group';layer.append(group);
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox',`0 0 ${window.innerWidth} ${window.innerHeight}`);
    svg.innerHTML=`<path d="M ${start.x} ${start.y} L ${end.x} ${end.y} M ${end.x-ux*10-uy*5} ${end.y-uy*10+ux*5} L ${end.x} ${end.y} L ${end.x-ux*10+uy*5} ${end.y-uy*10-ux*5}"/>`;
    group.append(svg);
    const duration=reduced.matches?140:MOVE_DURATION,trailDuration=duration+44+TRAIL_HOLD+TRAIL_FADE;
    const trailHold=(trailDuration-TRAIL_FADE)/trailDuration;
    svg.animate([{opacity:0},{opacity:.72,offset:100/trailDuration},{opacity:.72,offset:trailHold},{opacity:0}],{duration:trailDuration,fill:'forwards'});
    const caption=document.createElement('span');caption.className='card-transfer-label';caption.textContent=`${label} · ${count} 张`;
    caption.style.left=`${(start.x+end.x)/2+14}px`;caption.style.top=`${(start.y+end.y)/2-25}px`;group.append(caption);
    caption.animate([{opacity:0},{opacity:1,offset:100/trailDuration},{opacity:1,offset:trailHold},{opacity:0}],{duration:trailDuration,fill:'forwards'});
    if(!reduced.matches&&!suppressCards)for(let index=0;index<Math.min(count,3);index++){
      const card=document.createElement('div');card.className='card-transfer-card';group.append(card);
      const position=(x,y,scale,rotation)=>`translate(${x-16+index*4}px,${y-22-index*3}px) scale(${scale}) rotate(${rotation}deg)`;
      card.animate([
        {transform:position(start.x,start.y,.85,-6),opacity:0},
        {transform:position(start.x+dx*.08,start.y+dy*.08,1,-3),opacity:1,offset:.12},
        {transform:position(end.x,end.y,.9,0),opacity:1,offset:.88},
        {transform:position(end.x,end.y,.7,0),opacity:0},
      ],{duration,delay:index*22,easing:'cubic-bezier(.2,.65,.3,1)',fill:'forwards'});
    }
    window.setTimeout(()=>group.remove(),trailDuration+20);
  }

  function playUse({source,useCardName,useTargetSeat,useTargetSeats=[],useCards=[]}){
    const host=revealHost(source);
    if(!host||!host.isConnected||!useCardName||!useCards.length)return;
    const playerHost=areaHost(source);
    const rect=host.getBoundingClientRect();
    if(!rect.width||!rect.height)return;
    const group=document.createElement('div');group.className='card-use-group';
    group.style.left=`${Math.min(window.innerWidth-48,Math.max(48,rect.left+rect.width/2))}px`;
    const owner=String(source||'').split('/')[0],isLocalPlayer=owner===table.gameController.currentPlayer;
    const centerY=isLocalPlayer?(rect.top>=120?rect.top-55:rect.bottom+55):rect.top+rect.height/2;
    group.style.top=`${Math.min(window.innerHeight-78,Math.max(78,centerY))}px`;
    const list=document.createElement('div');list.className='card-reveal-list card-use-list';
    useCards.forEach(card=>list.append(cardFace(card)));
    const converted=useCards.some(card=>card.name!==useCardName);
    if(converted){
      const heading=document.createElement('span');heading.className='card-use-heading';heading.textContent=`作为「${useCardName}」使用`;
      group.append(heading);
    }
    group.append(list);layer.append(group);
    const duration=reduced.matches?500:ACTION_PREVIEW_DURATION;
    group.animate([
      {opacity:0,transform:'translate(-50%,-22%) scale(.72)'},
      {opacity:1,transform:'translate(-50%,-50%) scale(1.06)',offset:.13},
      {opacity:1,transform:'translate(-50%,-56%) scale(1)',offset:.8},
      {opacity:0,transform:'translate(-50%,-68%) scale(.96)'},
    ],{duration,easing:'cubic-bezier(.18,.72,.25,1)',fill:'forwards'});
    host.animate([{filter:'brightness(1)'},{filter:'brightness(1.3)',offset:.35},{filter:'brightness(1)'}],{duration:360});
    highlightPlayer(playerHost,'source',duration);
    const targets=useTargetSeats.length?useTargetSeats:(useTargetSeat?[useTargetSeat]:[]);
    targets.forEach(targetSeat=>{
      play({source,target:`${targetSeat}/hand`,count:1,label:`使用 · ${useCardName}`,suppressCards:true});
      const targetHost=areaHost(`${targetSeat}/hand`);
      highlightPlayer(targetHost,'target',duration);
    });
    window.setTimeout(()=>group.remove(),duration+30);
  }


  function playReveal({target,cards,labelText='亮牌',duration:requestedDuration=1900}){
    const host=revealHost(target);
    if(!host||!host.isConnected||!cards?.length)return 0;
    const rect=host.getBoundingClientRect();
    if(!rect.width||!rect.height)return 0;
    const group=document.createElement('div');group.className='card-reveal-group';
    const halfWidth=Math.min(240,Math.max(34,cards.length*35));
    group.style.left=`${Math.min(window.innerWidth-halfWidth-16,Math.max(halfWidth+16,rect.left+rect.width/2))}px`;
    const owner=String(target||'').split('/')[0],isLocalPlayer=owner===table.gameController.currentPlayer;
    const centerY=isLocalPlayer
      ? (rect.top>=128?rect.top-64:rect.bottom+64)
      : rect.top+rect.height/2;
    group.style.top=`${Math.min(window.innerHeight-64,Math.max(64,centerY))}px`;
    const label=document.createElement('span');label.className='card-reveal-heading';label.textContent=labelText;
    const list=document.createElement('div');list.className='card-reveal-list';
    cards.forEach(card=>list.append(cardFace(card)));
    group.append(label,list);layer.append(group);
    const duration=reduced.matches?Math.min(500,requestedDuration):requestedDuration;
    group.animate([
      {opacity:0,transform:'translate(-50%,-42%) scale(.9)'},
      {opacity:1,transform:'translate(-50%,-50%) scale(1)',offset:.12},
      {opacity:1,transform:'translate(-50%,-50%) scale(1)',offset:.82},
      {opacity:0,transform:'translate(-50%,-54%) scale(.98)'},
    ],{duration,easing:'cubic-bezier(.2,.7,.25,1)',fill:'forwards'});
    host.animate([{filter:'brightness(1)'},{filter:'brightness(1.28)',offset:.35},{filter:'brightness(1)'}],{duration:360});
    window.setTimeout(()=>group.remove(),duration+30);
    return duration;
  }

  function playTransfer(transfer){
    if(transfer.label==='使用'){
      if(transfer.usePrimary)playUse(transfer);
      return;
    }
    if((transfer.label==='打出'||transfer.label==='弃置')&&transfer.cards?.length){
      playReveal({target:transfer.source,cards:transfer.cards,labelText:transfer.label,duration:ACTION_PREVIEW_DURATION});
      play(transfer);
      return;
    }
    play(transfer);
  }

  const onTransfers=event=>requestAnimationFrame(()=>event.detail?.transfers?.forEach(playTransfer));
  const onReveals=event=>requestAnimationFrame(()=>event.detail?.reveals?.forEach(playReveal));
  table.addEventListener('card-transfers',onTransfers);
  table.addEventListener('card-reveals',onReveals);
  return()=>{table.removeEventListener('card-transfers',onTransfers);table.removeEventListener('card-reveals',onReveals);layer.remove();};
}
