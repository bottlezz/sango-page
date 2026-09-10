// Capture visual positions before rendering so surviving cards can animate into
// their new slots after either an insertion or a removal.
export function captureCardPositions(nodes, keyFor) {
  return new Map([...nodes].map(node => [keyFor(node), node.getBoundingClientRect()]));
}

export function animateCardLayoutChanges(nodes, previous, keyFor) {
  const cards=[...nodes];
  const keys=new Set(cards.map(keyFor));
  const membershipChanged=keys.size!==previous.size||cards.some(node=>!previous.has(keyFor(node)));
  if(!membershipChanged||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  cards.forEach(node=>{
    const rect=node.getBoundingClientRect();
    if(!rect.width||!rect.height)return;
    const old=previous.get(keyFor(node));
    node.getAnimations().forEach(animation=>animation.cancel());
    if(old){
      const x=old.left-rect.left,y=old.top-rect.top;
      if(Math.abs(x)+Math.abs(y)<1)return;
      node.animate([{transform:`translate(${x}px,${y}px)`},{transform:'translate(0,0)'}],{duration:360,easing:'cubic-bezier(.2,.7,.3,1)'});
    }else{
      node.animate([{transform:'translateX(-48px)',opacity:0},{transform:'translateX(0)',opacity:1}],{duration:360,delay:100,fill:'backwards',easing:'cubic-bezier(.2,.7,.3,1)'});
    }
  });
}
