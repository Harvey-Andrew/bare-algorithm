# 搜索/自动补全 Demo

## 一、业务背景与目标

### 行业场景

**电商搜索框** - 用户购物的核心入口

### 角色与行为链路

1. **用户** 点击搜索框
2. 输入关键词（每次按键触发）
3. 实时展示匹配建议（前 10 条）
4. 点击建议或回车搜索

---

## 二、核心算法说明

### 1. 前缀索引

```typescript
// 预处理 O(n * L)，查询 O(1)
const prefixIndex = new Map<string, SearchItem[]>();

for (item of items) {
  for (i = 1 to 5) {
    prefix = item.keyword.slice(0, i);
    prefixIndex.get(prefix).push(item);
  }
}
```

### 2. 查询流程

```
用户输入 → 防抖 → 前缀查找 O(1) → 过滤匹配 → 热度排序 → Top-K
```

### 3. 模糊搜索（fallback）

```typescript
// O(n) 遍历
const matched = items.filter((item) => item.keyword.includes(query));
```

---

## 三、性能优化

| 优化点   | 方案                   |
| -------- | ---------------------- |
| 防抖     | 150ms 延迟触发搜索     |
| 索引预热 | 页面加载时构建前缀索引 |
| 结果缓存 | 相同查询复用结果       |
| 分层搜索 | 前缀优先，模糊补充     |

---

## 四、可选进阶挑战

- [ ] Trie 树实现前缀索引
- [ ] 拼音首字母搜索
- [ ] 搜索历史记录
- [ ] 服务端搜索降级
