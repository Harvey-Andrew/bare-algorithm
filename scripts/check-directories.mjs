import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const problemsDir = path.join(__dirname, '../src/lib/problems');
const rootDir = path.join(__dirname, '..');

const EXCLUDED_DIRS = ['leetcode-hot-100'];

const csvData = [['所属分类', '异常类型', '目标对象 (ID/目录名)', '详细信息']];

function escapeCSV(str) {
  if (str == null) return '';
  const s = String(str);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function checkCategory(category, seenDirs, globalExpected) {
  if (EXCLUDED_DIRS.includes(category)) return;

  const categoryDir = path.join(problemsDir, category);
  if (!fs.existsSync(categoryDir) || !fs.statSync(categoryDir).isDirectory()) return;

  const problemJsonPath = path.join(categoryDir, 'problem.json');
  if (!fs.existsSync(problemJsonPath)) {
    console.warn(`[WARN] 找不到 problem.json 在目录: ${category}`);
    csvData.push([category, 'WARN', '', '找不到 problem.json 文件']);
    return;
  }

  let problemData;
  try {
    problemData = JSON.parse(fs.readFileSync(problemJsonPath, 'utf8'));
  } catch (e) {
    console.error(`[ERROR] 解析 problem.json 失败: ${category}`);
    csvData.push([category, 'ERROR', '', `解析 problem.json 失败: ${e.message}`]);
    return;
  }

  // 获取 problem.json 中定义的所有题目 ID 及其目标分类
  const definedProblems = [];
  if (Array.isArray(problemData)) {
    problemData.forEach((stage) => {
      if (stage.problems && Array.isArray(stage.problems)) {
        stage.problems.forEach((p) => {
          definedProblems.push({ id: p.id, target: p.category || category });
        });
      }
    });
  }

  const actualDirs = new Set();
  const files = fs.readdirSync(categoryDir);
  files.forEach((file) => {
    const filePath = path.join(categoryDir, file);
    if (fs.statSync(filePath).isDirectory()) {
      actualDirs.add(file);
      if (file !== 'leetcode-hot-100' && !file.startsWith('__')) {
        if (!seenDirs.has(file)) {
          seenDirs.set(file, []);
        }
        seenDirs.get(file).push(category);
      }
    }
  });

  let hasError = false;

  // 1. 检查 problem.json 中的原题是否存在对应文件夹
  for (const { id: pid, target } of definedProblems) {
    if (target === category) {
      if (!actualDirs.has(pid)) {
        console.error(
          `[❌ 缺失文件夹] 分类 ${category} -> problem.json 声明了 '${pid}' 但缺少相应文件夹`
        );
        csvData.push([
          category,
          '缺失文件夹',
          pid,
          'problem.json 中已声明，但未找到对应的题目文件夹',
        ]);
        hasError = true;
      }
    } else {
      const targetDir = path.join(problemsDir, target, pid);
      if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) {
        console.error(
          `[❌ 缺失跨分类文件夹] 分类 ${category} -> problem.json 声明了 '${pid}' (位于 ${target}) 但缺少相应文件夹`
        );
        csvData.push([
          category,
          '缺失跨分类文件夹',
          pid,
          `在 ${target} 分类下未找到对应的跨分类题目文件夹`,
        ]);
        hasError = true;
      }
    }
  }

  // 2. 检查实际存在的文件夹是否被任何一个 problem.json 引用到当前分类
  const expectedForThisCategory = globalExpected.get(category) || new Set();
  for (const dir of actualDirs) {
    if (dir === 'leetcode-hot-100' || dir.startsWith('__')) continue;
    if (!expectedForThisCategory.has(dir)) {
      console.error(
        `[⚠️ 多余文件夹] 分类 ${category} -> 存在文件夹 '${dir}' 但所有 problem.json 中均未配置指向该文件夹`
      );
      csvData.push([
        category,
        '多余文件夹',
        dir,
        '存在题目文件夹，但在所有 problem.json 中均未找到指向该文件夹的配置',
      ]);
      hasError = true;
    }
  }

  if (!hasError) {
    console.log(`[✅ 校验通过] 分类 ${category}`);
  }
}

function main() {
  console.log('开始校验问题目录与 problem.json 的一致性 (忽略 leetcode-hot-100)...\n');
  const categories = fs.readdirSync(problemsDir).filter((f) => {
    return fs.statSync(path.join(problemsDir, f)).isDirectory();
  });

  const globalExpected = new Map();
  categories.forEach((c) => {
    if (EXCLUDED_DIRS.includes(c)) return;
    const pJsonPath = path.join(problemsDir, c, 'problem.json');
    if (fs.existsSync(pJsonPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(pJsonPath, 'utf8'));
        if (Array.isArray(data)) {
          data.forEach((stage) => {
            if (stage.problems && Array.isArray(stage.problems)) {
              stage.problems.forEach((p) => {
                const targetCat = p.category || c;
                if (!globalExpected.has(targetCat)) {
                  globalExpected.set(targetCat, new Set());
                }
                globalExpected.get(targetCat).add(p.id);
              });
            }
          });
        }
      } catch {
        // let checkCategory handle parse error
      }
    }
  });

  const seenDirs = new Map();
  categories.forEach((category) => checkCategory(category, seenDirs, globalExpected));

  for (const [dir, cats] of seenDirs.entries()) {
    if (cats.length > 1) {
      console.error(`[❌ 重复文件夹] 文件夹 '${dir}' 在多个分类中出现: ${cats.join(', ')}`);
      csvData.push(['全局', '重复文件夹', dir, `存在于多个分类: ${cats.join(', ')}`]);
    }
  }

  const csvContent = csvData.map((row) => row.map(escapeCSV).join(',')).join('\n');
  const outputPath = path.join(rootDir, 'directory_consistency_report.csv');

  // 加上 BOM 头，防止 Excel 打开中文乱码
  fs.writeFileSync(outputPath, '\uFEFF' + csvContent, 'utf8');

  console.log(`\n校验完成。异常结果已输出至 CSV 文件：${outputPath}`);
}

main();
