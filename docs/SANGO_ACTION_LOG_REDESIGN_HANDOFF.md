# SANGO Action Log Redesign — Handoff

> 状态：**Deferred / 待独立设计与实现**  
> 目的：供后续 session 直接接手日志架构。当前数据库流量优化工作暂时不修改日志行为。

## 1. 为什么需要 redesign

当前日志由 `gameController.commitRoom()` 生成。每次操作都在整个房间节点执行事务：

```text
subscribe game/{gameId}
→ 得到完整 room snapshot
→ 本地生成修改后的 room
→ 比较 before / after 推断日志
→ transaction 提交整个 room（包括历史日志）
→ unsubscribe
```

本地比较的计算量很小，不是问题。主要问题是 Firebase Realtime Database 的事务范围是整个房间：只调整一点体力，也可能上传房间节点下的玩家、牌堆和日志候选数据；事务冲突时还会重试。

当前相关文件：

| 文件 | 当前职责 |
| --- | --- |
| `src/gameController.js` | `commitRoom`、`writePatch`、`setValue` 将所有状态修改接入整房间事务 |
| `src/roomTransaction.mjs` | 临时订阅完整房间，保证事务开始前缓存完整 |
| `src/actionLog.mjs` | 比较 room before/after，推断移动、摸牌、状态及体力日志 |
| `src/wc/actionLogPanel.js` | 订阅完整 `actionLogs` 节点并渲染 |
| `tests/action-log.test.mjs` | 当前日志文本与隐私规则测试 |
| `docs/SANGO_ACTION_LOG_REQUIREMENTS.md` | 已实现的用户侧日志需求 |

## 2. 关于“根据 subscription update 触发日志”

监听游戏状态变化以后生成日志是可行的，但需要区分两种行为：

1. **Subscription 只负责显示日志**：操作方写入结构化 event；所有客户端订阅 event 并渲染。这是推荐方案。
2. **Subscription 观察状态后再写日志**：每个客户端都会收到同一个变化，可能重复写入；而且单凭最终状态通常无法可靠判断操作者及意图。这种方案需要可信的单一处理者，例如 Cloud Function，不能直接放在每个浏览器客户端。

例如“玩家手牌增加两张”可能表示摸牌、其他玩家交牌、发牌或数据库修复。状态 diff 能说明发生了什么变化，却不一定能说明玩家执行了什么操作。

## 3. 推荐架构：State Update + Structured Event

一次用户操作生成一个唯一 `operationId`，并通过一次 Firebase multi-location `update()` 同时写入：

```text
game/{gameId}/...实际变化字段
game/{gameId}/actionEvents/{operationId}
```

Firebase multi-location update 是原子写入：状态和 event 一起成功或一起失败。客户端日志面板只订阅 `actionEvents`，不再比较整个房间。

建议数据结构：

```json
{
  "version": 1,
  "type": "cards.move",
  "operationId": "firebase-push-key",
  "actor": {
    "seat": "p1",
    "name": "player name"
  },
  "timestamp": { ".sv": "timestamp" },
  "payload": {
    "source": "tableDecks/pai",
    "target": "p1/hand",
    "count": 2
  }
}
```

日志文本应由观看端根据 `type + payload` 生成，例如 `cards.move` 显示成“玩家从牌堆摸了 2 张牌”。数据库保存稳定的结构化事实，不保存最终中文句子，便于以后调整文案、国际化和筛选。

## 4. Event types 初稿

| `type` | 必要 payload | 用途 |
| --- | --- | --- |
| `cards.move` | `source`, `target`, `count` | 拖拽、拿取、交牌、弃牌 |
| `cards.draw` | `targetSeat`, `count` | 玩家摸牌；连续摸牌可以在 UI 层合并显示 |
| `cards.reorder` | `area` | 手牌、区1、区2、公共区或牌堆排序 |
| `cards.visibility` | `area`, `count`, `visible` | 亮置／暗置 |
| `judgment.place` | `targetSeat`, `effect` | 乐不思蜀、兵粮寸断、闪电 |
| `player.hp` | `targetSeat`, `before`, `after` | 当前体力或上限变化 |
| `player.status` | `targetSeat`, `status`, `enabled` | 翻面、连环 |
| `roles.assign` | `count` | 身份分配，不公开具体身份 |
| `cards.deal` | `targetSeats`, `countEach` | 开局发牌 |
| `generals.deal` | `targetSeats`, `countEach` | 发将 |
| `generals.lock` | `targetSeat` | 确认主将、副将，不公开暗将姓名 |
| `deck.shuffle` | `count` | 洗牌 |
| `table.reset` | 可空 | 清台 |

`cards.move` 是否进一步细分为 `cards.discard`、`cards.give`，可以在确认最终日志文案后决定。不要仅通过 source/target 猜测全部语义；用户点击的明确操作应直接提供 `type`。

## 5. 隐藏信息与权限

公共 event 默认不得包含：

- 卡牌 ID、牌名、花色、点数；
- 未亮武将姓名；
- 玩家具体身份；
- 任何可用于从历史记录反推暗牌的稳定卡牌标识。

判定效果是公开信息，可以记录。公开区明牌是否记录牌名，需要产品层单独决定；当前要求是统一只记数量。

如果未来需要私人日志，应另设玩家可读路径，例如：

```text
game/{gameId}/privateEvents/{seat}/{operationId}
```

Firebase Security Rules 必须限制只有对应玩家可以读取，不能依赖 UI 隐藏。

## 6. Deduplication 与 ordering

- `operationId` 必须在操作开始时生成，并在网络重试中复用；不能每次 retry 生成新 ID。
- Firebase push key 可同时提供大致时间顺序；最终显示建议按 `timestamp`，push key 作为稳定 tie-breaker。
- 客户端用 `operationId` 去重。
- 连续摸牌的合并只应是 UI projection，不改写旧 event。这样多个客户端、刷新前后会得到一致的原始记录。
- 不建议让后一次摸牌更新前一条日志；这会增加竞争和额外写入。

## 7. 并发与原子性边界

Multi-location `update()` 能保证一次写入整体成功，但不会自动完成 compare-and-set。卡牌移动仍需防止两个玩家同时操作同一张牌。

后续设计需要在以下方案中选择：

### Option A — Client operation + small locks

为参与移动的卡牌申请短期 lock，获得 lock 后执行状态与 event 的 multi-location update，最后释放 lock。流量较低，需处理客户端掉线、锁超时和多卡锁顺序。

### Option B — Cloud Function / trusted command processor

客户端写入 command；服务端验证当前状态，提交状态和 event。并发和权限最清晰，但增加服务端部署、调用成本和延迟。

### Option C — Transaction at smallest common ancestor

在操作涉及节点的最小共同父节点执行事务。玩家内部移动可以限定到单个玩家；牌堆到玩家通常仍以房间为共同祖先，因此不能完全解决跨区域大事务。

不要用“先删除源卡，再写目标卡”的两个独立写入替代原子移动。

## 8. Subscription 与历史加载

当前 UI 使用：

```js
onValue(ref(db, `game/${gameId}/actionLogs`), ...)
```

后续建议：

- 初次 `query(actionEvents, orderByKey(), limitToLast(100))`；
- 使用 `onChildAdded` 接收新增 event；
- 使用 `onChildRemoved` 处理服务端清理；
- 用户向上滚动时，用 `endBefore(oldestKey) + limitToLast(pageSize)` 加载更旧数据；
- 保留“阅读旧记录时不自动跳到底部”的行为；
- UI 只做 projection，不向数据库反写日志。

## 9. Retention

当前 `appendActionLog()` 每次都复制并裁剪完整日志，保留 500 条。新方案不要在普通客户端的每次操作中扫描或重写历史。

可以选择：

- Cloud Function 定期清理；
- 房间结束时一次清理；
- 按时间设置 TTL（如果所用 Firebase 产品与配置支持）；
- 短期先不做自动清理，只在清台或房间销毁时处理。

保留数量需要重新确认。UI 默认加载 100 条，不代表数据库只能保存 100 条。

## 10. Migration plan

1. 先为当前日志文案、隐私规则和操作粒度保留 baseline tests。
2. 定义 `actionEvent` schema、event types 和 formatter。
3. 让一个低风险操作（建议 `player.hp`）同时写旧日志和新 event，比较 UI 输出。
4. 迁移 `player.status`、`cards.visibility`。
5. 迁移批量 `cards.move`、`cards.draw`、判定和排序。
6. 迁移身份、发牌、发将、洗牌和清台。
7. 日志面板切换为订阅 `actionEvents`，保留旧日志读取作为临时 fallback。
8. 删除整房间 diff logger、`commitRoom()` 对日志的依赖和 `roomTransaction.mjs`（确认没有其他用途后）。
9. 更新 Security Rules，并用两个并发客户端验证去重和原子性。

迁移期间建议增加：

```text
game/{gameId}/metadata/logVersion = 1 | 2
```

避免同一房间同时由两套 renderer 重复显示。

## 11. Baseline 与验收测试

至少覆盖：

1. 一次多牌移动只产生一个 event，失败或取消不产生 event。
2. 多选摸／弃／出保持一次操作、一次原子写入、一个 event。
3. 同一 `operationId` 重试不会出现重复日志。
4. 两个客户端同时移动同一张牌，最多一个成功。
5. 判定效果唯一性与进入顺序保持，event 不泄露底牌。
6. 体力、上限、翻面、连环保存准确的 before/after。
7. 订阅重连、刷新、历史分页不会漏项或重复。
8. 日志 UI 文案保持当前用户可见结果，连续摸牌可在显示层聚合。
9. Firebase 写入统计显示：单字段变化不再上传整个房间或历史日志。
10. 老房间没有 `logVersion` 时仍能打开，不导致新旧日志重复。

## 12. Open questions

后续 session 开始前需要决定：

- 日志的权威来源采用 client event、Cloud Function，还是小范围事务＋锁？
- 是否保留永久历史，还是只保留最近 N 条／N 天？
- 公开区明牌是否允许在日志中显示牌名？
- 连续摸牌在多长时间或什么操作边界内合并显示？
- 玩家改名后，旧日志显示操作时名字还是当前名字？建议保存操作时名字。
- 是否需要私人日志和观战者权限？
- 房间关闭后日志是否导出或归档？

## 13. 当前阶段约束

数据库流量优化与日志 redesign 暂时分开进行。优化其他功能时，应明确记录日志造成的整房间事务仍然存在，不能把流量下降归因于日志已经解决。后续替换日志架构时，再移除 `commitRoom()` 的整房间依赖。
