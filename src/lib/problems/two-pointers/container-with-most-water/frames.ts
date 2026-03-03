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

export function generateBruteForceFrames(input: ContainerInput): ContainerFrame[] {
  const frames: ContainerFrame[] = [];
  const { height } = input;
  let maxArea = 0;

  frames.push(
    createFrame(AlgorithmMode.BRUTE_FORCE, {
      height: [...height],
      left: 0,
      right: 0,
      maxArea,
      line: 2,
      message: '初始设定最大面积为 0。准备发起暴力扫描。',
    })
  );

  let frameCount = 0;
  const MAX_FRAMES = 150; // 防止无限帧崩溃前台

  for (let i = 0; i < height.length - 1; i++) {
    for (let j = i + 1; j < height.length; j++) {
      if (frameCount >= MAX_FRAMES) break;

      frames.push(
        createFrame(AlgorithmMode.BRUTE_FORCE, {
          height: [...height],
          left: i,
          right: j,
          maxArea,
          line: 5,
          message: `评估组合: i=${i}, j=${j}`,
        })
      );
      frameCount++;

      const currentArea = Math.min(height[i], height[j]) * (j - i);

      if (currentArea > maxArea) {
        maxArea = currentArea;
        frames.push(
          createFrame(AlgorithmMode.BRUTE_FORCE, {
            height: [...height],
            left: i,
            right: j,
            maxArea,
            currentArea,
            line: 7,
            message: `更新最大面积: ${currentArea}!`,
          })
        );
        frameCount++;
      } else {
        frames.push(
          createFrame(AlgorithmMode.BRUTE_FORCE, {
            height: [...height],
            left: i,
            right: j,
            maxArea,
            currentArea,
            line: 5,
            message: `面积 ${currentArea} 未超越 ${maxArea}，继续。`,
          })
        );
        frameCount++;
      }
    }
    if (frameCount >= MAX_FRAMES) break;
  }

  frames.push(
    createFrame(AlgorithmMode.BRUTE_FORCE, {
      height: [...height],
      left: 0,
      right: height.length - 1,
      maxArea,
      line: 11,
      message:
        frameCount >= MAX_FRAMES
          ? `超出帧上限，扫描终止。当前最高记录: ${maxArea}`
          : `扫描完成! 最高面积: ${maxArea}`,
    })
  );

  return frames;
}

export function generateTwoPointersFrames(input: ContainerInput): ContainerFrame[] {
  const frames: ContainerFrame[] = [];
  const { height } = input;
  let left = 0,
    right = height.length - 1,
    maxArea = 0;

  frames.push(
    createFrame(AlgorithmMode.TP, {
      height: [...height],
      left,
      right,
      maxArea,
      line: 2,
      message: '初始化左右指针到数组两端。',
    })
  );

  while (left < right) {
    const currentArea = (right - left) * Math.min(height[left], height[right]);

    frames.push(
      createFrame(AlgorithmMode.TP, {
        height: [...height],
        left,
        right,
        maxArea,
        currentArea,
        line: 7,
        message: `计算当前面积: (宽度 ${right - left}) x (最小高度 ${Math.min(height[left], height[right])}) = ${currentArea}`,
      })
    );

    if (currentArea > maxArea) {
      maxArea = currentArea;
      frames.push(
        createFrame(AlgorithmMode.TP, {
          height: [...height],
          left,
          right,
          maxArea,
          currentArea,
          line: 9,
          message: `新记录出现！最大面积更新为 ${maxArea}。`,
        })
      );
    }

    if (height[left] < height[right]) {
      frames.push(
        createFrame(AlgorithmMode.TP, {
          height: [...height],
          left,
          right,
          maxArea,
          currentArea,
          line: 13,
          message: `高度 ${height[left]} < ${height[right]}。短板在左边，舍弃 ${height[left]} 所在的这根柱子向右探索。`,
        })
      );
      left++;
    } else {
      frames.push(
        createFrame(AlgorithmMode.TP, {
          height: [...height],
          left,
          right,
          maxArea,
          currentArea,
          line: 15,
          message: `高度 ${height[left]} ≥ ${height[right]}。短板在右边，舍弃 ${height[right]} 所在的这根柱子向左探索。`,
        })
      );
      right--;
    }
  }

  frames.push(
    createFrame(AlgorithmMode.TP, {
      height: [...height],
      left,
      right,
      maxArea,
      line: 18,
      message: `指针相遇，搜索完成! 最大水面面积为: ${maxArea}`,
    })
  );

  return frames;
}
