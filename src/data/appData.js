const deckMock = {
  cards: [],
  display: "normal", // 自己可见，别人不可见，还没想好怎么定义这个。
};

const playerDecksMock = {
  jiang: { ...deckMock }, // wu jiang
  hand: { ...deckMock }, // shou pai
  pan: { ...deckMock }, // pan ding
  zhuang: { ...deckMock }, // zhuang bei
};

const playerMock = {
  name: "p",
  state: "off",
  hp: "4/4",
  ...playerDecksMock,
};
const jiangDeckMock1 = {
  cards: [
    { id: "j1", show: "0" },
    { id: "j2", show: "0" },
    { id: "j3", show: "0" },
  ],
  display: "normal",
};

const paiDeckMock1 = {
  cards: [
    { id: "p1", show: "0" },
    { id: "p2", show: "0" },
    { id: "p3", show: "0" },
  ],
  display: "normal",
};

const tableDecksMock = {
  jiang: { ...deckMock },
  pai: { ...deckMock },
  discard: { ...deckMock },
};

const cardMock = {
  id: "j1",
  show: "0",
};

const tableMock = {
  p1: { ...playerMock, name: "p1" },
  p2: { ...playerMock, name: "p2" },
  tableDecks: {
    jiang: jiangDeckMock1,
    pai: paiDeckMock1,
    discard: { ...deckMock },
  },
};

const initData = {
  p1: { ...playerMock, name: "empty" },
  p2: { ...playerMock, name: "empty" },
  p3: { ...playerMock, name: "empty" },
  p4: { ...playerMock, name: "empty" },
  p5: { ...playerMock, name: "empty" },
  p6: { ...playerMock, name: "empty" },
  p7: { ...playerMock, name: "empty" },
  p8: { ...playerMock, name: "empty" },
  tableDecks: {
    jiang: jiangDeckMock1,
    pai: paiDeckMock1,
    discard: { ...deckMock },
  },
};

const initDataMock1 = {
  p1: { ...playerMock, name: "empty" },
  p2: { ...playerMock, name: "empty" },
  p3: { ...playerMock, name: "empty" },
  p4: { ...playerMock, name: "empty" },
  p5: { ...playerMock, name: "empty" },
  p6: { ...playerMock, name: "empty" },
  p7: { ...playerMock, name: "empty" },
  p8: { ...playerMock, name: "p8" },
  tableDecks: {
    jiang: jiangDeckMock1,
    pai: paiDeckMock1,
    discard: { ...deckMock },
  },
};

export {
  deckMock,
  playerDecksMock,
  playerMock,
  jiangDeckMock1,
  paiDeckMock1,
  tableDecksMock,
  cardMock,
  tableMock,
  initData,
  initDataMock1,
};
