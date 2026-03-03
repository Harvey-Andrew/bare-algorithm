import { AlgorithmMode, LongestConsecutiveFrame, LongestConsecutiveInput } from './types';

function createFrame(
  mode: AlgorithmMode,
  overrides: Partial<LongestConsecutiveFrame>
): LongestConsecutiveFrame {
  return {
    mode,
    line: 0,
    message: '',
    nums: [],
    numSet: new Set(),
    currentNum: null,
    currentStreak: 0,
    longestStreak: 0,
    streakNums: [],
    phase: 'init',
    ...overrides,
  };
}

export function generateHashSetFrames(input: LongestConsecutiveInput): LongestConsecutiveFrame[] {
  const frames: LongestConsecutiveFrame[] = [];
  const nums = input.nums;

  frames.push(
    createFrame(AlgorithmMode.HASH_SET, {
      line: 1,
      message: `初始化未排序数组: [${nums.join(', ')}]`,
      nums: [...nums],
      phase: 'init',
    })
  );

  if (nums.length === 0) {
    frames.push(
      createFrame(AlgorithmMode.HASH_SET, {
        line: 2,
        message: `数组为空，直接返回长度 0`,
        nums: [],
        phase: 'done',
      })
    );
    return frames;
  }

  const numSet = new Set(nums);

  frames.push(
    createFrame(AlgorithmMode.HASH_SET, {
      line: 3,
      message: `构建哈希集合提供 O(1) 查询并去重: {${[...numSet].sort((a, b) => a - b).join(', ')}}`,
      nums: [...nums],
      numSet: new Set(numSet),
      phase: 'build',
    })
  );

  let maxLength = 0;
  let bestStreakNums: number[] = [];

  for (const num of numSet) {
    frames.push(
      createFrame(AlgorithmMode.HASH_SET, {
        line: 6,
        message: `枚举哈希表，检查集合中是否包含 ${num} 的左邻居 ${num - 1}`,
        nums: [...nums],
        numSet: new Set(numSet),
        currentNum: num,
        longestStreak: maxLength,
        streakNums: [...bestStreakNums],
        phase: 'search',
      })
    );

    if (!numSet.has(num - 1)) {
      let currentNum = num;
      let currentLength = 1;
      const streakNums = [num];

      frames.push(
        createFrame(AlgorithmMode.HASH_SET, {
          line: 9,
          message: `${num - 1} 不存在，说明 ${num} 是某段连续序列的起点，开始向右匹配`,
          nums: [...nums],
          numSet: new Set(numSet),
          currentNum,
          currentStreak: currentLength,
          longestStreak: maxLength,
          streakNums: [...streakNums],
          phase: 'search',
        })
      );

      while (numSet.has(currentNum + 1)) {
        currentNum += 1;
        currentLength += 1;
        streakNums.push(currentNum);

        frames.push(
          createFrame(AlgorithmMode.HASH_SET, {
            line: 13,
            message: `集合中存在 ${currentNum}，将当前序列扩展: ${streakNums.join(' → ')} (当前长度 ${currentLength})`,
            nums: [...nums],
            numSet: new Set(numSet),
            currentNum,
            currentStreak: currentLength,
            longestStreak: maxLength,
            streakNums: [...streakNums],
            phase: 'search',
          })
        );
      }

      if (currentLength > maxLength) {
        maxLength = currentLength;
        bestStreakNums = [...streakNums];

        frames.push(
          createFrame(AlgorithmMode.HASH_SET, {
            line: 18,
            message: `此段序列匹配结束。更新最长连续序列为: ${streakNums.join(' → ')} (最大长度刷新为 ${maxLength})`,
            nums: [...nums],
            numSet: new Set(numSet),
            currentStreak: currentLength,
            longestStreak: maxLength,
            streakNums: [...streakNums],
            phase: 'search',
          })
        );
      } else {
        frames.push(
          createFrame(AlgorithmMode.HASH_SET, {
            line: 18,
            message: `此段序列匹配结束。长度 ${currentLength} 未超过目前最大长度 ${maxLength}`,
            nums: [...nums],
            numSet: new Set(numSet),
            currentStreak: currentLength,
            longestStreak: maxLength,
            streakNums: [...streakNums],
            phase: 'search',
          })
        );
      }
    } else {
      frames.push(
        createFrame(AlgorithmMode.HASH_SET, {
          line: 7,
          message: `${num - 1} 存在，说明 ${num} 只是中间节点，为了保证 O(N) 复杂度，直接跳过不作处理`,
          nums: [...nums],
          numSet: new Set(numSet),
          currentNum: num,
          longestStreak: maxLength,
          streakNums: [...bestStreakNums],
          phase: 'search',
        })
      );
    }
  }

  frames.push(
    createFrame(AlgorithmMode.HASH_SET, {
      line: 23,
      message: `遍历集合结束！最长连续序列长度: ${maxLength}`,
      nums: [...nums],
      numSet: new Set(numSet),
      longestStreak: maxLength,
      streakNums: bestStreakNums,
      phase: 'done',
    })
  );

  return frames;
}

export function generateDPHashMapFrames(input: LongestConsecutiveInput): LongestConsecutiveFrame[] {
  const frames: LongestConsecutiveFrame[] = [];
  const nums = input.nums;

  frames.push(
    createFrame(AlgorithmMode.DP_HASH_MAP, {
      line: 1,
      message: `初始数组: [${nums.join(', ')}]，准备使用哈希拼凑法`,
      nums: [...nums],
      phase: 'init',
    })
  );

  if (nums.length === 0) {
    frames.push(
      createFrame(AlgorithmMode.DP_HASH_MAP, {
        line: 2,
        message: '数组为空，直接返回长度 0',
        nums: [],
        phase: 'done',
      })
    );
    return frames;
  }

  const dp = new Map<number, number>();
  let maxLength = 0;
  let bestStreakNums: number[] = [];

  frames.push(
    createFrame(AlgorithmMode.DP_HASH_MAP, {
      line: 3,
      message: `初始化一个 Map(dp) 记录每个区间端点的连续序列长度`,
      nums: [...nums],
      dpMap: new Map(dp),
      phase: 'build',
    })
  );

  for (const num of nums) {
    if (dp.has(num)) {
      frames.push(
        createFrame(AlgorithmMode.DP_HASH_MAP, {
          line: 7,
          message: `节点 ${num} 已在哈希表中处理过，防止破坏已有区间边界，直接跳过`,
          nums: [...nums],
          currentNum: num,
          longestStreak: maxLength,
          streakNums: [...bestStreakNums],
          dpMap: new Map(dp),
          phase: 'search',
        })
      );
      continue;
    }

    const left = dp.get(num - 1) ?? 0;
    const right = dp.get(num + 1) ?? 0;
    const currentLength = left + right + 1;

    // 生成这部分区间的序列仅为展示需要
    const minNode = num - left;
    const currentStreakNums = Array.from({ length: currentLength }, (_, i) => minNode + i);

    frames.push(
      createFrame(AlgorithmMode.DP_HASH_MAP, {
        line: 11,
        message: `遇到新数字 ${num}，它连接起了左区间(长度 ${left})和右区间(长度 ${right})，新区间总长度: ${currentLength}`,
        nums: [...nums],
        currentNum: num,
        longestStreak: maxLength,
        streakNums: [...currentStreakNums],
        dpMap: new Map(dp),
        leftLength: left,
        rightLength: right,
        phase: 'update_dp',
      })
    );

    if (currentLength > maxLength) {
      maxLength = currentLength;
      bestStreakNums = [...currentStreakNums];

      frames.push(
        createFrame(AlgorithmMode.DP_HASH_MAP, {
          line: 14,
          message: `新序列 ${currentStreakNums.join('→')} 的长度 ${currentLength} 打破了历史最高记录，刷新全局最大长度`,
          nums: [...nums],
          currentNum: num,
          longestStreak: maxLength,
          streakNums: [...currentStreakNums],
          dpMap: new Map(dp),
          phase: 'update_dp',
        })
      );
    }

    dp.set(num, currentLength);
    dp.set(num - left, currentLength);
    dp.set(num + right, currentLength);

    frames.push(
      createFrame(AlgorithmMode.DP_HASH_MAP, {
        line: 18,
        message: `关键更新：更新新区间左端点 ${num - left}，右端点 ${num + right} 的映射值为 ${currentLength}`,
        nums: [...nums],
        currentNum: num,
        longestStreak: maxLength,
        streakNums: [...currentStreakNums],
        dpMap: new Map(dp),
        phase: 'update_dp',
      })
    );
  }

  frames.push(
    createFrame(AlgorithmMode.DP_HASH_MAP, {
      line: 23,
      message: `区间拼接合并处理完成！最长连续序列长度: ${maxLength}`,
      nums: [...nums],
      dpMap: new Map(dp),
      longestStreak: maxLength,
      streakNums: bestStreakNums,
      phase: 'done',
    })
  );

  return frames;
}

export function generateSortingFrames(input: LongestConsecutiveInput): LongestConsecutiveFrame[] {
  const frames: LongestConsecutiveFrame[] = [];
  const nums = [...input.nums];

  frames.push(
    createFrame(AlgorithmMode.SORTING, {
      line: 1,
      message: `使用原地排序法，初始数组: [${nums.join(', ')}]`,
      nums: [...nums],
      sortedNums: [...nums],
      phase: 'init',
    })
  );

  if (nums.length === 0) {
    frames.push(
      createFrame(AlgorithmMode.SORTING, {
        line: 2,
        message: '数组为空，返回长度 0',
        nums: [],
        sortedNums: [],
        phase: 'done',
      })
    );
    return frames;
  }

  nums.sort((a, b) => a - b);
  frames.push(
    createFrame(AlgorithmMode.SORTING, {
      line: 3,
      message: `利用底层 Timsort 原地排序数组: [${nums.join(', ')}]`,
      nums: [...input.nums],
      sortedNums: [...nums],
      phase: 'sort',
    })
  );

  let maxLength = 1;
  let currentLength = 1;
  let currentStreakNums: number[] = [nums[0]];
  let bestStreakNums: number[] = [nums[0]];

  for (let i = 1; i < nums.length; i++) {
    frames.push(
      createFrame(AlgorithmMode.SORTING, {
        line: 8,
        message: `遍历到元素 ${nums[i]}，与前一个元素 ${nums[i - 1]} 比较`,
        nums: [...input.nums],
        sortedNums: [...nums],
        currentIndex: i,
        currentNum: nums[i],
        currentStreak: currentLength,
        longestStreak: maxLength,
        streakNums: [...currentStreakNums],
        phase: 'search',
      })
    );

    if (nums[i] === nums[i - 1]) {
      frames.push(
        createFrame(AlgorithmMode.SORTING, {
          line: 9,
          message: `遇到重复元素 ${nums[i]}，不影响连续性，直接跳过处理`,
          nums: [...input.nums],
          sortedNums: [...nums],
          currentIndex: i,
          currentNum: nums[i],
          currentStreak: currentLength,
          longestStreak: maxLength,
          streakNums: [...currentStreakNums],
          phase: 'search',
        })
      );
      continue;
    }

    if (nums[i] === nums[i - 1] + 1) {
      currentLength++;
      currentStreakNums.push(nums[i]);
      frames.push(
        createFrame(AlgorithmMode.SORTING, {
          line: 12,
          message: `数值相差正好为 1，将 ${nums[i]} 加入当前连续序列，长度变为了 ${currentLength}`,
          nums: [...input.nums],
          sortedNums: [...nums],
          currentIndex: i,
          currentNum: nums[i],
          currentStreak: currentLength,
          longestStreak: maxLength,
          streakNums: [...currentStreakNums],
          phase: 'search',
        })
      );
    } else {
      if (currentLength > maxLength) {
        maxLength = currentLength;
        bestStreakNums = [...currentStreakNums];

        frames.push(
          createFrame(AlgorithmMode.SORTING, {
            line: 15,
            message: `序列发生断层。上一个断掉的序列长度 ${currentLength} 更新了全局最大长度！`,
            nums: [...input.nums],
            sortedNums: [...nums],
            currentIndex: i,
            currentNum: nums[i],
            currentStreak: currentLength,
            longestStreak: maxLength,
            streakNums: [...currentStreakNums],
            phase: 'search',
          })
        );
      }

      currentLength = 1;
      currentStreakNums = [nums[i]];

      frames.push(
        createFrame(AlgorithmMode.SORTING, {
          line: 18,
          message: `序列产生断层，当前连续序列长度重置为 1 (从 ${nums[i]} 重新开始计算)`,
          nums: [...input.nums],
          sortedNums: [...nums],
          currentIndex: i,
          currentNum: nums[i],
          currentStreak: currentLength,
          longestStreak: maxLength,
          streakNums: [...currentStreakNums],
          phase: 'search',
        })
      );
    }
  }

  if (currentLength > maxLength) {
    maxLength = currentLength;
    bestStreakNums = [...currentStreakNums];
  }

  frames.push(
    createFrame(AlgorithmMode.SORTING, {
      line: 23,
      message: `遍历完成。最长连续序列长度经整理后为: ${maxLength}`,
      nums: [...input.nums],
      sortedNums: [...nums],
      longestStreak: maxLength,
      streakNums: bestStreakNums,
      phase: 'done',
    })
  );

  return frames;
}
