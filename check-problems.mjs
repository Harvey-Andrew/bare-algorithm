/**
 * 检查 leetcode-hot-100/problem.json 中的题目文件夹存在情况
 *
 * 逻辑：
 * 1. 读取 problem.json，遍历每个题目
 * 2. 检查题目 id 对应的文件夹是否存在于其 category 分类目录下
 * 3. 如果不在对应 category 下，遍历所有分类文件夹查找是否存在于其他分类中
 * 4. 输出三类结果：
 *    - ✅ 在对应 category 下存在
 *    - ⚠️ 不在对应 category 下，但在其他分类下找到
 *    - ❌ 在所有分类下都不存在
 */

import fs from 'fs';
import path from 'path';

const PROBLEMS_DIR = path.resolve('src/lib/problems');
const PROBLEM_JSON = path.join(PROBLEMS_DIR, 'leetcode-hot-100', 'problem.json');

function checkProblems() {
  // 1. 读取 problem.json
  const problems = JSON.parse(fs.readFileSync(PROBLEM_JSON, 'utf-8'));

  // 2. 获取所有分类文件夹（排除非分类项）
  const excludes = new Set([
    'leetcode-hot-100',
    'categories.json',
    'index.ts',
    'problem-data.ts',
    'problem-loaders.generated.ts',
    'problem-server.ts',
    'search-data.json',
  ]);
  const allCategories = fs.readdirSync(PROBLEMS_DIR).filter((name) => {
    if (excludes.has(name)) return false;
    return fs.statSync(path.join(PROBLEMS_DIR, name)).isDirectory();
  });

  // 3. 为每个分类获取其下所有子文件夹名
  const categoryFolders = {};
  for (const cat of allCategories) {
    const catPath = path.join(PROBLEMS_DIR, cat);
    categoryFolders[cat] = new Set(
      fs.readdirSync(catPath).filter((name) => fs.statSync(path.join(catPath, name)).isDirectory())
    );
  }

  // 4. 分类检查结果
  const inCategory = []; // ✅ 在对应 category 文件夹中
  const inOtherCategory = []; // ⚠️ 在其他分类文件夹中
  const notFound = []; // ❌ 完全不存在

  for (const problem of problems) {
    const { id, title, category } = problem;

    // 检查是否在对应 category 下
    if (categoryFolders[category]?.has(id)) {
      inCategory.push({ id, title, category });
      continue;
    }

    // 不在对应 category 下，搜索所有分类
    const foundIn = [];
    for (const cat of allCategories) {
      if (categoryFolders[cat].has(id)) {
        foundIn.push(cat);
      }
    }

    if (foundIn.length > 0) {
      inOtherCategory.push({ id, title, expectedCategory: category, foundIn });
    } else {
      notFound.push({ id, title, expectedCategory: category });
    }
  }

  // 5. 输出结果
  console.log('='.repeat(80));
  console.log(`LeetCode Hot 100 题目文件夹检查报告`);
  console.log(`总题目数: ${problems.length}`);
  console.log('='.repeat(80));

  console.log(`\n✅ 在对应 category 下存在的题目 (${inCategory.length} 个):`);
  console.log('-'.repeat(60));
  for (const p of inCategory) {
    console.log(`  ${p.title}  →  ${p.category}/${p.id}`);
  }

  console.log(`\n⚠️  不在对应 category 下，但在其他分类找到 (${inOtherCategory.length} 个):`);
  console.log('-'.repeat(60));
  for (const p of inOtherCategory) {
    console.log(`  ${p.title}`);
    console.log(`    期望分类: ${p.expectedCategory}/${p.id}`);
    console.log(`    实际位于: ${p.foundIn.map((c) => c + '/' + p.id).join(', ')}`);
  }

  console.log(`\n❌ 在所有分类下都不存在的题目 (${notFound.length} 个):`);
  console.log('-'.repeat(60));
  for (const p of notFound) {
    console.log(`  ${p.title}  (期望分类: ${p.expectedCategory})`);
  }

  console.log('\n' + '='.repeat(80));
  console.log('汇总:');
  console.log(`  ✅ 正确位置: ${inCategory.length}`);
  console.log(`  ⚠️  错误位置: ${inOtherCategory.length}`);
  console.log(`  ❌ 完全缺失: ${notFound.length}`);
  console.log('='.repeat(80));
}

checkProblems();
