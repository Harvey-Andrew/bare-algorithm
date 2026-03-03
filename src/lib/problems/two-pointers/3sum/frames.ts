import { AlgorithmMode, ThreeSumFrame, ThreeSumInput } from './types';

function createFrame(mode: AlgorithmMode, overrides: Partial<ThreeSumFrame>): ThreeSumFrame {
  return {
    mode,
    line: 0,
    message: '',
    nums: [],
    i: -1,
    result: [],
    phase: 'searching',
    ...overrides,
  };
}

export function generateHashFrames(input: ThreeSumInput): ThreeSumFrame[] {
  const frames: ThreeSumFrame[] = [];
  const nums = [...input.nums].sort((a, b) => a - b);
  const n = nums.length;
  const resultSet = new Set<string>();
  const result: number[][] = [];

  frames.push(
    createFrame(AlgorithmMode.HASH, {
      nums: [...nums],
      result: [],
      line: 4,
      message: '排序输入数组，这是为了在找齐三数后，直接拼接统一顺序的字符串去重。',
      phase: 'searching',
    })
  );

  let frameCount = 0;
  const MAX_FRAMES = 150;

  for (let i = 0; i < n - 2; i++) {
    if (nums[i] > 0) {
      frames.push(
        createFrame(AlgorithmMode.HASH, {
          nums: [...nums],
          i,
          result: [...result],
          line: 6,
          message: `锚点 ${nums[i]} > 0，剪枝：后续不可能凑出 0。`,
          phase: 'completed',
        })
      );
      break;
    }
    if (i > 0 && nums[i] === nums[i - 1]) {
      frames.push(
        createFrame(AlgorithmMode.HASH, {
          nums: [...nums],
          i,
          result: [...result],
          line: 7,
          message: `锚点 ${nums[i]} 遇到重复数字，跳过当前循环。`,
          phase: 'skip-duplicate',
        })
      );
      continue;
    }

    const target = -nums[i];
    const seen = new Set<number>();

    frames.push(
      createFrame(AlgorithmMode.HASH, {
        nums: [...nums],
        i,
        target,
        seen: Array.from(seen),
        result: [...result],
        line: 9,
        message: `固定锚点 ${nums[i]}，在后续数组中寻找两数之和等于补数 ${target}。`,
      })
    );

    for (let j = i + 1; j < n; j++) {
      if (frameCount >= MAX_FRAMES) break;
      const complement = target - nums[j];

      frames.push(
        createFrame(AlgorithmMode.HASH, {
          nums: [...nums],
          i,
          j,
          target,
          seen: Array.from(seen),
          currentSum: complement,
          result: [...result],
          line: 11,
          message: `探针位于 ${nums[j]}，正在检索其互补对 ${complement} 是否在已探索 Set 中？`,
          phase: 'searching',
        })
      );

      if (seen.has(complement)) {
        const triplet = [nums[i], complement, nums[j]];
        const key = triplet.join(',');

        if (!resultSet.has(key)) {
          resultSet.add(key);
          result.push(triplet);
          frames.push(
            createFrame(AlgorithmMode.HASH, {
              nums: [...nums],
              i,
              j,
              target,
              seen: Array.from(seen),
              currentSum: complement,
              result: [...result],
              line: 13,
              message: `命中互补集！组合 [${triplet.join(', ')}]，成功存入结果。`,
              phase: 'found',
            })
          );
        } else {
          frames.push(
            createFrame(AlgorithmMode.HASH, {
              nums: [...nums],
              i,
              j,
              target,
              seen: Array.from(seen),
              currentSum: complement,
              result: [...result],
              line: 13,
              message: `命中互补集！但 [${key}] 在全局 Set 中已存在，忽略。`,
              phase: 'skip-duplicate',
            })
          );
        }
      } else {
        frames.push(
          createFrame(AlgorithmMode.HASH, {
            nums: [...nums],
            i,
            j,
            target,
            seen: Array.from(seen),
            currentSum: complement,
            result: [...result],
            line: 15,
            message: `未命中。目前只探索到 ${nums[j]}，存入 Set。`,
          })
        );
      }
      seen.add(nums[j]);
      frameCount++;
    }
    if (frameCount >= MAX_FRAMES) break;
  }

  frames.push(
    createFrame(AlgorithmMode.HASH, {
      nums: [...nums],
      result: [...result],
      line: 18,
      message: `遍历完成。哈希去重法共找到 ${result.length} 组。`,
      phase: 'completed',
    })
  );

  return frames;
}

export function generateOptimizedFrames(input: ThreeSumInput): ThreeSumFrame[] {
  const frames: ThreeSumFrame[] = [];
  const result: number[][] = [];
  const counter: Record<string, number> = {};

  // Stage 1: Build Hash Map
  for (const x of input.nums) {
    counter[String(x)] = (counter[String(x)] || 0) + 1;
  }

  const uniqueNums = Object.keys(counter)
    .map(Number)
    .sort((a, b) => a - b);
  const pos = uniqueNums.filter((x) => x > 0);
  const neg = uniqueNums.filter((x) => x < 0);

  const baseFrame = {
    nums: input.nums,
    counter: { ...counter },
    pos: [...pos],
    neg: [...neg],
    result: [...result],
  };

  frames.push(
    createFrame(AlgorithmMode.OPTIMIZED, {
      ...baseFrame,
      line: 4,
      message: '开始解析 O(N+U²) 极限性能核心：统计全量元素频次并分装为“正数”、“负数”独立桶。',
      phase: 'searching',
    })
  );

  // Case 1: 0 + 0 + 0
  frames.push(
    createFrame(AlgorithmMode.OPTIMIZED, {
      ...baseFrame,
      line: 9,
      checkingCase: 'Case 1',
      activeBuckets: [0],
      message: '分析 Case 1：检查 0 的频次是否 ≥ 3。',
      phase: 'searching',
    })
  );
  if ((counter['0'] || 0) >= 3) {
    result.push([0, 0, 0]);
    frames.push(
      createFrame(AlgorithmMode.OPTIMIZED, {
        ...baseFrame,
        result: [...result],
        line: 9,
        checkingCase: 'Case 1',
        activeBuckets: [0],
        message: '命中 Case 1：0 的频次达到要求，装入 [0, 0, 0] 三元组。',
        phase: 'found',
      })
    );
  }

  // Case 2: -p + 0 + p
  if ((counter['0'] || 0) > 0) {
    for (const p of pos) {
      frames.push(
        createFrame(AlgorithmMode.OPTIMIZED, {
          ...baseFrame,
          result: [...result],
          line: 11,
          checkingCase: 'Case 2',
          activeBuckets: [0, p, -p],
          message: `分析 Case 2：存在 0，试图在负数桶寻找刚好为 ${-p}（对消数）以匹配正数 ${p}。`,
          phase: 'searching',
        })
      );
      if (counter[String(-p)]) {
        result.push([-p, 0, p]);
        frames.push(
          createFrame(AlgorithmMode.OPTIMIZED, {
            ...baseFrame,
            result: [...result],
            line: 11,
            checkingCase: 'Case 2',
            activeBuckets: [0, p, -p],
            message: `命中 Case 2！形成极简配平组合 [${-p}, 0, ${p}]。`,
            phase: 'found',
          })
        );
      }
    }
  }

  // Case 3: neg + neg + pos
  for (let i = 0; i < neg.length; i++) {
    for (let j = i; j < neg.length; j++) {
      if (i === j && counter[String(neg[i])] < 2) continue;
      const target = -(neg[i] + neg[j]);
      frames.push(
        createFrame(AlgorithmMode.OPTIMIZED, {
          ...baseFrame,
          result: [...result],
          line: 15,
          checkingCase: 'Case 3',
          activeBuckets: [neg[i], neg[j], target],
          message: `分析 Case 3：2个负数 (${neg[i]} + ${neg[j]}) = ${neg[i] + neg[j]}，寻找正数抵消数 ${target}。`,
          phase: 'searching',
        })
      );
      if (counter[String(target)]) {
        result.push([neg[i], neg[j], target]);
        frames.push(
          createFrame(AlgorithmMode.OPTIMIZED, {
            ...baseFrame,
            result: [...result],
            line: 18,
            checkingCase: 'Case 3',
            activeBuckets: [neg[i], neg[j], target],
            message: `命中 Case 3！成功抵消，存入结构。`,
            phase: 'found',
          })
        );
      }
    }
  }

  // Case 4: pos + pos + neg
  for (let i = 0; i < pos.length; i++) {
    for (let j = i; j < pos.length; j++) {
      if (i === j && counter[String(pos[i])] < 2) continue;
      const target = -(pos[i] + pos[j]);
      frames.push(
        createFrame(AlgorithmMode.OPTIMIZED, {
          ...baseFrame,
          result: [...result],
          line: 22,
          checkingCase: 'Case 4',
          activeBuckets: [pos[i], pos[j], target],
          message: `分析 Case 4：2个正数 (${pos[i]} + ${pos[j]}) = ${pos[i] + pos[j]}，寻找负数抵消数 ${target}。`,
          phase: 'searching',
        })
      );
      if (counter[String(target)]) {
        result.push([target, pos[i], pos[j]]);
        frames.push(
          createFrame(AlgorithmMode.OPTIMIZED, {
            ...baseFrame,
            result: [...result],
            line: 25,
            checkingCase: 'Case 4',
            activeBuckets: [pos[i], pos[j], target],
            message: `命中 Case 4！成功抵消，存入结构。`,
            phase: 'found',
          })
        );
      }
    }
  }

  frames.push(
    createFrame(AlgorithmMode.OPTIMIZED, {
      ...baseFrame,
      result: [...result],
      line: 29,
      checkingCase: 'Completed',
      message: `惊艳的组合数学级优化扫扫结束。在海量重复样本时该策略无敌！共计获得 ${result.length} 组。`,
      phase: 'completed',
    })
  );

  return frames;
}

export function generateTwoPointersFrames(input: ThreeSumInput): ThreeSumFrame[] {
  const frames: ThreeSumFrame[] = [];
  // 必须深拷贝后排序
  const nums = [...input.nums].sort((a, b) => a - b);
  const result: number[][] = [];
  const n = nums.length;

  frames.push(
    createFrame(AlgorithmMode.TP, {
      nums: [...input.nums],
      result: [],
      line: 2,
      message: '开始标答推导，首先必须排序！',
      phase: 'searching',
    })
  );

  frames.push(
    createFrame(AlgorithmMode.TP, {
      nums: [...nums],
      result: [],
      line: 2,
      message: '排序完成，原数组升序排列，乱序带来的噩梦将被终结。',
      phase: 'searching',
    })
  );

  for (let i = 0; i < n - 2; i++) {
    // 剪枝
    if (nums[i] > 0) {
      frames.push(
        createFrame(AlgorithmMode.TP, {
          nums: [...nums],
          i,
          result: [...result],
          line: 5,
          message: `当前锚点 ${nums[i]} > 0，右侧全是正数，不可能再拼凑出 0，直接斩断所有可能！(剪枝)`,
          phase: 'completed',
        })
      );
      break;
    }

    // 外层防重复
    if (i > 0 && nums[i] === nums[i - 1]) {
      frames.push(
        createFrame(AlgorithmMode.TP, {
          nums: [...nums],
          i,
          result: [...result],
          line: 6,
          message: `当前锚点 ${nums[i]} 与上一个相同！该用例已被探索过，触发 Deduplication 1 直接跳过这轮循环。`,
          phase: 'skip-duplicate',
        })
      );
      continue;
    }

    let left = i + 1,
      right = n - 1;

    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];

      frames.push(
        createFrame(AlgorithmMode.TP, {
          nums: [...nums],
          i,
          left,
          right,
          currentSum: sum,
          result: [...result],
          line: 9,
          message: `指针探测：判断 ${nums[i]} + ${nums[left]} + ${nums[right]} = ${sum}`,
          phase: 'searching',
        })
      );

      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]]);
        frames.push(
          createFrame(AlgorithmMode.TP, {
            nums: [...nums],
            i,
            left,
            right,
            currentSum: sum,
            result: [...result],
            line: 11,
            message: `捕获三元组！推入结果集。`,
            phase: 'found',
          })
        );

        // 去重2：左右连续步进排除同生数字
        while (left < right && nums[left] === nums[left + 1]) {
          left++;
          frames.push(
            createFrame(AlgorithmMode.TP, {
              nums: [...nums],
              i,
              left,
              right,
              result: [...result],
              line: 12,
              message: `Left 侧指针遇到相同值的兄弟，触发 Deduplication 2，继续跳过。`,
              phase: 'skip-duplicate',
            })
          );
        }

        while (left < right && nums[right] === nums[right - 1]) {
          right--;
          frames.push(
            createFrame(AlgorithmMode.TP, {
              nums: [...nums],
              i,
              left,
              right,
              result: [...result],
              line: 13,
              message: `Right 侧指针遇到相同值的兄弟，触发 Deduplication 3，继续跳过。`,
              phase: 'skip-duplicate',
            })
          );
        }

        // 双双步入新境界
        left++;
        right--;
      } else if (sum < 0) {
        left++;
        frames.push(
          createFrame(AlgorithmMode.TP, {
            nums: [...nums],
            i,
            left,
            right,
            currentSum: sum,
            result: [...result],
            line: 16,
            message: `和太小（< 0），Left 右移以放大基数。`,
            phase: 'searching',
          })
        );
      } else {
        right--;
        frames.push(
          createFrame(AlgorithmMode.TP, {
            nums: [...nums],
            i,
            left,
            right,
            currentSum: sum,
            result: [...result],
            line: 17,
            message: `和太大（> 0），Right 左移以缩小基数。`,
            phase: 'searching',
          })
        );
      }
    }
  }

  frames.push(
    createFrame(AlgorithmMode.TP, {
      nums: [...nums],
      result: [...result],
      line: 21,
      message: `优雅的 O(N²) 结束。共捕获到 ${result.length} 组不重复三元。`,
      phase: 'completed',
    })
  );

  return frames;
}
