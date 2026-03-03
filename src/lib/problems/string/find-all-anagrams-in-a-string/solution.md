你好！我是你的面试官兼技术顾问。这道题是 **LeetCode 第 438 题 "Find All Anagrams in a String"（找到字符串中所有字母异位词）**，它是**定长滑动窗口**的经典题目。

这道题的核心在于理解"**异位词 = 字符频次完全相同**"，然后利用定长窗口的滑动特性，做到 $O(N)$ 的高效匹配。

---

## 1. 题目分析

- **复述题意**：给定两个字符串 `s` 和 `p`，找出所有 `p` 的异位词在 `s` 中的起始索引。异位词是指字母相同但排列不同的字符串。
- **模型抽象**：**定长滑动窗口** + **频率计数对比**。
- **约束分析**：
  - $1 \le s.length, p.length \le 3 \times 10^4$：$O(N)$ 最优。$O(N \times 26)$ 也可接受。
  - `s` 和 `p` 仅含小写英文字母：字符集大小固定为 26，可以用固定长度数组替代 `Map`。
  - 无需 BigInt。
- **边界与澄清点**：
  - `p.length > s.length`：不可能有匹配，返回空数组。
  - `s === p`：整个字符串就是一个异位词，返回 `[0]`。
  - 重复字符：如 `s="aaaa", p="aa"`，应返回 `[0, 1, 2]`。
- **总体策略**：
  1. **解法 1 — 定长滑窗 + 数组计数**：维护长度为 `p.length` 的窗口，用 26 长度的频率数组对比。标准最优解。
  2. **解法 2 — 定长滑窗 + diff 计数优化**：用一个 `diff` 变量追踪"有多少字符的频率不匹配"，避免每步都做 26 次比较。常数更优。
  3. **解法 3 — 排序暴力**：对每个窗口排序后比较。$O(N \times K \log K)$，仅教学用。

---

## 解法 1：定长滑窗 + 数组计数（标准解）

### 思路

1. 统计 `p` 中每个字符的频率 → `pCount[26]`。
2. 维护一个长度恰好为 `p.length` 的滑动窗口，统计窗口内字符的频率 → `sCount[26]`。
3. 每次窗口右移一格：
   - 加入 `s[right]`：`sCount[s[right]]++`。
   - 若窗口长度超过 `p.length`，移除最左字符：`sCount[s[left]]--`，`left++`。
4. 比较 `sCount` 和 `pCount` 是否完全相同：若相同，记录起始索引。

**窗口不变量**：窗口大小始终为 `p.length`（填满后）。

- **TS 细节**：使用 `Int32Array(26)` 替代普通数组，内存布局更紧凑。比较两个长度 26 的数组 $O(26) = O(1)$ 常数时间。

### 代码实现 (LeetCode 提交版)

```ts
/**
 * 复杂度分析：
 * 时间复杂度：O(N × 26) = O(N) —— 遍历 s 一次，每步比较 26 个字符。
 * 空间复杂度：O(26) = O(1) —— 两个固定长度数组。
 */

function findAnagrams(s: string, p: string): number[] {
  const result: number[] = [];
  if (s.length < p.length) return result;

  const pCount = new Int32Array(26);
  const sCount = new Int32Array(26);
  const a = 'a'.charCodeAt(0);

  for (const c of p) pCount[c.charCodeAt(0) - a]++;

  for (let i = 0; i < s.length; i++) {
    sCount[s.charCodeAt(i) - a]++;

    // 窗口超出 p.length 时，移除最左字符
    if (i >= p.length) {
      sCount[s.charCodeAt(i - p.length) - a]--;
    }

    // 窗口填满后比较
    if (i >= p.length - 1) {
      let match = true;
      for (let j = 0; j < 26; j++) {
        if (sCount[j] !== pCount[j]) {
          match = false;
          break;
        }
      }
      if (match) result.push(i - p.length + 1);
    }
  }

  return result;
}
```

---

## 解法 2：定长滑窗 + diff 计数优化

### 思路

解法 1 每步都要比较 26 个频率值。**优化**：用一个变量 `diff` 追踪"有多少个字母的频率与 `p` 不同"。

1. 初始化 `count[26]`，先用 `p` 的频率减去窗口前 `p.length` 个字符的频率。`diff` = 非零项数。
2. 滑窗时每加入一个新字符、移除一个旧字符，只更新对应两个位置的 `count` 值，并同步更新 `diff`。
3. 当 `diff === 0` 时，窗口就是一个异位词。

这样每步操作 $O(1)$（而非 $O(26)$），虽然理论量级相同但常数显著更小。

- **TS 细节**：`diff` 的更新需要在值变化前后仔细判断（从 0 变为非 0 → diff++，从非 0 变为 0 → diff--）。

### 代码实现 (LeetCode 提交版)

```ts
/**
 * 复杂度分析：
 * 时间复杂度：O(N) —— 每步精确 O(1) 操作。
 * 空间复杂度：O(26) = O(1)。
 */

function findAnagramsDiff(s: string, p: string): number[] {
  const result: number[] = [];
  if (s.length < p.length) return result;

  const count = new Int32Array(26);
  const a = 'a'.charCodeAt(0);

  // 初始化：p 的频率为正，窗口内字符的频率为负
  for (const c of p) count[c.charCodeAt(0) - a]++;
  let diff = 0;
  for (let j = 0; j < 26; j++) if (count[j] !== 0) diff++;

  for (let i = 0; i < s.length; i++) {
    // 加入右端字符
    const ri = s.charCodeAt(i) - a;
    if (count[ri] === 0) diff++; // 从匹配变为不匹配
    count[ri]--;
    if (count[ri] === 0) diff--; // 变回匹配

    // 移除左端字符（窗口超出 p.length）
    if (i >= p.length) {
      const li = s.charCodeAt(i - p.length) - a;
      if (count[li] === 0) diff++;
      count[li]++;
      if (count[li] === 0) diff--;
    }

    if (i >= p.length - 1 && diff === 0) {
      result.push(i - p.length + 1);
    }
  }

  return result;
}
```

---

## 解法 3：排序暴力

### 思路

枚举 `s` 中所有长度为 `p.length` 的子串，将子串排序后与排序后的 `p` 比较。

- **TS 细节**：排序开销 $O(K \log K)$（$K = p.length$），共 $N - K + 1$ 个子串，总 $O(N \times K \log K)$。对于 $N = 3 \times 10^4$、$K$ 较大时会超时。

### 代码实现 (LeetCode 提交版)

```ts
/**
 * 复杂度分析：
 * 时间复杂度：O(N × K log K) —— 枚举所有窗口，每次排序。
 * 空间复杂度：O(K) —— 用于排序的临时数组。
 */

function findAnagramsBrute(s: string, p: string): number[] {
  const result: number[] = [];
  const sorted_p = p.split('').sort().join('');

  for (let i = 0; i <= s.length - p.length; i++) {
    const window = s
      .slice(i, i + p.length)
      .split('')
      .sort()
      .join('');
    if (window === sorted_p) result.push(i);
  }

  return result;
}
```

---

## 解法对比与总结

| 特性         | 解法 1：数组计数   | 解法 2：diff 优化   | 解法 3：排序暴力       |
| :----------- | :----------------- | :------------------ | :--------------------- |
| **时间**     | $O(N \times 26)$   | $O(N)$（每步 O(1)） | $O(N \times K \log K)$ |
| **空间**     | $O(26) = O(1)$     | $O(26) = O(1)$      | $O(K)$                 |
| **比较方式** | 每步比较 26 个频率 | 维护 diff 计数器    | 排序后字符串比较       |
| **面试推荐** | ★ 标准解           | ★★ 最优常数         | 仅教学用               |

### 关键测试样例

1. **标准样例**：`s="cbaebabacd", p="abc"` → `[0, 6]`。
2. **全匹配**：`s="abab", p="ab"` → `[0, 1, 2]`。
3. **无匹配**：`s="abcdef", p="xyz"` → `[]`。
4. **边界 - p 更长**：`s="ab", p="abc"` → `[]`。
5. **边界 - 相等**：`s="abc", p="bca"` → `[0]`。
6. **重复字符**：`s="aaaa", p="aa"` → `[0, 1, 2]`。
7. **单字符**：`s="a", p="a"` → `[0]`。
