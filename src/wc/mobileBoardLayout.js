export function installMobileBoardLayout(table) {
  const query = window.matchMedia('(max-width: 620px)');
  const container = table.shadowRoot.querySelector('.table-container');
  const publicPanel = table.tableDeckWidget;
  const opponentRail = table.opponentRail;
  const cardMenu = table.cardMenu;
  const actionLog = table.actionLogPanel;
  let mobileBoard = null;

  const playerPanel = document.createElement('section');
  playerPanel.className = 'mobile-player-panel';
  playerPanel.hidden = true;
  playerPanel.innerHTML = `<header><strong>玩家操作</strong><button type="button" data-player-panel-close aria-label="关闭玩家操作">×</button></header><div class="mobile-player-hp"><button type="button" data-player-action="hp-minus" aria-label="扣血">−</button><span>体力 <b>0 / 0</b></span><button type="button" data-player-action="hp-plus" aria-label="加血">＋</button></div><div class="mobile-player-state-actions"><button type="button" data-player-debuff="0">翻面</button><button type="button" data-player-debuff="1">连环</button><button type="button" data-player-action="select-general">选将</button><button type="button" data-player-action="hp-limit">血量上限</button></div>`;
  const localPlayer=()=>table.playerDoms.find(player=>player.classList.contains('current-player'));
  const syncPlayerPanel=()=>{
    const player=localPlayer();
    const hp=playerPanel.querySelector('.mobile-player-hp b');
    hp.textContent=player ? `${player.hpWc?.cur ?? 0} / ${player.hpWc?.max ?? 0}` : '0 / 0';
    playerPanel.querySelectorAll('[data-player-debuff]').forEach(button=>button.classList.toggle('active',player?.debuff?.[Number(button.dataset.playerDebuff)]==='1'));
    actions.querySelector('[data-mobile-action="player"]').disabled=!player;
  };
  const closePlayerPanel=()=>{
    playerPanel.hidden=true;
    actions.querySelector('[data-mobile-action="player"]')?.setAttribute('aria-expanded','false');
  };
  playerPanel.addEventListener('click',event=>{
    const button=event.target.closest('button');
    if(!button)return;
    if(button.dataset.playerPanelClose!==undefined)return closePlayerPanel();
    const player=localPlayer();
    if(!player)return;
    const selector=button.dataset.playerDebuff!==undefined
      ? `[data-debuff="${button.dataset.playerDebuff}"]`
      : `[data-action="${button.dataset.playerAction}"]`;
    player.shadowRoot.querySelector(`.player-toolbar ${selector}`)?.click();
  });

  const actions = document.createElement('div');
  actions.className = 'mobile-public-actions';
  actions.innerHTML = `<div class="mobile-draw"><button type="button" class="primary" data-mobile-action="draw">摸牌</button><button type="button" class="primary" data-draw-toggle aria-label="选择摸牌张数" aria-expanded="false">▾</button><div class="mobile-draw-options" hidden>${[1,2,3,4].map(count=>`<button type="button" data-draw-count="${count}">摸 ${count} 张</button>`).join('')}</div></div><button type="button" data-mobile-action="reveal">展示／判定</button><button type="button" data-mobile-action="deck">展开牌堆</button><button type="button" data-mobile-action="discard">查看弃牌</button><button type="button" data-mobile-action="player" aria-expanded="false">玩家操作</button><button type="button" class="primary mobile-shuffle" data-mobile-action="shuffle" hidden>洗牌</button>`;
  actions.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || button.disabled) return;
    const options = actions.querySelector('.mobile-draw-options');
    const toggle = actions.querySelector('[data-draw-toggle]');
    if (button === toggle) {
      closePlayerPanel();
      options.hidden = !options.hidden;
      toggle.setAttribute('aria-expanded', String(!options.hidden));
      return;
    }
    options.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    if(button.dataset.mobileAction==='player'){
      playerPanel.hidden=!playerPanel.hidden;
      button.setAttribute('aria-expanded',String(!playerPanel.hidden));
      if(!playerPanel.hidden)syncPlayerPanel();
      return;
    }
    closePlayerPanel();
    if (button.dataset.drawCount) return table.publicPanelApi?.draw(Number(button.dataset.drawCount));
    const action = button.dataset.mobileAction;
    if (action === 'draw') return table.publicPanelApi?.draw(1);
    if (action === 'reveal') return table.publicPanelApi?.reveal();
    if (action === 'deck') return table.publicPanelApi?.openDeck();
    if (action === 'discard') return table.publicPanelApi?.openDiscard();
    if (action === 'shuffle') return table.publicPanelApi?.shuffle();
  });

  function createMobileBoard() {
    const root = document.createElement('main');
    root.className = 'mobile-board';
    root.innerHTML = `<section class="mobile-opponents"><header><span>其他玩家</span><small>点击玩家查看区域</small></header><div class="mobile-opponent-grid"></div></section><section class="mobile-table-stage"><div class="mobile-table-left"></div><div class="mobile-side-seat"></div></section><section class="mobile-local-seat"></section><section class="mobile-bottom-bar" aria-label="牌桌操作栏"></section>`;
    root.querySelector('.mobile-bottom-bar').append(actions, cardMenu, playerPanel);
    return root;
  }

  function updatePublicActions() {
    const count = Number(publicPanel.querySelector('.public-deck-count')?.textContent || 0);
    const empty = count === 0;
    actions.querySelector('.mobile-draw').hidden = empty;
    actions.querySelector('[data-mobile-action="reveal"]').hidden = empty;
    actions.querySelector('[data-mobile-action="deck"]').hidden = empty;
    actions.querySelector('.mobile-shuffle').hidden = !empty;
    actions.querySelectorAll('button[data-draw-count]').forEach(button => button.disabled = count < Number(button.dataset.drawCount));
    syncPlayerPanel();
  }
  const countObserver = new MutationObserver(updatePublicActions);
  const countNode = publicPanel.querySelector('.public-deck-count');
  if (countNode) countObserver.observe(countNode, {childList:true,subtree:true,characterData:true});

  function arrangeMobileSeats() {
    if (!mobileBoard) return;
    const grid = mobileBoard.querySelector('.mobile-opponent-grid');
    const side = mobileBoard.querySelector('.mobile-side-seat');
    const localHolder = mobileBoard.querySelector('.mobile-local-seat');
    const local = table.playerDoms.find(player => player.classList.contains('slot0'));
    const top = table.playerDoms.filter(player => ['slot1','slot2','slot3','slot4'].some(slot => player.classList.contains(slot)));
    const sidePlayer = table.playerDoms.find(player => player.classList.contains('slot5'));
    const unassigned = table.playerDoms.filter(player => !local && !top.includes(player) && player !== sidePlayer);
    [...top, ...unassigned].forEach(player => grid.append(player));
    if (sidePlayer) side.append(sidePlayer);
    if (local) localHolder.append(local);
    table.playerDoms.forEach(player => player.setPresentationMode?.(true));
  }

  function mountMobile() {
    if (mobileBoard) return;
    mobileBoard = createMobileBoard();
    container.classList.add('mobile-layout-active');
    container.append(mobileBoard);
    const left = mobileBoard.querySelector('.mobile-table-left');
    left.append(publicPanel, actionLog);
    actionLog.classList.add('collapsed');
    const logToggle=actionLog.querySelector('.log-header button');
    logToggle.textContent='+';logToggle.setAttribute('aria-expanded','false');logToggle.setAttribute('aria-label','展开行动日志');
    arrangeMobileSeats();
    updatePublicActions();
  }

  function mountDesktop() {
    if (!mobileBoard) return;
    closePlayerPanel();
    table.playerDoms.forEach(player => player.setPresentationMode?.(false));
    const local = table.playerDoms.find(player => player.classList.contains('slot0'));
    table.playerDoms.filter(player => player !== local).forEach(player => opponentRail.append(player));
    container.append(publicPanel, opponentRail);
    if (local) container.append(local);
    container.append(actionLog);
    actionLog.classList.remove('collapsed');
    const logToggle=actionLog.querySelector('.log-header button');
    logToggle.textContent='−';logToggle.setAttribute('aria-expanded','true');logToggle.setAttribute('aria-label','折叠行动日志');
    publicPanel.append(cardMenu);
    mobileBoard.remove();
    mobileBoard = null;
    container.classList.remove('mobile-layout-active');
  }

  const refresh = () => query.matches ? (mountMobile(), arrangeMobileSeats()) : mountDesktop();
  const selectionObserver=new MutationObserver(()=>{if(table.classList.contains('has-card-selection'))closePlayerPanel();});
  selectionObserver.observe(table,{attributes:true,attributeFilter:['class']});
  table.addEventListener('mobile-player-state-updated',syncPlayerPanel);
  query.addEventListener('change', refresh);
  table.addEventListener('player-seat-changed', refresh);
  refresh();
  return () => {
    query.removeEventListener('change', refresh);
    table.removeEventListener('player-seat-changed', refresh);
    countObserver.disconnect();
    selectionObserver.disconnect();
    table.removeEventListener('mobile-player-state-updated',syncPlayerPanel);
    mountDesktop();
    actions.remove();
  };
}
