# 排行榜/积分榜 Demo

## 一、业务背景与目标

### 行业场景

**游戏排行榜系统** - 玩家日常查看的核心功能

### 角色与行为链路

1. **玩家** 进入排行榜页面
2. 查看 Top-100 玩家排名
3. 查看自己的排名位置
4. 观察实时排名变化

### 问题与挑战

- 10,000+ 玩家，每次完整排序开销大
- 频繁积分更新，需要增量计算

---

## 二、核心算法说明

### 1. 完整排序

```typescript
// 时间复杂度: O(n log n)
const sorted = players.sort((a, b) => b.score - a.score);
const topK = sorted.slice(0, k);
```

### 2. 快速选择（QuickSelect）

```typescript
// 平均时间复杂度: O(n)
function quickSelect(arr, left, right, k): number {
  const pivotIdx = partition(arr, left, right);
  const rank = pivotIdx - left + 1;

  if (rank === k) return arr[pivotIdx];
  if (rank > k) return quickSelect(arr, left, pivotIdx - 1, k);
  return quickSelect(arr, pivotIdx + 1, right, k - rank);
}
```

### 3. 最小堆

```typescript
// 时间复杂度: O(n log k)
const minHeap = []; // 大小为 k 的最小堆

for (player of players) {
  if (heap.size < k) {
    heap.push(player);
  } else if (player.score > heap.peek()) {
    heap.replaceMin(player);
  }
}
```

---

## 三、算法对比

| 算法     | 时间复杂度 | 空间复杂度 | 适用场景                |
| -------- | ---------- | ---------- | ----------------------- |
| 完整排序 | O(n log n) | O(n)       | 需要完整排序结果        |
| 快速选择 | O(n) 平均  | O(1)       | 只需前 K 个，不需要顺序 |
| 最小堆   | O(n log k) | O(k)       | 流式数据，k 较小        |

---

## 四、可选进阶挑战

- [ ] 实现真正的最小堆数据结构
- [ ] 支持查询任意玩家排名
- [ ] 分段缓存热点数据
- [ ] WebSocket 实时推送排名变化
