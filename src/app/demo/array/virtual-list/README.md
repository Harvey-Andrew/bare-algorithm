# 虚拟列表 Demo

## 一、业务背景与目标

### 行业场景

**社交 App 消息列表** - 用户日常高频使用的核心功能

### 角色与行为链路

1. **用户** 进入聊天会话
2. 滚动浏览历史消息（可能有 10 万+ 条）
3. 快速定位到特定消息
4. 持续接收新消息推送

### 问题与挑战

- **传统方案**: 渲染 10 万条消息 → 10 万个 DOM 节点 → 页面卡死
- **虚拟列表**: 仅渲染可见区域（约 10-20 条）→ 流畅滚动

---

## 二、数据协议

### 接口 JSON 示例

```json
{
  "code": 0,
  "data": {
    "messages": [
      {
        "id": "msg_00000001",
        "senderId": "user_42",
        "senderName": "小明",
        "avatar": "bg-blue-500",
        "content": "今天天气真好！",
        "timestamp": 1703500800000,
        "type": "text",
        "isRead": true
      }
    ],
    "total": 100000
  }
}
```

### 字段说明

| 字段       | 类型    | 说明              |
| ---------- | ------- | ----------------- |
| id         | string  | 消息唯一 ID       |
| senderId   | string  | 发送者 ID         |
| senderName | string  | 发送者昵称        |
| avatar     | string  | 头像颜色类名      |
| content    | string  | 消息内容          |
| timestamp  | number  | 发送时间戳        |
| type       | enum    | text/image/system |
| isRead     | boolean | 是否已读          |

### 脏数据类型

1. **乱序到达**: WebSocket 推送消息可能乱序
2. **重复消息**: 网络重试导致重复
3. **离线消息**: 批量同步历史消息

---

## 三、约束条件

| 维度       | 约束                             |
| ---------- | -------------------------------- |
| 数据量级   | 100,000 条                       |
| 主线程预算 | 滚动计算 < 16ms（保证 60 FPS）   |
| DOM 节点   | < 50 个（可见区域 + 缓冲区）     |
| 内存上限   | 数据存储 ~40MB，DOM 节点 < 1MB   |
| 增量更新   | 新消息到达时追加，不重新渲染全量 |

---

## 四、示例输入输出

### 示例 1：正常滚动

**输入**:

- scrollTop: 7200px
- containerHeight: 600px
- itemHeight: 72px

**输出**:

- startIndex: 95（含 5 项缓冲区）
- endIndex: 118（含 5 项缓冲区）
- 实际渲染: 24 条（占比 0.024%）
- 计算耗时: < 0.1ms

### 示例 2：跳转到底部

**输入**: scrollToIndex(99999)

**输出**:

- 瞬间定位到第 99999 条消息
- 无需遍历中间元素
- O(1) 时间复杂度

---

## 五、评分点

| 维度     | 权重 | 要点                           |
| -------- | ---- | ------------------------------ |
| 正确性   | 25%  | 可见区域计算准确、边界处理正确 |
| 性能     | 35%  | 滚动流畅、60 FPS、计算 < 16ms  |
| 可维护性 | 20%  | 算法与 UI 分离、Hook 复用      |
| 工程化   | 20%  | 性能监控、FPS 展示、调试工具   |

---

## 六、核心算法说明

### 1. 可见区域计算（O(1)）

```typescript
function calculateVisibleRange(
  scrollTop: number,
  containerHeight: number,
  totalItems: number,
  config: VirtualListConfig
): VisibleRange {
  const { itemHeight, overscan } = config;

  // 直接计算，无需遍历
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const endIndex = Math.min(totalItems - 1, startIndex + visibleCount + overscan * 2);

  return { startIndex, endIndex, offsetTop: startIndex * itemHeight };
}
```

### 2. 数据切片（O(k)）

```typescript
// k = 可见项数（通常 10-30）
const visibleItems = allItems.slice(startIndex, endIndex + 1);
```

### 3. 高性能渲染

- 使用 `transform: translateY()` 定位，触发 GPU 加速
- 避免修改 `top` 属性导致重排

---

## 七、既有解决方案对比

| 方案              | 适用场景  | 优点                | 缺点                |
| ----------------- | --------- | ------------------- | ------------------- |
| 固定高度虚拟列表  | 本 Demo   | O(1) 计算，实现简单 | 不支持动态高度      |
| 动态高度虚拟列表  | 评论/文章 | 支持变高项          | 需要预计算/缓存高度 |
| 分页加载          | 搜索结果  | 实现简单            | 不支持连续滚动      |
| 无限滚动 + 虚拟化 | 信息流    | 最佳体验            | 实现复杂            |

**推荐方案**: 本 Demo 采用「固定高度虚拟列表」，适合消息列表等高度统一的场景。

---

## 八、可选进阶挑战

- [ ] 动态高度支持（预测高度 + 滚动修正）
- [ ] 双向无限滚动（上拉加载更早消息）
- [ ] ResizeObserver 监听容器变化
- [ ] Web Worker 处理大数据序列化
