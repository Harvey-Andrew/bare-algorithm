import { AlgorithmMode, GroupAnagramsFrame, GroupAnagramsInput } from './types';

function generateSortingFrames(input: GroupAnagramsInput): GroupAnagramsFrame[] {
  const frames: GroupAnagramsFrame[] = [];
  const map = new Map<string, string[]>();
  const strs = input.strs;

  const takeSnapshot = (
    currentIndex: number,
    message: string,
    line: number,
    extra?: Partial<GroupAnagramsFrame>
  ) => {
    frames.push({
      strs,
      currentIndex,
      currentStr: strs[currentIndex] || '',
      calculatedKey: extra?.calculatedKey !== undefined ? extra.calculatedKey : null,
      mapState: Array.from(map.entries()).map(([k, group]) => ({ key: k, group: [...group] })),
      line,
      message,
      ...extra,
    });
  };

  takeSnapshot(-1, `[基于排序作特征键] 准备开辟哈希表，并开始遍历所有字符串`, 1);

  for (let i = 0; i < strs.length; i++) {
    const s = strs[i];
    takeSnapshot(i, `拿到字符串 "${s}"，准备提取它的特征 Key`, 3);

    const arrayForm = s.split('');
    takeSnapshot(i, `因为不可变且无排序 API，将其打散成字符数组以备重排`, 4, {
      sortingProcess: { original: s, arrayForm: [...arrayForm], sortedForm: [] },
    });

    const sortedForm = [...arrayForm].sort();
    takeSnapshot(i, `对字符数组进行字典序排序，得到规整后的唯一组合状态`, 4, {
      sortingProcess: { original: s, arrayForm: [...arrayForm], sortedForm: [...sortedForm] },
    });

    const key = sortedForm.join('');
    takeSnapshot(
      i,
      `重新拼接数组为字符串 "${key}"。只要是互为字母异位词，拼接出的这个 Key 绝对一致！`,
      4,
      {
        calculatedKey: key,
        sortingProcess: { original: s, arrayForm: [...arrayForm], sortedForm: [...sortedForm] },
      }
    );

    const group = map.get(key);
    if (group !== undefined) {
      takeSnapshot(
        i,
        `去哈希表里查 "${key}"，发现它已经存在！说明遇到了同乡，准备将其加入该分组。`,
        5,
        { calculatedKey: key }
      );
      group.push(s);
      takeSnapshot(i, `成功追加到现存的 ["${group.join('", "')}"] 集合中。`, 6, {
        calculatedKey: key,
      });
    } else {
      takeSnapshot(
        i,
        `去哈希表里查 "${key}"，发现没有。说明它是该异位组合序列的第一个开拓者。`,
        7,
        { calculatedKey: key }
      );
      map.set(key, [s]);
      takeSnapshot(i, `开辟了一个新的映射关系: "${key}" => ["${s}"]`, 8, { calculatedKey: key });
    }
  }

  takeSnapshot(
    strs.length,
    `整条数组遍历完毕。把 Map 里的所有的 values 一次性全倒出来，就是我们要的最终按组归纳好的结果群。`,
    10
  );
  return frames;
}

function generateCountHashFrames(input: GroupAnagramsInput): GroupAnagramsFrame[] {
  const frames: GroupAnagramsFrame[] = [];
  const map = new Map<string, string[]>();
  const strs = input.strs;
  const count = new Int32Array(26);

  const takeSnapshot = (
    currentIndex: number,
    message: string,
    line: number,
    extra?: Partial<GroupAnagramsFrame>
  ) => {
    frames.push({
      strs,
      currentIndex,
      currentStr: strs[currentIndex] || '',
      calculatedKey: extra?.calculatedKey !== undefined ? extra.calculatedKey : null,
      mapState: Array.from(map.entries()).map(([k, group]) => ({ key: k, group: [...group] })),
      countArray: [...count],
      line,
      message,
      ...extra,
    });
  };

  takeSnapshot(-1, ` 在外层开辟一个仅长 26 的连续物理内存 Array，极致复用防 GC。`, 3);

  for (let i = 0; i < strs.length; i++) {
    const s = strs[i];
    takeSnapshot(i, `开始处理第 ${i + 1} 个字符串 "${s}"。`, 5);

    count.fill(0);
    takeSnapshot(i, `将常数级的外层 count 数组全部格式化清零，耗时极短。`, 6);

    for (let j = 0; j < s.length; j++) {
      const charIdx = s.charCodeAt(j) - 97;
      count[charIdx]++;
      takeSnapshot(
        i,
        `扫描到 '${s[j]}'，计算偏移得 ${charIdx}，使对应槽位数字递增为 ${count[charIdx]}`,
        8,
        { countIndexHighlight: charIdx }
      );
    }

    const key = count.join(',');
    takeSnapshot(
      i,
      `以带分隔符的格式序列化为 "${key.length > 20 ? key.substring(0, 20) + '...' : key}" 作为特征 Key (这比排序 O(K logK) 还要快!)`,
      11,
      { calculatedKey: key }
    );

    const group = map.get(key);
    if (group !== undefined) {
      takeSnapshot(i, `该频率指纹存在，将其合并入组。`, 12, { calculatedKey: key });
      group.push(s);
      takeSnapshot(i, `归队成功。`, 13, { calculatedKey: key });
    } else {
      takeSnapshot(i, `该频率计数模板是第一次出现。`, 14, { calculatedKey: key });
      map.set(key, [s]);
      takeSnapshot(i, `已创建全新的频率映射组。`, 15, { calculatedKey: key });
    }
  }

  takeSnapshot(strs.length, `处理完成，返回 Map 聚合的所有 values 列表。`, 17);
  return frames;
}

function generatePrimeMultiplicationFrames(input: GroupAnagramsInput): GroupAnagramsFrame[] {
  const frames: GroupAnagramsFrame[] = [];
  const map = new Map<bigint, string[]>();
  const strs = input.strs;

  const primes = [
    BigInt(2),
    BigInt(3),
    BigInt(5),
    BigInt(7),
    BigInt(11),
    BigInt(13),
    BigInt(17),
    BigInt(19),
    BigInt(23),
    BigInt(29),
    BigInt(31),
    BigInt(37),
    BigInt(41),
    BigInt(43),
    BigInt(47),
    BigInt(53),
    BigInt(59),
    BigInt(61),
    BigInt(67),
    BigInt(71),
    BigInt(73),
    BigInt(79),
    BigInt(83),
    BigInt(89),
    BigInt(97),
    BigInt(101),
  ];

  const takeSnapshot = (
    currentIndex: number,
    message: string,
    line: number,
    extra?: Partial<GroupAnagramsFrame>
  ) => {
    frames.push({
      strs,
      currentIndex,
      currentStr: strs[currentIndex] || '',
      calculatedKey: extra?.calculatedKey !== undefined ? extra.calculatedKey : null,
      mapState: Array.from(map.entries()).map(([k, group]) => ({
        key: k.toString(),
        group: [...group],
      })),
      line,
      message,
      ...extra,
    });
  };

  takeSnapshot(-1, `[数学硬核法则: 素数连乘] 建立 a-z 对应前 26 个质数的静态映射表。`, 2);

  for (let i = 0; i < strs.length; i++) {
    const s = strs[i];
    takeSnapshot(i, `拿到字符串 "${s}"。`, 6);

    let key = BigInt(1);
    takeSnapshot(i, `初始化累乘器 key = 1n (使用 BigInt，防止后续极度膨胀超 2^53 JS 极限垮塌)`, 7, {
      calculatedKey: key.toString(),
    });

    for (let j = 0; j < s.length; j++) {
      const char = s[j];
      const primeFactor = primes[s.charCodeAt(j) - 97];
      const oldKey = key;
      key *= primeFactor;
      takeSnapshot(
        i,
        `由 '${char}' 的 ASCII 对应获得第 ${s.charCodeAt(j) - 97} 个质数：${primeFactor}n。进行乘积累积: ${oldKey}n × ${primeFactor}n = ${key}n`,
        9,
        {
          calculatedKey: key.toString(),
          primeAccumulation: { currentFactor: primeFactor, currentAccumulation: key },
        }
      );
    }

    takeSnapshot(
      i,
      `算术基本定理绝对保证：无序同集字符相乘出的 BigInt 数值 ${key}n，全宇宙唯一绝对不会发生碰撞！`,
      12,
      { calculatedKey: key.toString() }
    );

    const group = map.get(key);
    if (group !== undefined) {
      takeSnapshot(i, `该神仙大数 Key 存在，果断编入现有队伍。`, 13, {
        calculatedKey: key.toString(),
      });
      group.push(s);
      takeSnapshot(i, `合体成功。`, 14, { calculatedKey: key.toString() });
    } else {
      takeSnapshot(i, `独一无二的新大数，首次登录系统。`, 15, { calculatedKey: key.toString() });
      map.set(key, [s]);
      takeSnapshot(i, `已记录进 Map 的大数映射中。`, 16, { calculatedKey: key.toString() });
    }
  }

  takeSnapshot(strs.length, `数学规律完美落幕，所有连乘组的 Values 提取即宣告分组终结。`, 19);
  return frames;
}

export function generateGroupAnagramsFrames(
  input: GroupAnagramsInput,
  mode: AlgorithmMode
): GroupAnagramsFrame[] {
  switch (mode) {
    case AlgorithmMode.SORTING:
      return generateSortingFrames(input);
    case AlgorithmMode.COUNT_HASH:
      return generateCountHashFrames(input);
    case AlgorithmMode.PRIME_MULTIPLICATION:
      return generatePrimeMultiplicationFrames(input);
    default:
      return generateCountHashFrames(input);
  }
}
