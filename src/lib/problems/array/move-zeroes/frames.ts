import { ElementState, MoveZeroesFrame, MoveZeroesInput } from './types';

/**
 * 解法1：覆盖填充法（两次遍历）
 * 第一遍：将所有非零元素按顺序覆盖到数组前端
 * 第二遍：将剩余位置填充为 0
 */
export function generateOverwriteFillFrames(input: MoveZeroesInput): MoveZeroesFrame[] {
  const frames: MoveZeroesFrame[] = [];
  const nums = [...input.nums];
  const n = nums.length;

  const createFrame = (overrides: Partial<MoveZeroesFrame> = {}): MoveZeroesFrame => ({
    line: 0,
    message: '',
    nums: [...nums],
    states: new Array(n).fill(ElementState.NORMAL),
    ...overrides,
  });

  frames.push(createFrame({ line: 1, message: '算法开始：覆盖填充法' }));

  let insertPos = 0;
  const states = new Array(n).fill(ElementState.NORMAL);

  frames.push(
    createFrame({
      line: 2,
      message: `初始化 insertPos = 0（下一个非零元素的写入位置）`,
      slow: insertPos,
      states: [...states],
    })
  );

  // 第一遍：将所有非零元素按顺序移到前端
  for (let i = 0; i < n; i++) {
    const currentStates = [...states];
    currentStates[i] = ElementState.FAST_PTR;
    if (insertPos < n) currentStates[insertPos] = ElementState.SLOW_PTR;

    frames.push(
      createFrame({
        line: 5,
        message: `扫描 nums[${i}] = ${nums[i]}`,
        fast: i,
        slow: insertPos,
        states: currentStates,
      })
    );

    if (nums[i] !== 0) {
      frames.push(
        createFrame({
          line: 6,
          message: `nums[${i}] = ${nums[i]} 不为 0，写入 nums[${insertPos}]`,
          fast: i,
          slow: insertPos,
          states: currentStates,
        })
      );

      nums[insertPos] = nums[i];
      states[insertPos] = ElementState.DONE;

      frames.push(
        createFrame({
          line: 7,
          message: `nums[${insertPos}] = ${nums[insertPos]}，insertPos++`,
          fast: i,
          slow: insertPos,
          states: [...states],
        })
      );

      insertPos++;
    } else {
      frames.push(
        createFrame({
          line: 5,
          message: `nums[${i}] = 0，跳过`,
          fast: i,
          slow: insertPos,
          states: currentStates,
        })
      );
    }
  }

  frames.push(
    createFrame({
      line: 10,
      message: `第一遍完成，非零元素已移至前 ${insertPos} 位`,
      slow: insertPos,
      states: [...states],
    })
  );

  // 第二遍：将剩余位置填充为 0
  for (let i = insertPos; i < n; i++) {
    nums[i] = 0;
    states[i] = ElementState.ZERO;

    frames.push(
      createFrame({
        line: 12,
        message: `填充 nums[${i}] = 0`,
        fast: i,
        states: [...states],
      })
    );
  }

  // 最终状态
  const finalStates = new Array(n).fill(ElementState.DONE);

  frames.push(
    createFrame({
      line: 14,
      message: '算法完成，所有零已移至末尾',
      states: finalStates,
    })
  );

  return frames;
}

/**
 * 解法2：双指针交换法（一次遍历）
 * 遇到非零元素时与 slow 位置交换
 */
export function generateTwoPointersFrames(input: MoveZeroesInput): MoveZeroesFrame[] {
  const frames: MoveZeroesFrame[] = [];
  const nums = [...input.nums];
  const n = nums.length;

  const createFrame = (overrides: Partial<MoveZeroesFrame> = {}): MoveZeroesFrame => ({
    line: 0,
    message: '',
    nums: [...nums],
    states: new Array(n).fill(ElementState.NORMAL),
    ...overrides,
  });

  frames.push(createFrame({ line: 1, message: '算法开始：双指针交换法' }));

  let slow = 0;
  const states = new Array(n).fill(ElementState.NORMAL);

  frames.push(
    createFrame({
      line: 2,
      message: `初始化 slow = 0`,
      slow: slow,
      states: [...states],
    })
  );

  for (let fast = 0; fast < n; fast++) {
    const currentStates = [...states];
    currentStates[fast] = ElementState.FAST_PTR;
    if (slow < n && slow !== fast) currentStates[slow] = ElementState.SLOW_PTR;

    frames.push(
      createFrame({
        line: 3,
        message: `fast = ${fast}，检查 nums[fast] = ${nums[fast]}`,
        fast: fast,
        slow: slow,
        states: currentStates,
      })
    );

    if (nums[fast] !== 0) {
      if (fast !== slow) {
        // 交换动画
        const swapStates = [...states];
        swapStates[fast] = ElementState.SWAP;
        swapStates[slow] = ElementState.SWAP;

        frames.push(
          createFrame({
            line: 6,
            message: `交换 nums[${slow}] (${nums[slow]}) ↔ nums[${fast}] (${nums[fast]})`,
            fast: fast,
            slow: slow,
            states: swapStates,
          })
        );

        // 执行交换
        [nums[slow], nums[fast]] = [nums[fast], nums[slow]];

        frames.push(
          createFrame({
            line: 6,
            message: `交换完成`,
            fast: fast,
            slow: slow,
            states: swapStates,
          })
        );
      } else {
        frames.push(
          createFrame({
            line: 5,
            message: `slow = fast，无需交换`,
            fast: fast,
            slow: slow,
            states: currentStates,
          })
        );
      }

      states[slow] = ElementState.DONE;
      slow++;

      frames.push(
        createFrame({
          line: 8,
          message: `slow++ → ${slow}`,
          fast: fast,
          slow: slow,
          states: [...states],
        })
      );
    } else {
      frames.push(
        createFrame({
          line: 4,
          message: `nums[${fast}] = 0，跳过`,
          fast: fast,
          slow: slow,
          states: currentStates,
        })
      );
    }
  }

  // 最终状态
  const finalStates = new Array(n).fill(ElementState.DONE);

  frames.push(
    createFrame({
      line: 10,
      message: '算法完成，所有零已移至末尾',
      states: finalStates,
    })
  );

  return frames;
}

/**
 * 解法3：排序法（O(N log N)，不推荐但需了解）
 * 使用自定义比较器，将零排到末尾
 */
export function generateSortMethodFrames(input: MoveZeroesInput): MoveZeroesFrame[] {
  const frames: MoveZeroesFrame[] = [];
  const nums = [...input.nums];
  const n = nums.length;

  const createFrame = (overrides: Partial<MoveZeroesFrame> = {}): MoveZeroesFrame => ({
    line: 0,
    message: '',
    nums: [...nums],
    states: new Array(n).fill(ElementState.NORMAL),
    ...overrides,
  });

  frames.push(createFrame({ line: 1, message: '算法开始：排序法（O(N log N)）' }));

  // 模拟排序过程的可视化
  // 由于 JS 的 sort 是黑盒，我们展示排序前后的状态
  frames.push(
    createFrame({
      line: 2,
      message: '调用 nums.sort() 使用自定义比较器',
      states: new Array(n).fill(ElementState.SWAP),
    })
  );

  // 执行排序
  nums.sort((a, b) => {
    if (b === 0 && a !== 0) return -1;
    if (a === 0 && b !== 0) return 1;
    return 0;
  });

  // 展示排序过程（简化版：展示几个中间状态）
  frames.push(
    createFrame({
      line: 4,
      message: '比较器逻辑：非零元素排前，零排后，保持相对顺序',
      states: new Array(n).fill(ElementState.SWAP),
    })
  );

  frames.push(
    createFrame({
      line: 8,
      message: '排序完成',
      states: new Array(n).fill(ElementState.SWAP),
    })
  );

  // 最终状态
  const finalStates = new Array(n).fill(ElementState.DONE);

  frames.push(
    createFrame({
      line: 10,
      message: '算法完成，所有零已移至末尾（时间复杂度 O(N log N)）',
      states: finalStates,
    })
  );

  return frames;
}
