# Project Instructions

- 当使用 **gpt-6-astra** 时，尽可能不要运行测试（`test` / `npm test` / `pnpm test` / `yarn test` 等）。
- 除非用户明确要求验证或发生高风险修改，否则优先通过最少命令完成改动。
- 日常本地源码或样式修改不需要重新构建 `main.js`；仅在准备 commit 前运行构建，以同步需要提交的发布产物。
