# SANGO Firebase Traffic Optimization Checklist

> 目标：减少 Firebase Realtime Database 的上传、下载和事务重试流量。  
> 范围：remote database traffic；本地对象遍历、日志 diff 和轻量 UI 计算不作为本轮主要优化目标。  
> 使用方式：完成一项实现及对应验证后，将 `[ ]` 改为 `[x]`，并填写“完成记录”。

## 基本原则

- 优先缩小 transaction / write scope，避免小字段修改提交整个 `game/{gameId}`。
- 保留批量操作的原子性：一次多选移动必须整体成功或整体失败。
- 保留并发约束：同一张牌不能被两个客户端同时成功移动；装备容量和判定效果唯一性不能因优化失效。
- Multi-location `update()` 可以原子写多个路径，但本身没有 compare-and-set 语义。
- 减少 subscription 范围前，先确认不会被临时整房间订阅抵消收益。
- 每项优化先固定当前数据结构和用户可见结果作为 baseline，再修改实现。
- 日志架构暂不在本 checklist 中实现，参见 [`SANGO_ACTION_LOG_REDESIGN_HANDOFF.md`](./SANGO_ACTION_LOG_REDESIGN_HANDOFF.md)。
- 日常源码修改不重新构建 `main.js`；准备 commit 时再执行构建。

## 测试与测量基线

- [x] **T00 — Inventory current database operations**
  - 列出所有 `get`、`onValue`、`onChild*`、`set`、`update`、`runTransaction` 路径。
  - 标明 initial read、continuous subscription、one-shot read、transaction 和 multi-location update。
  - 完成记录：见下方统一完成记录。

- [x] **T01 — Baseline state-result tests**
  - 用当前数据结构固化以下操作结果：体力、状态、亮暗置、移动、排序、身份、发牌、洗牌、发将、清台。
  - 重点验证最终数据库状态，不把当前整房间事务实现写死在测试里。
  - 完成记录：见下方统一完成记录。

- [x] **T02 — Traffic instrumentation**
  - 在 Firebase adapter 或 test double 中记录每次 read/write/transaction 的路径和 payload size。
  - 每项优化至少比较 before / after：请求路径、请求次数、上传 payload、首次下载范围。
  - 完成记录：见下方统一完成记录。

- [x] **T03 — Concurrent-client test harness**
  - 支持两个 controller 同时操作同一房间。
  - 覆盖同一张牌竞争、装备容量竞争、判定效果竞争。
  - 完成记录：见下方统一完成记录。

## Phase 1 — 高频小字段写入

- [x] **W01 — Player HP / max HP** · Priority: High
  - 当前入口：`sgHpbar → gameController.setValue()`。
  - 当前问题：单个 `hp` 字段变化经过 `commitRoom()`，事务范围为整个房间。
  - 目标：只读取／写入目标玩家的体力相关字段；不上传牌堆、其他玩家和历史日志。
  - Baseline：`4/5 → 3/5`、上限变化、最小值 0、当前体力不得超过上限。
  - 验收：traffic test 证明 HP 更新不对 `game/{gameId}` 执行整节点 transaction/write。
  - 完成记录：见下方统一完成记录。

- [x] **W02 — Player status: 翻面 / 连环** · Priority: High
  - 当前入口：`sgPlayer → gameController.setValue(debuff)`。
  - 目标：只修改目标玩家状态；连续快速点击不能覆盖另一个状态位的更新。
  - Baseline：翻面、连环可独立开关，最终仍保存当前兼容格式或明确迁移格式。
  - 验收：不读取／提交完整房间；两个状态同时修改不会丢失其中一个。
  - 完成记录：见下方统一完成记录。

- [x] **W03 — Single card/general visibility** · Priority: High
  - 当前入口：`showCard()`、`resetCard()`、`showPai()`、`showJiang()`。
  - 目标：只修改具体卡牌的 `show` 字段。
  - Baseline：牌堆亮置显示正面；进入弃牌区清除亮置；武将亮暗置行为保持。
  - 验收：一次亮暗置只写卡牌字段，不读取／提交完整房间。
  - 完成记录：见下方统一完成记录。

- [x] **W04 — Batch visibility** · Priority: High
  - 当前入口：`showSelectedCards()`。
  - 当前问题：逐张调用，选 N 张可能触发 N 次数据库操作。
  - 目标：一次 multi-location update 修改所有选中牌的 `show` 字段。
  - Baseline：一次点击对全部选中牌生效，选择状态正确清除。
  - 验收：N 张牌产生一次数据库 write，失败时不出现部分修改。
  - 完成记录：见下方统一完成记录。

## Phase 2 — 卡牌移动与排序

- [x] **M01 — Same-area reorder** · Priority: High
  - 当前入口：`moveOrderedCards(paths, targetRef, beforeKey)`。
  - 范围：手牌、区1、区2、公共区、牌堆；装备区和判定区已禁用拖拽排序。
  - 目标：读取目标区域并只提交发生变化的 `order` 字段。
  - Baseline：多选牌顺序保持、插入位置正确、同区域排序不改变卡牌 ID/亮置状态。
  - 验收：不读取／提交玩家其他区域和完整房间。
  - 完成记录：见下方统一完成记录。

- [x] **M02 — Cross-area card move** · Priority: High
  - 当前入口：拖拽、`moveCardToPlayerArea()`、`moveCardToTableDeck()`、摸／弃／出。
  - 目标：只读取 source area(s) 与 target area，只提交源删除、目标新增及必要排序字段。
  - Baseline：多选一次提交；卡牌顺序保持；进入弃牌区清除 `show`；移出判定区清除判定字段。
  - 并发要求：同一张牌最多被一个客户端成功移动。
  - 验收：普通跨区域移动不执行整房间事务；冲突测试通过。
  - 完成记录：见下方统一完成记录。

- [x] **M03 — Equipment capacity** · Priority: High
  - 当前规则：装备区最多四张，同区不支持排序，移入固定追加。
  - 目标：容量校验和移动在并发下保持一致，不能依赖容易过期的单独 `get()`。
  - 验收：两个客户端同时向剩余一个空位移牌，最多一个成功；失败方原牌不丢失。
  - 完成记录：见下方统一完成记录。

- [x] **M04 — Judgment placement** · Priority: High
  - 当前规则：乐不思蜀、兵粮寸断、闪电各最多一张，按进入顺序显示，不支持拖拽排序。
  - 目标：只读取源牌和目标判定区；提交移动、`judgmentEffect` 和顺序字段。
  - 验收：两个客户端同时放入相同效果时最多一个成功；失败方原牌不丢失。
  - 完成记录：见下方统一完成记录。

- [x] **M05 — Recycle / legacy move paths** · Priority: Medium
  - 当前入口：`recycle()`、`moveCardFromPathToRef()`、`moveCardRefToTargetRef()`、`dropSeletedCards()`。
  - 目标：所有仍在使用的入口复用新的批量移动实现；删除或隔离未使用的旧入口。
  - 验收：没有逐张整房间事务，没有与主移动流程不同的数据结果。
  - 完成记录：见下方统一完成记录。

## Phase 3 — 批量公共工具

- [x] **B01 — Assign roles** · Priority: Medium
  - 当前入口：`assignRoles()`。
  - 当前问题：逐玩家调用 `setValue()`，六人局可产生六次操作。
  - 目标：一次 multi-location update 写入所有玩家身份。
  - 隐私：不得因优化向无权限客户端扩大身份读取范围。
  - 验收：一次 write，身份分配数量和规则与 baseline 相同。
  - 完成记录：见下方统一完成记录。

- [x] **B02 — Deal four cards** · Priority: Medium
  - 当前入口：`dealCards()`。
  - 规则：只有所有玩家手牌为空时，按座次从牌堆给每人四张。
  - 目标：只读取牌堆及六个手牌区；只提交相关牌堆和手牌变化。
  - 并发要求：多人同时点击发牌只能有一个操作成功。
  - 验收：一次操作、没有重复发牌、不会产生部分玩家已发牌的状态。
  - 完成记录：见下方统一完成记录。

- [x] **B03 — Shuffle draw pile** · Priority: Medium
  - 当前入口：`resetPai()`、`shuffleDeck()`。
  - 目标：只处理 `pai`、`paiBottom`、`discard`；不读取／提交玩家数据和日志历史。
  - Baseline：合并相关牌堆、清除亮置和判定字段、重新生成稳定 order。
  - 验收：操作范围限制在 `tableDecks` 的相关节点。
  - 完成记录：见下方统一完成记录。

- [x] **B04 — Deal generals** · Priority: Medium
  - 当前入口：`dispatchJiang()`。
  - 目标：一次批量写入各玩家七张候选武将，并重置主将、副将和锁定状态。
  - 验收：不提交牌堆和普通卡牌区域；候选数量及随机结果符合 baseline。
  - 完成记录：见下方统一完成记录。

- [x] **B05 — Lock selected generals** · Priority: Medium
  - 当前入口：`SgJiangArea.lockInSelected()`。
  - 目标：只读取两张候选牌，原子移动到主将／副将并更新锁定状态。
  - 并发要求：重复点击或另一客户端操作不会复制武将。
  - 完成记录：见下方统一完成记录。

- [x] **B06 — Reset table** · Priority: Low
  - 当前入口：`resetTable()`。
  - 说明：清台本身会修改大部分卡牌区域，较大的 payload 合理。
  - 目标：不连带提交不相关的玩家资料或日志历史；只写确实需要重置的路径。
  - 验收：所有规则要求的区域被清空，玩家名称等非游戏状态保持。
  - 完成记录：见下方统一完成记录。

## Phase 4 — 下载与 subscription

- [x] **R01 — Room entry / reconnect** · Priority: Medium
  - 当前入口：`sgGameMenu` 的 `get(game/{gameId})`。
  - 当前问题：为了房间存在性、人数和重连座位读取整个房间。
  - 目标：改读 `metadata` 和独立 `seats`／玩家名称摘要。
  - 数据结构候选：`game/{gameId}/metadata`、`game/{gameId}/seatSummary/{seat}`。
  - 验收：进入房间不下载牌堆、玩家卡牌区域和日志。
  - 完成记录：见下方统一完成记录。

- [x] **R02 — Opponent hidden areas on demand** · Priority: Medium
  - 范围：对手手牌、区1、区2。
  - 当前问题：页面初始化时订阅所有区域卡牌详情；关闭弹窗后仍持续订阅。
  - 目标：默认只订阅公开摘要或数量；打开区域弹窗时订阅详情，关闭后释放。
  - 数据结构候选：玩家下增加 `counts/{area}`，与移动操作原子更新。
  - 隐私：手牌只能提供允许公开的牌背／数量信息。
  - 验收：未打开对手区域时，不下载该区域完整 cards payload。
  - 完成记录：见下方统一完成记录。

- [x] **R03 — Opponent general candidates on demand** · Priority: Medium
  - 当前问题：所有玩家的 `jiang` 候选区在初始化时订阅。
  - 目标：自己的候选区按需加载；其他玩家只订阅公开主将、副将和锁定状态。
  - 验收：普通桌面加载不下载其他玩家七张候选武将。
  - 完成记录：见下方统一完成记录。

- [x] **R04 — Remove redundant area-count subscriptions** · Priority: Low
  - 当前位置：`sgPlayer` 对 `hand`、`other1`、`other2` 的计数监听，与 `SgArea` cards 监听重叠。
  - 目标：若区域详情已加载，直接由区域 snapshot 计算数量；若按需加载，改订阅独立 count 字段。
  - 说明：Firebase SDK 可能共享缓存，此项需要用 traffic instrumentation 判断实际收益。
  - 完成记录：见下方统一完成记录。

- [x] **R05 — Subscription lifecycle** · Priority: Medium
  - 目标：组件销毁、切换房间、关闭按需弹窗时可靠 unsubscribe。
  - 覆盖：`SgArea`、`SgPaiArea`、`SgJiangArea`、`SgCard`、`SgJiang`、`SgPlayer`、seat menu。
  - 验收：重复进入房间不会累积 active listeners，同一变化不会触发重复 UI 更新。
  - 完成记录：见下方统一完成记录。

## 完成记录（2026-09-09）

| 项目 | 实现与验证 |
|---|---|
| T00–T03 | 完成数据库入口清点；memory adapter 记录读写路径、近似 payload、transaction 和活动订阅；加入最终状态 baseline 与双 controller 并发测试。 |
| W01–W04 | HP、状态位、单张及批量亮暗置改为字段级 `set`／`update`；`high-frequency-traffic.cjs` 通过。 |
| M01–M05 | 排序和跨区移动统一使用区域／卡牌锁及一次 multi-location update；装备容量、判定唯一性及旧拖放入口测试通过。 |
| B01–B06 | 身份、发牌、洗牌、发将、锁将、清台均改为窄路径批量更新；对应六项 browser traffic tests 通过。 |
| R01 | 进入已有房间只读取 `pCount` 与座位昵称；`room-entry-traffic.cjs` 通过。 |
| R02–R04 | 增加 `areaCounts`；对手手牌、区1、区2按需加载并在关闭面板后释放；不再下载对手候选武将或重复监听父区域。旧房间缺少计数时会执行一次兼容迁移。 |
| R05 | 区域快照直接更新卡片，移除每张牌各自的重复监听；所有区域、HP、玩家及牌底监听随组件销毁释放；`subscription-lifecycle.cjs` 验证活动监听归零。 |

验证汇总：流量优化 browser tests、并发 tests、20 个非日志单元测试及完整 `drag-check.cjs` 通过。旧 `action-log.test.mjs` 的 3 个文案断言属于 L00 延期范围。

## Deferred — Action log redesign

- [ ] **L00 — Redesign action log architecture** · Deferred
  - 本轮不实现。
  - 旧日志生成器仍依赖 `commitRoom()`；本轮已迁移的操作不再调用它，因此暂不生成对应日志，等待 L00 统一接入新的事件结构。
  - 建议方案、event schema、去重、分页、权限和迁移步骤参见 [`SANGO_ACTION_LOG_REDESIGN_HANDOFF.md`](./SANGO_ACTION_LOG_REDESIGN_HANDOFF.md)。
  - 完成记录：_待填写_

## 每项完成时的记录模板

```md
- 完成日期：YYYY-MM-DD
- 修改文件：
- Baseline tests：
- 新增／更新 tests：
- Before traffic：read path / write path / request count / approximate bytes
- After traffic：read path / write path / request count / approximate bytes
- Atomicity / concurrency result：
- Compatibility notes：
- Remaining risks：
```

## Recommended execution order

```text
T00 → T01 → T02 → T03
→ W01 → W02 → W03 → W04
→ M01 → M02 → M03 → M04 → M05
→ B01 → B02 → B03 → B04 → B05 → B06
→ R01 → R02 → R03 → R04 → R05
→ L00（独立日志 redesign session）
```



