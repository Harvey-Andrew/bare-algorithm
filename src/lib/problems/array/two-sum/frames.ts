import { ElementState, TwoSumFrame, TwoSumInput } from './types';

/**
 * 创建初始帧
 */
const createBaseFrame = (input: TwoSumInput): TwoSumFrame => ({
  line: 0,
  message: '算法开始',
  nums: [...input.nums],
  target: input.target,
  states: new Array(input.nums.length).fill(ElementState.NORMAL),
  map: {},
});

/**
 * 暴力枚举模式帧生成
 */
export function generateBruteForceFrames(input: TwoSumInput): TwoSumFrame[] {
  const frames: TwoSumFrame[] = [];
  const { nums, target } = input;

  // 1. 初始状态
  const frame = createBaseFrame(input);
  frame.line = 1;
  frame.message = '开始暴力枚举';
  frames.push(JSON.parse(JSON.stringify(frame)));

  for (let i = 0; i < nums.length; i++) {
    // 2. 外层循环
    frame.i = i;
    frame.j = undefined;
    frame.states = frame.states.map((s, idx) =>
      idx === i ? ElementState.ACTIVE : ElementState.NORMAL
    );
    frame.line = 3;
    frame.message = `外层循环：选择第一个数 nums[${i}] = ${nums[i]}`;
    frames.push(JSON.parse(JSON.stringify(frame)));

    for (let j = i + 1; j < nums.length; j++) {
      // 3. 内层循环
      frame.j = j;
      frame.states[j] = ElementState.ACTIVE;
      frame.line = 5;
      frame.message = `内层循环：选择第二个数 nums[${j}] = ${nums[j]}`;
      frames.push(JSON.parse(JSON.stringify(frame)));

      // 4. 检查和
      const sum = nums[i] + nums[j];
      frame.line = 7;
      if (sum === target) {
        frame.states[i] = ElementState.MATCH;
        frame.states[j] = ElementState.MATCH;
        frame.message = `找到答案！${nums[i]} + ${nums[j]} = ${target}`;
        frames.push(JSON.parse(JSON.stringify(frame)));

        frame.line = 8;
        frame.message = `返回这两个数的下标 [${i}, ${j}]`;
        frames.push(JSON.parse(JSON.stringify(frame)));
        return frames;
      } else {
        frame.message = `计算和：${nums[i]} + ${nums[j]} = ${sum} (≠ ${target})，继续查找`;
        frames.push(JSON.parse(JSON.stringify(frame)));
        // 重置 j 的状态
        frame.states[j] = ElementState.NORMAL;
      }
    }
    // 重置 i 的状态
    frame.states[i] = ElementState.NORMAL;
  }

  frame.line = 12;
  frame.message = '未找到符合条件的两个数';
  frames.push(JSON.parse(JSON.stringify(frame)));

  return frames;
}

/**
 * 哈希表模式帧生成
 */
export function generateHashMapFrames(input: TwoSumInput): TwoSumFrame[] {
  const frames: TwoSumFrame[] = [];
  const { nums, target } = input;
  const map = new Map<number, number>();

  const frame = createBaseFrame(input);
  frame.line = 1;
  frame.message = '创建空哈希表 map';
  frames.push(JSON.parse(JSON.stringify(frame)));

  for (let i = 0; i < nums.length; i++) {
    frame.i = i;
    frame.currentVal = nums[i];
    frame.states[i] = ElementState.ACTIVE;
    frame.line = 3;
    frame.message = `遍历第 ${i} 个元素：nums[${i}] = ${nums[i]}`;
    frames.push(JSON.parse(JSON.stringify(frame)));

    const complement = target - nums[i];
    frame.complement = complement;
    frame.line = 4;
    frame.message = `计算补数：${target} - ${nums[i]} = ${complement}`;
    frames.push(JSON.parse(JSON.stringify(frame)));

    frame.line = 6;
    if (map.has(complement)) {
      const complementIndex = map.get(complement)!;
      frame.states[complementIndex] = ElementState.MATCH;
      frame.states[i] = ElementState.MATCH;
      frame.message = `哈希表中存在补数 ${complement} (下标 ${complementIndex})，找到答案！`;
      frames.push(JSON.parse(JSON.stringify(frame)));

      frame.line = 7;
      frame.message = `返回下标 [${complementIndex}, ${i}]`;
      frames.push(JSON.parse(JSON.stringify(frame)));
      return frames;
    } else {
      frame.message = `哈希表中不存在补数 ${complement}`;
      frames.push(JSON.parse(JSON.stringify(frame)));

      map.set(nums[i], i);
      // 更新可视化 map (复制一个纯对象)
      const newMap: Record<number, number> = {};
      map.forEach((idx, val) => {
        newMap[val] = idx;
      });
      frame.map = newMap;

      frame.states[i] = ElementState.VISITED;
      frame.line = 10;
      frame.message = `将当前元素 ${nums[i]} (下标 ${i}) 存入哈希表`;
      frames.push(JSON.parse(JSON.stringify(frame)));
    }
  }

  frame.line = 13;
  frame.message = '遍历结束，未找到答案';
  frames.push(JSON.parse(JSON.stringify(frame)));

  return frames;
}

/**
 * 双指针模式帧生成
 * 思路：先排序（保留原始下标），然后用左右指针向中间收缩
 */
export function generateTwoPointerFrames(input: TwoSumInput): TwoSumFrame[] {
  const frames: TwoSumFrame[] = [];
  const { nums, target } = input;

  // 创建基础帧
  const frame = createBaseFrame(input);
  frame.line = 1;
  frame.message = '开始排序 + 双指针解法';
  frames.push(JSON.parse(JSON.stringify(frame)));

  // Step 1: 创建带原始下标的数组
  const pairs = nums.map((val, idx) => ({ val, idx }));
  frame.line = 3;
  frame.message = '创建带原始下标的数组 pairs';
  frame.sortedPairs = [...pairs];
  frames.push(JSON.parse(JSON.stringify(frame)));

  // Step 2: 排序
  pairs.sort((a, b) => a.val - b.val);
  frame.line = 4;
  frame.sortedPairs = [...pairs];
  frame.message = `排序后数组: [${pairs.map((p) => p.val).join(', ')}]`;
  frames.push(JSON.parse(JSON.stringify(frame)));

  // Step 3: 初始化双指针
  let left = 0;
  let right = pairs.length - 1;
  frame.left = left;
  frame.right = right;
  frame.line = 6;
  frame.states = frame.states.map(() => ElementState.NORMAL);
  frame.states[pairs[left].idx] = ElementState.LEFT_POINTER;
  frame.states[pairs[right].idx] = ElementState.RIGHT_POINTER;
  frame.message = `初始化双指针：left=${left}(值=${pairs[left].val})，right=${right}(值=${pairs[right].val})`;
  frames.push(JSON.parse(JSON.stringify(frame)));

  // Step 4: 双指针循环
  while (left < right) {
    frame.line = 7;
    frame.message = `进入循环：left=${left} < right=${right}`;
    frames.push(JSON.parse(JSON.stringify(frame)));

    const sum = pairs[left].val + pairs[right].val;
    frame.currentSum = sum;
    frame.line = 8;
    frame.message = `计算和：${pairs[left].val} + ${pairs[right].val} = ${sum}`;
    frames.push(JSON.parse(JSON.stringify(frame)));

    if (sum === target) {
      // 找到答案
      frame.line = 9;
      frame.states[pairs[left].idx] = ElementState.MATCH;
      frame.states[pairs[right].idx] = ElementState.MATCH;
      frame.message = `找到答案！${pairs[left].val} + ${pairs[right].val} = ${target}`;
      frames.push(JSON.parse(JSON.stringify(frame)));

      frame.line = 10;
      frame.message = `返回原始下标 [${pairs[left].idx}, ${pairs[right].idx}]`;
      frames.push(JSON.parse(JSON.stringify(frame)));
      return frames;
    } else if (sum < target) {
      // 和太小，左指针右移
      frame.line = 12;
      frame.message = `和 ${sum} < 目标 ${target}，左指针右移`;
      frames.push(JSON.parse(JSON.stringify(frame)));

      // 更新状态
      frame.states[pairs[left].idx] = ElementState.VISITED;
      left++;
      frame.left = left;

      if (left < right) {
        frame.states[pairs[left].idx] = ElementState.LEFT_POINTER;
        frame.message = `左指针移动到 ${left}(值=${pairs[left].val})`;
        frames.push(JSON.parse(JSON.stringify(frame)));
      }
    } else {
      // 和太大，右指针左移
      frame.line = 14;
      frame.message = `和 ${sum} > 目标 ${target}，右指针左移`;
      frames.push(JSON.parse(JSON.stringify(frame)));

      // 更新状态
      frame.states[pairs[right].idx] = ElementState.VISITED;
      right--;
      frame.right = right;

      if (left < right) {
        frame.states[pairs[right].idx] = ElementState.RIGHT_POINTER;
        frame.message = `右指针移动到 ${right}(值=${pairs[right].val})`;
        frames.push(JSON.parse(JSON.stringify(frame)));
      }
    }
  }

  frame.line = 18;
  frame.message = '双指针相遇，未找到答案';
  frames.push(JSON.parse(JSON.stringify(frame)));

  return frames;
}
