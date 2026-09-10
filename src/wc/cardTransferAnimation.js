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

  const onTransfers=event=>requestAnimationFrame(()=>event.detail?.transfers?.forEach(play));
  table.addEventListener('card-transfers',onTransfers);
  return()=>{table.removeEventListener('card-transfers',onTransfers);layer.remove();};
}
