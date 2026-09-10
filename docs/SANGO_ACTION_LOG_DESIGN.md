# Sango 本地行动日志设计

> 状态：已实现  
> 日期：2026-09-09  
> 目的：定义下一版行动日志的产品边界、状态推断方式及 compact action hint 协议。实现时以本文为设计依据。

## 1. 设计目标

行动日志是当前客户端的辅助信息，不是房间状态或审计记录：

- 日志列表只保存在页面内存中，刷新、退出或重新进入房间后清空。
- 玩家进入房间时不回放此前的操作。
- 第一次收到 Firebase snapshot 时只建立 baseline，不生成日志。
- 后续 subscription 更新到达时，客户端比较 previous/current state 并生成本地日志。
- 不要求跨客户端严格一致；允许网络合并、短暂离线或并发覆盖造成少量漏记、重复或描述差异。
- 目标是约 99% 的用户可感知一致性。
- 移除现有 Firebase `actionLogs` 历史存储、500 条保留逻辑，以及日志对整房间 transaction 的依赖。

基本流程：

```text
Firebase state subscription
→ 首次 snapshot：保存 baseline，不生成日志
→ 后续 snapshot：比较 previous/current
→ 状态信息足够：直接生成 local log
→ 状态信息不足：结合 compact action hint 生成 local log
→ 日志只追加到当前客户端的内存列表
```

## 2. 优先使用状态 diff

只要状态变化本身足以描述结果，就直接从 subscription diff 生成日志，不额外增加 Firebase 写入。

建议直接通过状态 diff 处理：

- HP 和 HP 上限变化。
- 翻面、连环等玩家状态变化。
- 卡牌亮出、暗置。
- 选将锁定或解除。
- 可以从来源区域、目标区域和卡牌对应关系确定的普通卡牌移动。
- 手牌、装备区、判定区等区域的数量变化。
- 普通牌序和判定顺序变化。
- 玩家加入、离开或更名（如产品需要记录）。

例如 `p3.hp` 从 `4/5` 变为 `3/5` 时，本地直接生成 `p3 的体力：4/5 → 3/5`，不写 action hint。这里不追踪是谁修改了 HP；结果描述已经满足日志用途。

## 3. 仅在缺少语义时写 action hint

Action hint 只补充无法从状态 diff 得出的操作者或业务语义，或者指示客户端把一批底层变化合并成一条日志。它不是历史日志，只是一个固定大小、不断覆盖的瞬时提示。

建议需要 action hint 的行为：

| 行为 | 原因 |
| --- | --- |
| 操作其他玩家的牌 | diff 能识别受影响玩家和移动数量，但不能识别操作者 |
| 让其他玩家摸牌 | diff 能识别目标玩家摸牌，但不能识别是谁发起 |
| 玩家之间交牌 | 路径变化不一定能区分“交给”“获得”或其他业务语义 |
| 批量发牌 | 需要把牌堆及多个玩家的变化合并成一条日志 |
| 批量发将 | 需要把多个选将区变化合并成一条日志 |
| 分配身份 | 需要合并多个身份字段变化，并继续遵守身份隐私规则 |
| 洗牌 | 大量 order 变化无法可靠区分于普通手动排序 |
| 重置牌堆 | 需要合并牌堆、牌堆底、弃牌区及显示状态变化 |
| 清空或重置桌面 | 需要抑制大量零散移动和状态清除日志 |
| 特殊语义的批量操作 | 例如技能造成多个区域变化，但日志应展示技能语义 |

如果文案不需要显示操作者，部分跨玩家操作也可以完全依靠 diff。例如显示 `p3 的 2 张牌被弃置`，而不是 `p1 弃置了 p3 的 2 张牌`。

## 4. 跨玩家弃牌示例

假设 `p1` 弃置 `p3` 的两张手牌。一次原子 multi-location update 同时完成：

```text
game/{gameId}/p3/hand/cards/{oldKeyA} = null
game/{gameId}/p3/hand/cards/{oldKeyB} = null
game/{gameId}/tableDecks/discard/cards/{newKeyA} = cardA
game/{gameId}/tableDecks/discard/cards/{newKeyB} = cardB
game/{gameId}/runtime/a = compact action hint
```

客户端收到更新后：

1. diff 识别 `p3` 手牌减少两张、弃牌区增加对应两张，得到 target、source、destination 和 count。
2. action hint 只补充 opcode=`discard other` 和 actor=`p1`。
3. 本地生成 `p1 弃置了 p3 的 2 张牌`。
4. 日志只进入当前客户端内存，不写回 Firebase。

状态移动与 action hint 必须放在同一次原子 update 中，否则客户端可能将旧提示错误关联到新状态。

## 5. Compact action hint encoding

建议把 hint 存储在单个固定路径：

```text
game/{gameId}/runtime/a
```

使用稳定、带版本号的 opcode enum，不使用 action 名称的 hash。Hash 不能自然解码且存在碰撞；稳定 enum 更容易演进和调试。

推荐格式：

```text
version|opcode|actor|optional arguments|nonce
```

例如：

```text
1|d|1|aZ8Q
```

含义为协议版本 1、`discard other`、操作者 `p1`、短 nonce `aZ8Q`。目标玩家和数量从状态 diff 推断，不重复传输。

初始 opcode 建议：

| Opcode | 行为 | 格式示例 |
| --- | --- | --- |
| `d` | 弃置其他玩家的牌 | `1|d|1|aZ8Q` |
| `m` | 让其他玩家摸牌 | `1|m|1|K4pB` |
| `t` | 玩家之间交牌 | `1|t|1|W2cN` |
| `o` | 操作其他玩家的普通卡牌移动 | `1|o|1|B6kQ` |
| `c` | 批量发牌 | `1|c|1|R8xM` |
| `j` | 批量发将 | `1|j|1|H5qD` |
| `i` | 分配身份 | `1|i|1|N7sL` |
| `s` | 洗牌 | `1|s|1|p|C9vF`，其中 `p` 表示牌堆 |
| `r` | 重置牌堆 | `1|r|1|T6bQ` |
| `x` | 重置桌面 | `1|x|1|M3jA` |
| `p` | 打出牌 | `1|p|1|Q2mN` |
| `e` | 弃置自己的牌 | `1|e|1|L7vK` |
| `w` | 从牌堆摸牌 | `1|w|1|D4rT` |
| `v` | 展示／判定牌堆顶牌 | `1|v|1|S8aP` |
| `k` | 从弃牌堆收入手牌 | `1|k|1|F3cH` |
| `u` | 调整牌堆顺序 | `1|u|1|J6bW` |

具体实现前应再次核对 opcode 是否覆盖真实操作入口。已经能可靠通过 diff 表达的动作，不要为了统一而强制写 hint。

## 6. Nonce 与本地去重

连续两次相同操作如果写入完全相同的值，Firebase 可能不会产生新的 value change，因此每个 hint 必须带短 nonce。

4 个 Base64 风格字符提供 `64^4 = 16,777,216` 种组合。这里不要求全局唯一，只需极低概率地避免连续值相同。

客户端应：

- 首次 snapshot 时保存当前 nonce，但不生成日志。
- 后续只处理 nonce 发生变化的 hint。
- 处理完成后记住 nonce，避免本地事件重放。
- 接受慢客户端因连续覆盖而漏掉中间 hint；这符合 best-effort 边界。

## 7. 数据量原则

完整 action object 通常约 `120–180 bytes`；`1|d|1|aZ8Q` 约 `10 bytes`。算上 Firebase 路径和协议开销，compact string 仍可显著降低每个客户端的同步流量。

Firebase Realtime Database 使用 JSON 数据模型。真正的 binary 通常需要 Base64，反而增加体积，因此优先使用短 ASCII string。

## 8. 实现 NOTE：编码必须有解释性注释

实现 encoder、decoder、opcode 表、nonce 生成、baseline 初始化和原子写入时，必须添加注释解释：

- 为什么协议带版本号。
- 为什么使用稳定 opcode 而不是 hash。
- 哪些字段必须编码，哪些字段由状态 diff 推断。
- nonce 用于让连续相同操作可观察，而不是历史记录 ID。
- action hint 是瞬时协调元数据，不是可持久化、可回放的日志。
- hint 必须与对应状态修改放在同一次原子 update 中。
- 未识别的版本或 opcode 应安全降级为普通状态 diff。

建议在编码实现附近保留类似注释：

```js
// Compact, versioned hint for local best-effort logs.
// Target and count are derived from the atomic state diff.
// The nonce makes consecutive identical actions observable.
// This value is transient coordination metadata, not a replayable log.
```

不要只用 `encode()`、`decode()` 等函数名表达协议。这套编码牺牲了一部分数据库可读性，解释性注释是设计的一部分。
