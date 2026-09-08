import {
  child,
  getDatabase,
  get,
  update,
  set,
  ref,
  onValue,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
} from "firebase/database";

import "./sgCard.js";
import commonCss from "./css/common.css";
import areaCss from "./css/sgArea.css";
import { orderedEntries } from "../cardOrder.mjs";

class SgArea extends HTMLElement {
  deckRef;
  shadowRoot;
  gameController;
  style;
  areaType;
  cardArea;
  cardsRef;
  dbPathStr;
  isTable;
  cards = {};

  constructor() {
    super();
    this.shadowRoot = this.attachShadow({ mode: "open" });

    this.style = document.createElement("style");
    this.style.append(commonCss);
    this.style.append(areaCss);

    this.warpper = document.createElement("div");
    this.warpper.classList.add("wrapper");
    this.warpper.setAttribute("part", "wrapper");

    this.cardArea = document.createElement("div");
    this.cardArea.classList.add("card-area");
    this.cardArea.setAttribute("part", "card-area");
    this.cardArea.setAttribute("name", "card-area");

    this.controlArea = document.createElement("div");
    this.controlArea.classList.add("control-area");
    this.controlArea.setAttribute("part", "control-area");
    const shuffleButton = document.createElement("button");
    shuffleButton.innerHTML = "洗";
    shuffleButton.addEventListener("click", () => {
      this.shuffle();
    });
    this.controlArea.appendChild(shuffleButton);
    this.recycleBtn = document.createElement("button");
    this.recycleBtn.innerHTML = "收";
    this.recycleBtn.addEventListener("click", () => {
      this.recycle();
    });
    this.controlArea.appendChild(this.recycleBtn);

    this.shadowRoot.append(this.style);
    this.warpper.append(this.cardArea);
    this.warpper.append(this.controlArea);
    this.shadowRoot.append(this.warpper);
  }

  getAreaName() {
    switch (this.areaType) {
      case "jiang-area":
        return "将";
      case "pai-area":
        return "牌";
      case "zhuang-area":
        return "装";
      case "hand-area":
        return "牌";
      case "other1-area":
        return "区1";
      case "other2-area":
        return "区2";
    }
  }

  enableOverflowControls() {
    if (this.expandButton) return;
    this.classList.add('overflow-controls');
    this.expandButton = document.createElement('button');
    this.expandButton.className = 'expand-area';
    this.expandButton.type = 'button';
    this.expandButton.innerHTML = '<span class="area-label"></span><span class="expand-label">展开 ↗</span>';
    this.expandButton.setAttribute('aria-expanded', 'false');
    this.expandButton.addEventListener('click', () => this.expandAll());
    this.scrollButtons = [-1, 1].map(direction => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'area-scroll ' + (direction < 0 ? 'scroll-left' : 'scroll-right');
      button.textContent = direction < 0 ? '‹' : '›';
      button.setAttribute('aria-label', direction < 0 ? '向左滚动' : '向右滚动');
      button.hidden = true;
      button.addEventListener('click', () => this.cardArea.scrollBy({left: direction * Math.max(100, this.cardArea.clientWidth * .7), behavior: 'smooth'}));
      return button;
    });
    this.expandedHeading = document.createElement('header');
    this.expandedHeading.className = 'expanded-heading';
    this.expandedHeading.innerHTML = '<strong></strong><button type="button">收起</button>';
    this.expandedHeading.querySelector('button').onclick = () => this.warpper.hidePopover();
    this.warpper.prepend(this.expandedHeading);
    this.warpper.append(this.expandButton, ...this.scrollButtons);
    this.updateOverflow = () => {
      const name = this.areaType === 'hand-area' ? '手牌' : this.getAreaName();
      this.expandButton.querySelector('.area-label').textContent = name;
      this.expandButton.setAttribute('aria-label', `展开全部${name}`);
      this.expandedHeading.querySelector('strong').textContent = `${name} · 全部卡牌`;
      const max = this.cardArea.scrollWidth - this.cardArea.clientWidth;
      this.scrollButtons.forEach((button, i) => {
        const atEdge = i === 0 ? this.cardArea.scrollLeft <= 1 : this.cardArea.scrollLeft >= max - 1;
        button.hidden = this.expanded || max <= 1 || this.cardArea.clientWidth === 0 || atEdge;
      });
    };
    this.cardArea.addEventListener('scroll', this.updateOverflow, {passive: true});
    this.cardArea.addEventListener('wheel', event => {
      if (this.expanded || event.ctrlKey || event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      const before = this.cardArea.scrollLeft;
      this.cardArea.scrollLeft += event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? this.cardArea.clientWidth : 1);
      if (before !== this.cardArea.scrollLeft) event.preventDefault();
    }, {passive: false});
    this.addEventListener('cards-updated', () => requestAnimationFrame(this.updateOverflow));
    this.warpper.addEventListener('toggle', event => {
      if (event.newState !== 'closed' || !this.expanded) return;
      this.expanded = false;
      this.warpper.removeAttribute('popover');
      this.warpper.setAttribute('part', 'wrapper');
      this.cardArea.setAttribute('part', 'card-area');
      this.expandButton.setAttribute('aria-expanded', 'false');
      this.cardArea.scrollTop = 0;
      this.cardArea.scrollLeft = this.savedScrollLeft;
      this.updateOverflow();
      this.expandButton.focus({preventScroll: true});
    });
    this.overflowObserver = new ResizeObserver(this.updateOverflow);
    this.overflowObserver.observe(this.cardArea);
    this.updateOverflow();
  }

  expandAll() {
    if (this.expanded) return;
    this.savedScrollLeft = this.cardArea.scrollLeft;
    this.expanded = true;
    // Keep the live card nodes in place, preserving selection, subscriptions and drag targets.
    this.warpper.setAttribute('part', 'expanded-wrapper');
    this.cardArea.setAttribute('part', 'expanded-card-area');
    this.warpper.setAttribute('popover', 'auto');
    this.warpper.showPopover();
    this.cardArea.scrollTop = this.cardArea.scrollLeft = 0;
    this.expandButton.setAttribute('aria-expanded', 'true');
    this.updateOverflow();
    this.expandedHeading.querySelector('button').focus();
  }

  connectedCallback() {
    this.overflowObserver?.observe(this.cardArea);
  }

  disconnectedCallback() {
    this.overflowObserver?.disconnect();
  }

  init(deckRef, gameController) {
    this.deckRef = deckRef;
    this.dbPathStr = deckRef.toString();
    this.cardsRef = child(deckRef, "/cards");
    this.areaType = deckRef.key + "-area";
    this.gameController = gameController;
    this.isTable = this.gameController.isTableItem(this.deckRef);
    this.cardCount = 0;

    this.classList.add(this.areaType);
    if (this.isTableArea()) {
      this.classList.add("table-area");
    }

    onValue(this.cardsRef, snapshot => {
      const entries = orderedEntries(snapshot.val() || {}, this.areaType === 'pan-area');
      const keys = new Set(entries.map(item => item.key));
      Object.entries(this.cards).forEach(([key, card]) => {
        if (!keys.has(key)) { card.remove(); delete this.cards[key]; }
      });
      entries.forEach(({key, value}, index) => {
        let card = this.cards[key];
        if (!card) {
          card = document.createElement('sg-card');
          card.className = this.areaType + '-card';
          if (this.classList.contains('current-player')) card.classList.add('current-player');
          card.init(child(this.cardsRef, key), value, this.gameController);
          this.cards[key] = card;
          this.cardArea.append(card);
        }
        card.style.order = index;
      });
      this.cardCount = entries.length;
      this.classList.toggle('has-cards', this.cardCount > 0);
      this.dispatchEvent(new CustomEvent('cards-updated', {bubbles: true, composed: true}));
    });
    this.addEventListener("drop", (e) => {
      e.preventDefault();
      console.log("areaDrop");
      const fromPath = e.dataTransfer.getData("text");

      if (fromPath.includes("/jiang")) {
        return;
      }
      // is in selected wc
      let isSelected = false;
      for (let i = 0; i < this.gameController.selectedCards.length; i++) {
        const wc = this.gameController.selectedCards[i];
        if (wc.cardRef.toString().includes(fromPath)) {
          isSelected = true;
          break;
        }
      }

      if (!isSelected) {
        this.gameController.moveCardFromPathToRef(
          fromPath,
          child(this.deckRef, "/cards")
        );
      } else {
        this.gameController.dropSeletedCards(child(this.deckRef, "/cards"));
      }
    });
    this.addEventListener("dragover", (e) => {
      e.preventDefault();
    });
  }

  visibilityCheck() {
    if (!this.cardArea.hasChildNodes()) {
      this.warpper.classList.add("hide");
    } else {
      this.warpper.classList.remove("hide");
    }
  }

  isTableArea() {
    return this.deckRef.parent.key == "tableDecks";
  }

  shuffle() {
    this.gameController.shuffleDeck(this.deckRef);
  }

  recycle() {
    this.gameController.recycle(this.cardsRef);
  }
}

export { SgArea };
customElements.define("sg-area", SgArea);
