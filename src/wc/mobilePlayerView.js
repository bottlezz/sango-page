import paiKu from '../data/pai.json';

const areaMap = player => ({
  hand: [player.handArea, '手牌'],
  other1: [player.other1Area, '区1'],
  other2: [player.other2Area, '区2'],
  zhuang: [player.zhuangArea, '装备'],
  pan: [player.panArea, '判定'],
});

export function installMobilePlayerView(player) {
  const view = document.createElement('section');
  view.className = 'mobile-player-view';
  view.innerHTML = `
    <div class="mobile-player-summary" role="button" tabindex="0" aria-label="查看玩家区域">
      <span class="mobile-player-heading"><b></b><i></i></span>
      <span class="mobile-general-slots" aria-label="主将与副将"></span>
      <span class="mobile-hp"></span>
      <span class="mobile-equipment"></span>
      <span class="mobile-zone-counts"><span>手 <b data-count="hand">0</b></span><span>区1 <b data-count="other1">0</b></span><span>区2 <b data-count="other2">0</b></span></span>
      <span class="mobile-status"></span>
    </div>
    <div class="mobile-local-cards" hidden>
      <nav class="mobile-area-tabs" role="tablist" aria-label="选择卡牌区域"></nav>
      <div class="mobile-area-stage"></div>
    </div>`;
  player.shadowRoot.append(view);

  const tabs = view.querySelector('.mobile-area-tabs');
  Object.entries(areaMap(player)).forEach(([key, [, label]]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.mobileArea = key;
    button.textContent = label;
    button.setAttribute('role', 'tab');
    button.addEventListener('click', () => showArea(key));
    tabs.append(button);
  });

  const remoteTabs = document.createElement('nav');
  remoteTabs.className = 'mobile-remote-tabs';
  remoteTabs.setAttribute('role', 'tablist');
  remoteTabs.setAttribute('aria-label', '选择玩家区域');
  Object.entries(areaMap(player)).forEach(([key, [, label]]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.mobileInspect = key;
    button.textContent = label;
    button.setAttribute('role', 'tab');
    button.addEventListener('click', () => {
      const [area, areaLabel] = areaMap(player)[key];
      if (player.inspectedArea === area) return;
      player.openAreaPanel(area, areaLabel);
    });
    remoteTabs.append(button);
  });
  player.shadowRoot.querySelector('.area-panel-heading').after(remoteTabs);

  const homes = new Map();
  const remember = element => homes.set(element, {parent: element.parentElement, next: element.nextSibling});
  [player.jiang1Area, player.jiang2Area, player.handArea, player.other1Area, player.other2Area, player.zhuangArea, player.judgmentArea, player.shadowRoot.querySelector('.player-toolbar')].forEach(remember);

  function restore(element) {
    const home = homes.get(element);
    if (!home?.parent) return;
    home.parent.insertBefore(element, home.next?.parentElement === home.parent ? home.next : null);
  }

  function showArea(key) {
    if (!player.classList.contains('current-player')) return;
    const [next] = areaMap(player)[key] || [];
    if (!next) return;
    if (player.mobileArea && player.mobileArea !== next) {
      Object.values(player.mobileArea.cards || {}).filter(card => player.gameController.selectedCards.includes(card)).forEach(card => card.unselectCard());
      restore(player.mobileArea === player.panArea ? player.judgmentArea : player.mobileArea);
    }
    player.mobileArea = next;
    player.mobileAreaKey = key;
    Object.values(areaMap(player)).forEach(([area]) => area.classList.toggle('mobile-inactive', area !== next));
    const stage = view.querySelector('.mobile-area-stage');
    stage.replaceChildren(next === player.panArea ? player.judgmentArea : next);
    next.classList.remove('hide');
    tabs.querySelectorAll('button').forEach(button => {
      const active = button.dataset.mobileArea === key;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
  }

  const summary = view.querySelector('.mobile-player-summary');
  summary.addEventListener('click', event => {
    if (event.target.closest('sg-jiangarea') || player.classList.contains('current-player')) return;
    player.openAreaPanel(player.handArea, '手牌');
  });
  summary.addEventListener('keydown', event => {
    if (!['Enter',' '].includes(event.key) || player.classList.contains('current-player')) return;
    event.preventDefault();player.openAreaPanel(player.handArea, '手牌');
  });
  function update() {
    const name = player.shadowRoot.querySelector('.player-name')?.textContent?.trim() || player.dataset.key || '';
    const role = player.shadowRoot.querySelector('.player-role')?.textContent?.trim() || '';
    view.querySelector('.mobile-player-heading b').textContent = name === 'empty' ? '空位' : name;
    const roleNode = view.querySelector('.mobile-player-heading i');
    roleNode.textContent = role === '-' ? '' : role;
    const roleClass=['role-lord','role-renegade','role-loyal','role-rebel']
      .find(className=>player.shadowRoot.querySelector('.player-role')?.classList.contains(className));
    roleNode.className = roleClass || '';
    view.querySelector('.mobile-hp').textContent = `♥ ${player.hpWc?.cur ?? 0} / ${player.hpWc?.max ?? 0}`;
    ['hand','other1','other2'].forEach(key => {
      const count = player.shadowRoot.querySelector(`.${key === 'hand' ? 'hand' : key === 'other1' ? 'area1' : 'area2'}-count > span`)?.textContent || '0';
      view.querySelector(`[data-count="${key}"]`).textContent = count;
    });
    const equipment = Object.values(player.zhuangArea?.cards || {}).map(card => paiKu[card.cardData?.id]?.name).filter(Boolean);
    const equipmentNode = view.querySelector('.mobile-equipment');
    equipmentNode.replaceChildren(...(equipment.length ? equipment.slice(0,4) : ['无装备']).map(name => Object.assign(document.createElement('span'), {textContent:name})));
    equipmentNode.classList.toggle('empty', equipment.length === 0);
    const states = [];
    if (player.debuff?.[0] === '1') states.push(['翻','turned']);
    if (player.debuff?.[1] === '1') states.push(['链','linked']);
    Object.values(player.panArea?.cards || {}).forEach(card => {
      const effect = card.cardData?.judgmentEffect || paiKu[card.cardData?.id]?.name;
      const label = {'乐不思蜀':'乐','兵粮寸断':'兵','闪电':'电'}[effect];
      if (label) states.push([label, `judge-${label}`]);
    });
    const status = view.querySelector('.mobile-status');
    status.replaceChildren(...states.map(([label,className]) => Object.assign(document.createElement('span'), {textContent:label,className})));
    player.dispatchEvent(new CustomEvent('mobile-player-state-updated',{bubbles:true,composed:true}));
  }

  function updateInspectionTabs(area) {
    const entry=Object.entries(areaMap(player)).find(([, [candidate]])=>candidate===area);
    remoteTabs.querySelectorAll('button').forEach(button=>{
      const active=button.dataset.mobileInspect===entry?.[0];
      button.classList.toggle('active',active);
      button.setAttribute('aria-selected',String(active));
    });
  }

  function setMode(mobile) {
    player.classList.toggle('mobile-presentation', mobile);
    const cardAreas=[player.handArea,player.other1Area,player.other2Area,player.zhuangArea,player.panArea];
    cardAreas.forEach(area=>area.classList.toggle('mobile-compact',mobile));
    if (!mobile) {
      cardAreas.forEach(area=>area.classList.remove('mobile-inactive'));
      [player.jiang1Area, player.jiang2Area, player.handArea, player.other1Area, player.other2Area, player.zhuangArea, player.judgmentArea, player.shadowRoot.querySelector('.player-toolbar')].forEach(restore);
      player.mobileArea = null;
      return;
    }
    view.querySelector('.mobile-general-slots').append(player.jiang1Area, player.jiang2Area);
    const local = player.classList.contains('current-player');
    view.querySelector('.mobile-local-cards').hidden = !local;
    if (local) {
      cardAreas.forEach(area=>area.classList.add('mobile-inactive'));
      showArea(player.mobileAreaKey || 'hand');
    }
    update();
  }

  player.mobileView = view;
  player.setPresentationMode = setMode;
  player.updateMobileView = update;
  player.updateMobileInspectionTabs = updateInspectionTabs;
  player.setMobileArea = showArea;
  return {view, update, setMode};
}
