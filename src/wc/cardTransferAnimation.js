const MOVE_DURATION=700;
const TRAIL_HOLD=500;
const TRAIL_FADE=150;

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
    const property={hand:'handArea',zhuang:'zhuangArea',pan:'panArea',other1:'other1Area',other2:'other2Area'}[area];
    const candidate=property?player[property]:null,rect=candidate?.getBoundingClientRect();
    return rect?.width&&rect?.height?candidate:player;
  }

  function play({source,target,count,label}){
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
    if(!reduced.matches)for(let index=0;index<Math.min(count,3);index++){
      const card=document.createElement('div');card.className='card-transfer-card';group.append(card);
      const position=(x,y,scale,rotation)=>`translate(${x-16+index*4}px,${y-22-index*3}px) scale(${scale}) rotate(${rotation}deg)`;
      card.animate([
        {transform:position(start.x,start.y,.85,-6),opacity:0},
        {transform:position(start.x+dx*.08,start.y+dy*.08,1,-3),opacity:1,offset:.12},
        {transform:position(end.x,end.y,.9,0),opacity:1,offset:.88},
        {transform:position(end.x,end.y,.7,0),opacity:0},
      ],{duration,delay:index*22,easing:'cubic-bezier(.2,.65,.3,1)',fill:'forwards'});
    }
    window.setTimeout(()=>to.animate([
      {filter:'brightness(1)'},{filter:'brightness(1.24)',offset:.3},{filter:'brightness(1)'},
    ],{duration:220}),Math.max(0,duration-80));
    window.setTimeout(()=>group.remove(),trailDuration+20);
  }


  function playReveal({target,cards}){
    const host=revealHost(target);
    if(!host||!host.isConnected||!cards?.length)return;
    const rect=host.getBoundingClientRect();
    if(!rect.width||!rect.height)return;
    const group=document.createElement('div');group.className='card-reveal-group';
    const halfWidth=Math.min(240,Math.max(34,cards.length*35));
    group.style.left=`${Math.min(window.innerWidth-halfWidth-16,Math.max(halfWidth+16,rect.left+rect.width/2))}px`;
    group.style.top=`${Math.min(window.innerHeight-54,Math.max(54,rect.top+rect.height/2))}px`;
    const label=document.createElement('span');label.className='card-reveal-heading';label.textContent='亮牌';
    const list=document.createElement('div');list.className='card-reveal-list';
    const suitMarks={heart:'♥',diamond:'♦',spade:'♠',club:'♣'};
    cards.forEach(({suit,rank,name})=>{
      const tile=document.createElement('div');tile.className='card-reveal-tile';
      const index=document.createElement('span');index.className=`card-reveal-index ${suit}`;
      const mark=document.createElement('b');mark.textContent=suitMarks[suit]||suit;
      const number=document.createElement('em');number.textContent=rank;
      const title=document.createElement('strong');title.textContent=name;
      index.append(mark,number);tile.append(index,title);list.append(tile);
    });
    group.append(label,list);layer.append(group);
    const duration=reduced.matches?900:1900;
    group.animate([
      {opacity:0,transform:'translate(-50%,-42%) scale(.9)'},
      {opacity:1,transform:'translate(-50%,-50%) scale(1)',offset:.12},
      {opacity:1,transform:'translate(-50%,-50%) scale(1)',offset:.82},
      {opacity:0,transform:'translate(-50%,-54%) scale(.98)'},
    ],{duration,easing:'cubic-bezier(.2,.7,.25,1)',fill:'forwards'});
    host.animate([{filter:'brightness(1)'},{filter:'brightness(1.28)',offset:.35},{filter:'brightness(1)'}],{duration:360});
    window.setTimeout(()=>group.remove(),duration+30);
  }

  const onTransfers=event=>requestAnimationFrame(()=>event.detail?.transfers?.forEach(play));
  const onReveals=event=>requestAnimationFrame(()=>event.detail?.reveals?.forEach(playReveal));
  table.addEventListener('card-transfers',onTransfers);
  table.addEventListener('card-reveals',onReveals);
  return()=>{table.removeEventListener('card-transfers',onTransfers);table.removeEventListener('card-reveals',onReveals);layer.remove();};
}
