import { AlgorithmMode, ContainerFrame, ContainerInput } from './types';

function createFrame(mode: AlgorithmMode, overrides: Partial<ContainerFrame>): ContainerFrame {
  return {
    mode,
    line: 0,
    message: '',
    height: [],
    left: 0,
    right: 0,
    maxArea: 0,
    ...overrides,
  };
}

export function generateContainerFrames(input: ContainerInput, mode: string): ContainerFrame[] {
  switch (mode) {
    case AlgorithmMode.FAST_SKIP:
      return generateFastSkipFrames(input);
    case AlgorithmMode.SORT_INDEX:
      return generateSortIndexFrames(input);
    case AlgorithmMode.CLASSIC:
    default:
      return generateClassicFrames(input);
  }
}

function generateClassicFrames(input: ContainerInput): ContainerFrame[] {
  const frames: ContainerFrame[] = [];
  const { height } = input;
  let left = 0,
    right = height.length - 1,
    maxResult = 0;

  frames.push(
    createFrame(AlgorithmMode.CLASSIC, {
      height: [...height],
      left,
      right,
      maxArea: maxResult,
      line: 2,
      message: '初始化左右指针，分别指向数组的两端。当前为最大初始宽度。',
    })
  );

  while (left < right) {
    const currentHeight = Math.min(height[left], height[right]);
    const currentWidth = right - left;
    const currentArea = currentHeight * currentWidth;

    frames.push(
      createFrame(AlgorithmMode.CLASSIC, {
        height: [...height],
        left,
        right,
        maxArea: maxResult,
        currentArea,
        line: 9,
        message: `计算当前水槽面积：短板高度(${currentHeight}) × 宽度(${currentWidth}) = ${currentArea}`,
      })
    );

    if (currentArea > maxResult) {
      maxResult = currentArea;
      frames.push(
        createFrame(AlgorithmMode.CLASSIC, {
          height: [...height],
          left,
          right,
          maxArea: maxResult,
          currentArea,
          line: 11,
          message: `发现更大承载量！历史最大面积刷新为：${maxResult}`,
        })
      );
    }

    if (height[left] < height[right]) {
      frames.push(
        createFrame(AlgorithmMode.CLASSIC, {
          height: [...height],
          left,
          right,
          maxArea: maxResult,
          currentArea,
          line: 14,
          message: `贪心判断：左侧柱子（高度 ${height[left]}）较短。若保留短板面积只会减少，故左指针右移寻找更高柱子。`,
        })
      );
      left++;
    } else {
      frames.push(
        createFrame(AlgorithmMode.CLASSIC, {
          height: [...height],
          left,
          right,
          maxArea: maxResult,
          currentArea,
          line: 16,
          message: `贪心判断：右侧柱子（高度 ${height[right]}）较短或平局。放弃右侧柱子，右指针左移。`,
        })
      );
      right--;
    }
  }

  frames.push(
    createFrame(AlgorithmMode.CLASSIC, {
      height: [...height],
      left,
      right,
      maxArea: maxResult,
      line: 20,
      message: `双指针相遇，扫描结束！全场能构成的最大盛水面积锁定为：${maxResult}`,
    })
  );

  return frames;
}

function generateFastSkipFrames(input: ContainerInput): ContainerFrame[] {
  const frames: ContainerFrame[] = [];
  const { height } = input;
  let left = 0,
    right = height.length - 1,
    maxResult = 0;

  frames.push(
    createFrame(AlgorithmMode.FAST_SKIP, {
      height: [...height],
      left,
      right,
      maxArea: maxResult,
      line: 2,
      message: '使用极致性能优化版（Fast Skip）。初始指针分布在两端。',
    })
  );

  while (left < right) {
    const hLeft = height[left];
    const hRight = height[right];

    const minHeight = hLeft < hRight ? hLeft : hRight;
    const currentArea = minHeight * (right - left);

    frames.push(
      createFrame(AlgorithmMode.FAST_SKIP, {
        height: [...height],
        left,
        right,
        maxArea: maxResult,
        currentArea,
        line: 11,
        message: `计算基准面积：高度 ${minHeight} × 宽度 ${right - left} = ${currentArea}`,
      })
    );

    if (currentArea > maxResult) {
      maxResult = currentArea;
      frames.push(
        createFrame(AlgorithmMode.FAST_SKIP, {
          height: [...height],
          left,
          right,
          maxArea: maxResult,
          currentArea,
          line: 13,
          message: `刷新全局最大盛水记录 -> ${maxResult}`,
        })
      );
    }

    // Fast Skip
    if (hLeft < hRight) {
      frames.push(
        createFrame(AlgorithmMode.FAST_SKIP, {
          height: [...height],
          left,
          right,
          maxArea: maxResult,
          currentArea,
          line: 17,
          message: `【跳跃预警】左侧板（${hLeft}）属于短板。将连续跳过所有低于或等于 ${minHeight} 的柱体，压榨常数时间！`,
        })
      );
      do {
        left++;
      } while (left < right && height[left] <= minHeight);

      frames.push(
        createFrame(AlgorithmMode.FAST_SKIP, {
          height: [...height],
          left,
          right,
          maxArea: maxResult,
          currentArea,
          line: 18,
          message: `跳跃完成。左指针落位于索引 ${left}（高度 ${height[left]}）。`,
        })
      );
    } else {
      frames.push(
        createFrame(AlgorithmMode.FAST_SKIP, {
          height: [...height],
          left,
          right,
          maxArea: maxResult,
          currentArea,
          line: 21,
          message: `【跳跃预警】右侧板（${hRight}）偏低。向左连续跳过低于或等于 ${minHeight} 的“无用”矮柱。`,
        })
      );
      do {
        right--;
      } while (left < right && height[right] <= minHeight);

      frames.push(
        createFrame(AlgorithmMode.FAST_SKIP, {
          height: [...height],
          left,
          right,
          maxArea: maxResult,
          currentArea,
          line: 22,
          message: `右侧跳跃收停。右指针落位于索引 ${right}（高度 ${height[right]}）。`,
        })
      );
    }
  }

  frames.push(
    createFrame(AlgorithmMode.FAST_SKIP, {
      height: [...height],
      left,
      right,
      maxArea: maxResult,
      line: 28,
      message: `跳跃式双指针搜索收官！终极最大面积：${maxResult}`,
    })
  );

  return frames;
}

function generateSortIndexFrames(input: ContainerInput): ContainerFrame[] {
  const frames: ContainerFrame[] = [];
  const { height } = input;
  const n = height.length;

  frames.push(
    createFrame(AlgorithmMode.SORT_INDEX, {
      height: [...height],
      left: 0,
      right: n - 1,
      maxArea: 0,
      line: 2,
      message: '数学降维解法启动！首先创建一个包含原木块索引的影子数组...',
    })
  );

  const indices = new Int32Array(n);
  for (let i = 0; i < n; i++) {
    indices[i] = i;
  }

  indices.sort((a, b) => height[b] - height[a]);
  const sortedHeights = Array.from(indices).map((idx) => ({
    height: height[idx],
    originalIdx: idx,
  }));

  frames.push(
    createFrame(AlgorithmMode.SORT_INDEX, {
      height: [...height],
      left: 0,
      right: n - 1,
      maxArea: 0,
      sortedHeights,
      line: 8,
      message: `预排大招：根据高度对原索引进行「从高到低」降序重排。`,
    })
  );

  let maxResult = 0;
  let minIdx = n;
  let maxIdx = -1;

  for (let i = 0; i < n; i++) {
    const originalIdx = indices[i];
    const itemHeight = height[originalIdx];

    frames.push(
      createFrame(AlgorithmMode.SORT_INDEX, {
        height: [...height],
        left: 0, // unused ideally but keeps interface intact
        right: 0,
        maxArea: maxResult,
        sortedHeights,
        currentProcessedIdx: originalIdx,
        minIdx: minIdx === n ? undefined : minIdx,
        maxIdx: maxIdx === -1 ? undefined : maxIdx,
        line: 15,
        message: `抽取本轮目标：原数组索引 ${originalIdx} (高度为 ${itemHeight})。因为按序遍历，它注定是目前为止见过的「最短板」。`,
      })
    );

    if (originalIdx < minIdx) minIdx = originalIdx;
    if (originalIdx > maxIdx) maxIdx = originalIdx;

    const dist = Math.max(originalIdx - minIdx, maxIdx - originalIdx);
    const area = itemHeight * dist;

    frames.push(
      createFrame(AlgorithmMode.SORT_INDEX, {
        height: [...height],
        left: minIdx, // repurposing left/right mapping to show index spreads
        right: maxIdx,
        maxArea: maxResult,
        sortedHeights,
        currentProcessedIdx: originalIdx,
        minIdx,
        maxIdx,
        currentArea: area,
        line: 21,
        message: `追踪池更新：已知最左索引 minIdx=${minIdx}，最右 maxIdx=${maxIdx}。当前板与极值边缘最大跨度为 ${dist}，构木桶面积=${area}`,
      })
    );

    if (area > maxResult) {
      maxResult = area;
      frames.push(
        createFrame(AlgorithmMode.SORT_INDEX, {
          height: [...height],
          left: minIdx,
          right: maxIdx,
          maxArea: maxResult,
          sortedHeights,
          currentProcessedIdx: originalIdx,
          minIdx,
          maxIdx,
          currentArea: area,
          line: 24,
          message: `该最短板的极限潜能破了全局纪录！最新最大面积 -> ${maxResult}`,
        })
      );
    }
  }

  frames.push(
    createFrame(AlgorithmMode.SORT_INDEX, {
      height: [...height],
      left: minIdx,
      right: maxIdx,
      maxArea: maxResult,
      sortedHeights,
      minIdx,
      maxIdx,
      line: 29,
      message: `数学推导完毕，无需传统相撞。算法确认该容器之王承重面积为：${maxResult}`,
    })
  );

  return frames;
}
