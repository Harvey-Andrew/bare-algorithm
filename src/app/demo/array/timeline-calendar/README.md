# 时间轴/日历/会议室预订 Demo

## 一、业务背景与目标

### 行业场景

**企业会议室预订系统** - 行政/IT 管理日常使用的资源管理工具

### 角色与行为链路

1. **管理员** 进入会议室管理页面
2. 查看今日所有会议安排（时间轴视图）
3. 检测并处理时间冲突
4. 查找空闲时段安排新会议
5. 分析会议室使用率

### 触发时机

- 页面加载：拉取当日会议数据
- 切换会议室：筛选显示
- 新建会议：实时检测冲突

---

## 二、数据协议

### 接口 JSON 示例

```json
{
  "meetings": [
    {
      "id": "meeting-001",
      "title": "项目周会",
      "startTime": 1703649600000,
      "endTime": 1703653200000,
      "roomId": "room-a",
      "organizer": "张三",
      "attendees": 8,
      "priority": "high",
      "status": "confirmed"
    }
  ]
}
```

### 脏数据类型

1. **时间重叠**: 同一会议室多个会议时间重叠
2. **跨天会议**: 会议结束时间在次日
3. **取消会议**: status 为 cancelled 需过滤

---

## 三、约束条件

| 维度       | 约束                       |
| ---------- | -------------------------- |
| 数据量级   | 30-50 个会议/天            |
| 主线程预算 | 排序+检测 < 16ms           |
| 算法复杂度 | 排序 O(n log n)，合并 O(n) |

---

## 四、核心算法说明

### 1. 区间合并（LeetCode #56）

```typescript
// 时间复杂度: O(n log n)
function mergeIntervals(meetings: Meeting[]): MergedInterval[] {
  const sorted = meetings.sort((a, b) => a.startTime - b.startTime);
  const merged = [sorted[0]];

  for (const meeting of sorted.slice(1)) {
    const last = merged[merged.length - 1];
    if (meeting.startTime <= last.endTime) {
      last.endTime = Math.max(last.endTime, meeting.endTime);
    } else {
      merged.push(meeting);
    }
  }
  return merged;
}
```

### 2. 冲突检测

- 按会议室分组
- 组内排序后两两比较
- 优化：排序后如果 m2.start >= m1.end，后续无需比较

### 3. 空闲时段查找

- 遍历合并后的区间
- 计算相邻区间之间的空隙

---

## 五、既有解决方案对比

| 方案         | 适用场景     | 复杂度     | 优点     | 缺点     |
| ------------ | ------------ | ---------- | -------- | -------- |
| 排序+合并    | 本 Demo      | O(n log n) | 经典最优 | 需要排序 |
| 暴力两两比较 | 小规模       | O(n²)      | 简单     | 性能差   |
| 线段树       | 频繁区间查询 | O(log n)   | 查询快   | 实现复杂 |

**推荐方案**: 本 Demo 采用「排序+合并」，日常会议管理场景的最优解。

---

## 六、可选进阶挑战

- [ ] 支持多天视图（周/月）
- [ ] 会议室容量冲突检测
- [ ] 拖拽调整会议时间
- [ ] 自动推荐空闲时段
