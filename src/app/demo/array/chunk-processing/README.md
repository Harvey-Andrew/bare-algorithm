# 大数据分块处理 Demo

## 业务场景

大文件上传、Excel 导入、批量数据处理 - 分块处理避免主线程阻塞

## 核心技术

- Generator 函数实现分块迭代
- requestAnimationFrame 时间切片
- 进度回调实现可视化

## 算法复杂度

- 时间: O(n) 遍历所有数据
- 空间: O(chunkSize) 每次只处理一块

## 进阶挑战

- [ ] Web Worker 多线程处理
- [ ] 断点续传支持
- [ ] 错误重试机制
