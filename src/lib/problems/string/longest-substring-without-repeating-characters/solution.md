你好！我是你的面试官兼技术顾问。这道题是 **LeetCode 第 3 题 "Longest Substring Without Repeating Characters"（无重复字符的最长子串）**，它是**滑动窗口**的开山鼻祖级题目，面试中考察频率极高。

这道题的关键在于理解"**窗口的不变量**"：窗口 `[left, right]` 中不存在重复字符。一旦 `right` 指向的新字符引入了重复，就必须收缩 `left` 直至窗口重新合法。

---

## 1. 题目分析

- **复述题意**：给定一个字符串 `s`，找出其中不含重复字符的最长子串的长度。
- **模型抽象**：**滑动窗口**（经典变长窗口问题）。
- **约束分析**：
  - $0 \le s.length \le 5 \times 10^4$：$O(N)$ 或 $O(N \log N)$ 均可。滑动窗口的 $O(N)$ 是最优。
  - `s` 由英文字母、数字、符号和空格组成（ASCII 范围）。字符集大小约 128，因此窗口最大为 128。
  - 无需 BigInt。
- **边界与澄清点**：
  - **空字符串**：`""` → 0。
  - **全相同字符**：`"aaaa"` → 1。
  - **全不重复**：`"abcdef"` → 6（整个字符串）。
  - **含空格**：`" "` → 1，`"a b"` → 3。
- **总体策略**：
  1. **解法 1 — 滑动窗口 + Set**：用 `Set` 记录窗口内字符，遇到重复则逐步收缩左边界。最直观的标准解。
  2. **解法 2 — 滑动窗口 + Map 优化**：用 `Map` 存储每个字符最后出现的位置，发现重复时直接跳转 `left`，避免逐步收缩。常数更优。
  3. **解法 3 — 暴力枚举**：枚举所有子串检查重复，$O(N^3)$，仅用于对照理解优化的价值。

---

## 解法 1：滑动窗口 + Set（标准解）

### 思路

维护一个**变长滑动窗口** `[left, right]`，窗口内所有字符不重复：

1. 用 `Set` 存储当前窗口内的字符。
2. 右指针 `right` 不断向右扩展，尝试将 `s[right]` 加入窗口。
3. 如果 `s[right]` 已在 Set 中（出现重复），持续移除 `s[left]` 并 `left++`，直到窗口合法。
4. 将 `s[right]` 加入 Set，更新 `maxLen = max(maxLen, right - left + 1)`。

**窗口不变量**：在任意时刻，Set 中的字符恰好是 `s[left..right]` 的字符，且无重复。

- **TS 细节**：`Set<string>` 的 `has/add/delete` 均为平均 $O(1)$。每个字符最多被加入一次、移除一次，总 $O(2N) = O(N)$。

### 代码实现 (LeetCode 提交版)

```ts
/**
 * 复杂度分析：
 * 时间复杂度：O(N) —— left 和 right 各最多移动 N 次，总 2N 次操作。
 * 空间复杂度：O(min(N, 128)) —— Set 最多存储 128 个 ASCII 字符。
 */

function lengthOfLongestSubstring(s: string): number {
  const set = new Set<string>();
  let left = 0,
    maxLen = 0;

  for (let right = 0; right < s.length; right++) {
    // 当 s[right] 已在窗口中，收缩左边界直到移除重复字符
    while (set.has(s[right])) {
      set.delete(s[left]);
      left++;
    }

    set.add(s[right]);
    maxLen = Math.max(maxLen, right - left + 1);
  }

  return maxLen;
}
```

---

## 解法 2：滑动窗口 + Map 优化（跳跃式收缩）

### 思路

解法 1 中，当发现重复时需要逐步收缩 `left`（`while` 循环）。例如窗口是 `"abcda"`，右端的 `a` 与左端的 `a` 重复，需要 `left++` 四次才能跳过。

**优化**：用 `Map<string, number>` 记录每个字符**最后出现的位置**：

1. 当 `map.get(s[right])` 的位置 `>= left` 时，说明窗口内有重复。
2. 直接将 `left` 跳到 `map.get(s[right]) + 1`（一步到位，跳过所有不需要的字符）。
3. 更新 `map.set(s[right], right)`。

这样内层没有 `while` 循环，虽然理论时间复杂度不变（仍是 $O(N)$），但常数更小——特别是在重复率高的输入下，跳跃式收缩大幅减少操作次数。

- **TS 细节**：`Map<string, number>` 的 `get/set` 平均 $O(1)$。注意比较 `pos >= left` 时，`pos` 可能来自窗口外的旧记录，必须做范围检查。

### 代码实现 (LeetCode 提交版)

```ts
/**
 * 复杂度分析：
 * 时间复杂度：O(N) —— 单次遍历，每个字符精确处理一次。
 * 空间复杂度：O(min(N, 128)) —— Map 最多存储 128 个 ASCII 字符。
 */

function lengthOfLongestSubstringMap(s: string): number {
  const map = new Map<string, number>(); // char → 最后出现的下标
  let left = 0,
    maxLen = 0;

  for (let right = 0; right < s.length; right++) {
    const lastPos = map.get(s[right]);

    // 如果字符曾出现过，且位置在当前窗口内 → 跳跃收缩
    if (lastPos !== undefined && lastPos >= left) {
      left = lastPos + 1; // 直接跳到重复字符的下一个位置
    }

    map.set(s[right], right);
    maxLen = Math.max(maxLen, right - left + 1);
  }

  return maxLen;
}
```

---

## 解法 3：暴力枚举（Brute Force）

### 思路

枚举所有可能的子串 `s[i..j]`，检查其中是否有重复字符。若无重复，更新最大长度。

1. 外层循环 `i` 从 `0` 到 `n-1`（子串起点）。
2. 内层循环 `j` 从 `i` 到 `n-1`（子串终点）。
3. 用 Set 检查 `s[i..j]` 是否有重复。一旦发现重复就 `break`。

- **TS 细节**：这种做法必然超时（$N = 5 \times 10^4$），但作为教学对照非常有价值——它清晰地展示了"为什么需要滑动窗口"。

### 代码实现 (LeetCode 提交版)

```ts
/**
 * 复杂度分析：
 * 时间复杂度：O(N²) —— 枚举所有子串起点，内层 Set 检查。
 *   （最坏可达 O(N³)，但 break 剪枝使平均接近 O(N²)）
 * 空间复杂度：O(min(N, 128)) —— Set 存储当前子串字符。
 */

function lengthOfLongestSubstringBruteForce(s: string): number {
  let maxLen = 0;
  const n = s.length;

  for (let i = 0; i < n; i++) {
    const seen = new Set<string>();
    for (let j = i; j < n; j++) {
      if (seen.has(s[j])) break; // 遇到重复，当前起点无法更长
      seen.add(s[j]);
      maxLen = Math.max(maxLen, j - i + 1);
    }
  }

  return maxLen;
}
```

---

## 解法对比与总结

| 特性         | 解法 1：滑窗 + Set | 解法 2：滑窗 + Map       | 解法 3：暴力枚举     |
| :----------- | :----------------- | :----------------------- | :------------------- |
| **时间**     | $O(N)$             | $O(N)$（常数更优）       | $O(N^2) \sim O(N^3)$ |
| **空间**     | $O(\min(N, 128))$  | $O(\min(N, 128))$        | $O(\min(N, 128))$    |
| **收缩方式** | 逐步收缩（while）  | **跳跃收缩**（一步到位） | 无滑动窗口           |
| **面试推荐** | ★ 标准答案         | ★★ 最优常数              | 仅教学用             |

### 适用场景

- **面试首选**：解法 1（滑窗 + Set）最直观，容易讲清窗口不变量。
- **追求极致**：解法 2（滑窗 + Map）省去内层 while，面对高重复率字符串更快。
- **教学对照**：解法 3 展示暴力的低效，突出滑动窗口的价值。

### 关键测试样例

1. **标准样例**：`"abcabcbb"` → `3`（"abc"）。
2. **全相同**：`"bbbbb"` → `1`。每次 right 都碰到重复。
3. **全不重复**：`"abcdef"` → `6`。窗口直接扩到整个字符串。
4. **边界 - 空串**：`""` → `0`。
5. **单字符**：`"a"` → `1`。
6. **含空格**：`"pwwkew"` → `3`（"wke"）。注意不是 "pwke"（不连续）。
7. **数字混合**：`"ab12ab"` → `4`（"12ab" 或 "b12a"）。
