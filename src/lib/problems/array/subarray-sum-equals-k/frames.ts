import { ElementState, SubarraySumFrame, SubarraySumInput } from './types';

const createBaseFrame = (input: SubarraySumInput): SubarraySumFrame => ({
  line: 0,
  message: '算法开始',
  nums: [...input.nums],
  k: input.k,
  states: new Array(input.nums.length).fill(ElementState.NORMAL),
  map: {},
  count: 0,
  highlightIndices: [],
});

export function generatePrefixSumHashFrames(input: SubarraySumInput): SubarraySumFrame[] {
  const frames: SubarraySumFrame[] = [];
  const { nums, k } = input;

  const frame = createBaseFrame(input);
  frames.push(JSON.parse(JSON.stringify(frame)));

  let pre = 0;
  const map = new Map<number, number>();
  map.set(0, 1);

  // Visualize initial map
  frame.map = { 0: 1 };
  frame.line = 5;
  frame.message = '初始化: map = {0: 1}, pre = 0, count = 0';
  frames.push(JSON.parse(JSON.stringify(frame)));

  for (let i = 0; i < nums.length; i++) {
    const x = nums[i];

    frame.currentIndex = i;
    frame.states[i] = ElementState.ACTIVE;
    frame.line = 7;
    frame.message = `遍历 nums[${i}] = ${x}`;
    frames.push(JSON.parse(JSON.stringify(frame)));

    pre += x;
    frame.prefixSum = pre;
    frame.line = 8;
    frame.message = `更新前缀和 pre = ${pre - x} + ${x} = ${pre}`;
    frames.push(JSON.parse(JSON.stringify(frame)));

    const target = pre - k;
    frame.targetPrefix = target;
    frame.line = 10;
    frame.message = `检查是否存在前缀和 target = pre - k = ${pre} - ${k} = ${target}`;
    frames.push(JSON.parse(JSON.stringify(frame)));

    if (map.has(target)) {
      const foundCount = map.get(target)!;
      frame.count += foundCount; // Visual update

      frame.line = 11;
      frame.message = `Map 中存在 key=${target} (出现 ${foundCount} 次)，说明找到了 ${foundCount} 个和为 k 的子数组`;
      frames.push(JSON.parse(JSON.stringify(frame)));
    } else {
      frame.message = `Map 中不存在 key=${target}，未找到符合条件的子数组`;
      frames.push(JSON.parse(JSON.stringify(frame)));
    }

    // Update map
    const newCount = (map.get(pre) || 0) + 1;
    map.set(pre, newCount);

    // Convert map to object for frame
    const newMapObj: Record<number, number> = {};
    map.forEach((val, key) => {
      newMapObj[key] = val;
    });
    frame.map = newMapObj;

    frame.line = 14;
    frame.message = `将当前前缀和 pre=${pre} 存入 Map (计数: ${newCount})`;
    frames.push(JSON.parse(JSON.stringify(frame)));

    frame.states[i] = ElementState.NORMAL;
  }

  frame.currentIndex = undefined;
  frame.line = 16;
  frame.message = `遍历结束，总共找到 ${frame.count} 个子数组`;
  frames.push(JSON.parse(JSON.stringify(frame)));

  return frames;
}

/**
 * 分治法帧生成
 * 将数组分成左右两半，分别递归统计，再计算跨越中点的子数组
 */
export function generateDivideConquerFrames(input: SubarraySumInput): SubarraySumFrame[] {
  const frames: SubarraySumFrame[] = [];
  const { nums, k } = input;

  const createFrame = (overrides: Partial<SubarraySumFrame> = {}): SubarraySumFrame => ({
    line: 0,
    message: '',
    nums: [...nums],
    k,
    states: new Array(nums.length).fill(ElementState.NORMAL),
    count: 0,
    highlightIndices: [],
    map: {},
    ...overrides,
  });

  let totalCount = 0;
  const frame = createFrame();

  // 初始帧
  frame.line = 1;
  frame.message = '开始分治算法';
  frames.push(JSON.parse(JSON.stringify(frame)));

  // 辅助函数：计算跨越中点的子数组个数
  const countCrossingWithFrames = (
    start: number,
    mid: number,
    end: number,
    depth: number
  ): number => {
    let count = 0;

    // 高亮整个跨越区间
    frame.states = new Array(nums.length).fill(ElementState.NORMAL);
    for (let i = start; i <= end; i++) {
      frame.states[i] = ElementState.CURRENT;
    }
    frame.leftRange = [start, mid];
    frame.rightRange = [mid + 1, end];
    frame.crossingRange = [start, end];
    frame.recursionDepth = depth;
    frame.phase = 'crossing';
    frame.line = 2;
    frame.message = `计算跨越中点的子数组 [${start}...${mid}] × [${mid + 1}...${end}]`;
    frames.push(JSON.parse(JSON.stringify(frame)));

    // 统计左半边后缀和
    const leftSumMap = new Map<number, number>();
    let leftSum = 0;

    frame.line = 6;
    frame.message = `从 mid=${mid} 向左扫描，计算后缀和`;
    frames.push(JSON.parse(JSON.stringify(frame)));

    for (let i = mid; i >= start; i--) {
      leftSum += nums[i];
      leftSumMap.set(leftSum, (leftSumMap.get(leftSum) || 0) + 1);

      // 高亮当前正在计算的元素
      frame.states = new Array(nums.length).fill(ElementState.NORMAL);
      for (let j = i; j <= mid; j++) {
        frame.states[j] = ElementState.ACTIVE;
      }

      // 转换 Map 为对象展示
      const mapObj: Record<number, number> = {};
      leftSumMap.forEach((val, key) => {
        mapObj[key] = val;
      });
      frame.leftSumMap = mapObj;
      frame.prefixSum = leftSum;
      frame.line = 8;
      frame.message = `左后缀 [${i}...${mid}] 和 = ${leftSum}，Map[${leftSum}] = ${leftSumMap.get(leftSum)}`;
      frames.push(JSON.parse(JSON.stringify(frame)));
    }

    // 遍历右半边前缀和
    let rightSum = 0;
    frame.line = 11;
    frame.message = `从 mid+1=${mid + 1} 向右扫描，查找匹配`;
    frames.push(JSON.parse(JSON.stringify(frame)));

    for (let i = mid + 1; i <= end; i++) {
      rightSum += nums[i];
      const target = k - rightSum;

      // 高亮右半边当前区间
      frame.states = new Array(nums.length).fill(ElementState.NORMAL);
      for (let j = mid + 1; j <= i; j++) {
        frame.states[j] = ElementState.ACTIVE;
      }
      frame.rightSum = rightSum;
      frame.targetPrefix = target;
      frame.line = 13;
      frame.message = `右前缀 [${mid + 1}...${i}] 和 = ${rightSum}，寻找左后缀和 = ${target}`;
      frames.push(JSON.parse(JSON.stringify(frame)));

      if (leftSumMap.has(target)) {
        const foundCount = leftSumMap.get(target)!;
        count += foundCount;
        totalCount += foundCount;
        frame.count = totalCount;

        // 高亮匹配
        frame.states = new Array(nums.length).fill(ElementState.NORMAL);
        for (let j = start; j <= end; j++) {
          frame.states[j] = ElementState.MATCH;
        }
        frame.line = 14;
        frame.message = `🎯 找到 ${foundCount} 个匹配！leftMap[${target}] = ${foundCount}，总计 count = ${totalCount}`;
        frames.push(JSON.parse(JSON.stringify(frame)));
      }
    }

    return count;
  };

  // 主递归函数
  const solveWithFrames = (start: number, end: number, depth: number): number => {
    // 高亮当前处理区间
    frame.states = new Array(nums.length).fill(ElementState.NORMAL);
    for (let i = start; i <= end; i++) {
      frame.states[i] = ElementState.CURRENT;
    }
    frame.recursionDepth = depth;
    frame.line = 20;
    frame.message = `递归处理区间 [${start}...${end}]，深度 = ${depth}`;
    frames.push(JSON.parse(JSON.stringify(frame)));

    // 基情况：单个元素
    if (start === end) {
      const match = nums[start] === k ? 1 : 0;
      if (match) {
        totalCount += 1;
        frame.count = totalCount;
        frame.states[start] = ElementState.MATCH;
      }
      frame.line = 21;
      frame.message = `单元素 nums[${start}] = ${nums[start]}${match ? ' = k，找到1个!' : ' ≠ k'}`;
      frames.push(JSON.parse(JSON.stringify(frame)));
      return match;
    }

    const mid = (start + end) >> 1;
    frame.leftRange = [start, mid];
    frame.rightRange = [mid + 1, end];
    frame.line = 22;
    frame.message = `分割：左半边 [${start}...${mid}]，右半边 [${mid + 1}...${end}]`;
    frames.push(JSON.parse(JSON.stringify(frame)));

    // 递归处理左半边
    frame.phase = 'left';
    const leftCount = solveWithFrames(start, mid, depth + 1);

    // 递归处理右半边
    frame.phase = 'right';
    const rightCount = solveWithFrames(mid + 1, end, depth + 1);

    // 计算跨越部分
    const crossCount = countCrossingWithFrames(start, mid, end, depth);

    // 合并结果
    frame.phase = 'merge';
    frame.line = 25;
    frame.message = `合并结果 [${start}...${end}]：左=${leftCount} + 右=${rightCount} + 跨越=${crossCount}`;
    frames.push(JSON.parse(JSON.stringify(frame)));

    return leftCount + rightCount + crossCount;
  };

  if (nums.length === 0) {
    frame.message = '空数组，返回 0';
    frames.push(JSON.parse(JSON.stringify(frame)));
    return frames;
  }

  solveWithFrames(0, nums.length - 1, 0);

  // 完成帧
  frame.states = new Array(nums.length).fill(ElementState.NORMAL);
  frame.line = 27;
  frame.message = `✅ 分治完成，共找到 ${totalCount} 个和为 ${k} 的子数组`;
  frames.push(JSON.parse(JSON.stringify(frame)));

  return frames;
}

/**
 * TypedArray 桶优化解法的帧生成
 * 由于真实的 TypedArray 太大（40000005 元素），
 * 可视化时仅展示与当前数据相关的局部切片
 */
export function generateTypedArrayFrames(input: SubarraySumInput): SubarraySumFrame[] {
  const frames: SubarraySumFrame[] = [];
  const { nums, k } = input;

  // 可视化用的简化偏移量（实际算法中是 20000000）
  const VISUAL_OFFSET = 100;

  const createFrame = (overrides: Partial<SubarraySumFrame> = {}): SubarraySumFrame => ({
    line: 0,
    message: '',
    nums: [...nums],
    states: new Array(nums.length).fill(ElementState.NORMAL),
    count: 0,
    highlightIndices: [],
    map: {},
    offset: VISUAL_OFFSET,
    ...overrides,
  });

  // 使用 Map 模拟 TypedArray 的行为（可视化时更直观）
  const bucketMap: Record<number, number> = {};

  // 初始帧
  const frame = createFrame();
  frame.line = 1;
  frame.message = '初始化 TypedArray，设置 OFFSET 偏移量';
  frames.push(JSON.parse(JSON.stringify(frame)));

  // 初始化 map[OFFSET] = 1 对应 前缀和 0 出现 1 次
  bucketMap[0] = 1;
  frame.map = { ...bucketMap };
  frame.line = 5;
  frame.message = `设置 map[OFFSET] = 1，表示前缀和 0 出现了 1 次`;
  frames.push(JSON.parse(JSON.stringify(frame)));

  let count = 0;
  let preSum = 0;

  for (let i = 0; i < nums.length; i++) {
    const x = nums[i];

    // 高亮当前元素
    frame.states = new Array(nums.length).fill(ElementState.NORMAL);
    frame.states[i] = ElementState.ACTIVE;
    frame.currentIndex = i;
    frame.line = 8;
    frame.message = `遍历 nums[${i}] = ${x}`;
    frames.push(JSON.parse(JSON.stringify(frame)));

    // 更新前缀和
    preSum += x;
    frame.prefixSum = preSum;
    frame.line = 9;
    frame.message = `更新前缀和: preSum = ${preSum - x} + ${x} = ${preSum}`;
    frames.push(JSON.parse(JSON.stringify(frame)));

    // 计算目标索引
    const target = preSum - k;
    frame.targetPrefix = target;
    frame.line = 10;
    frame.message = `查找目标: target = preSum - k = ${preSum} - ${k} = ${target}`;
    frames.push(JSON.parse(JSON.stringify(frame)));

    // 检查 bucket 中是否存在
    if (bucketMap[target] !== undefined && bucketMap[target] > 0) {
      const foundCount = bucketMap[target];
      count += foundCount;
      frame.count = count;
      frame.line = 12;
      frame.message = `🎯 找到! map[${target}] = ${foundCount}，count += ${foundCount} = ${count}`;
      frames.push(JSON.parse(JSON.stringify(frame)));
    } else {
      frame.line = 12;
      frame.message = `map[${target}] 不存在或为 0，未找到匹配`;
      frames.push(JSON.parse(JSON.stringify(frame)));
    }

    // 更新桶计数
    bucketMap[preSum] = (bucketMap[preSum] || 0) + 1;
    frame.map = { ...bucketMap };
    frame.line = 14;
    frame.message = `更新 map[${preSum}] = ${bucketMap[preSum]} (记录当前前缀和)`;
    frames.push(JSON.parse(JSON.stringify(frame)));
  }

  // 完成
  frame.states = new Array(nums.length).fill(ElementState.NORMAL);
  frame.currentIndex = undefined;
  frame.line = 16;
  frame.message = `✅ 遍历完成，共找到 ${count} 个和为 ${k} 的子数组`;
  frames.push(JSON.parse(JSON.stringify(frame)));

  return frames;
}
