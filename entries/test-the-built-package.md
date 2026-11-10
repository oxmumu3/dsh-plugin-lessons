---
标题: 发版前检查打包出来的东西本身，再把安装包挂进目标版本的宿主跑一遍
类型: 好做法
分类: 发版与兼容
状态: 有效
宿主版本: 0.2.2-rc.1
最近核对: 2026-11-10
来源: 社区插件拆解（2026-11-10）
---

## 什么情况下会遇到

单元测试全过，发出去的包却装不上：客户端注册的 id 和包名对不上，或者某个文件没打进包里，或者在新版宿主上一启动就崩。这些都发生在「源码之后」，只测源码测不到。

## 该怎么做

- 对构建产物写测试：客户端产物里注册的 id 等于 `package.json` 的包名；清单里的版本和包版本一致；入口文件和每个分块都存在，并且都在 `files` 清单里；客户端产物只 `require` 一份允许名单里的模块。
- 发版流程里加一步：安装你要支持的那个宿主版本，把打好的安装包真的挂进去，无界面启动，把各个页面点一遍。
- 这一步里固定宿主版本号，不要用「最新」。

## 证据

- 公开仓库：DSH-better-sidebar 0.30.1 的 `tests/manifest-consistency.spec.ts`，测试名就写着这些检查：版本与 package.json 一致、入口文件在构建产物里存在、官方包注册的是包名。
- 公开仓库：同一仓库的 `.github/workflows/ci.yml`，流程里先 `npm install -g @deepseek-ai/dsh@0.2.2-rc.1`，再 `pnpm build && pnpm pack`，然后跑挂载测试。
- 公开仓库：dshmarket 1.73.17 的 `scripts/preflight.mjs`，打包前检查 `cordis.patch.yml` 是按包名插入的，以及客户端文件是以 `window.__ModuleLoader__.load({ id: "包名"` 开头的。
- 公开仓库：dsh-agent-teams 0.1.29 的 `scripts/verify-package.mjs`，其中一项检查是 `cordis.patch.yml` 里的 name 等于发布的包名。

## 备注

相关条目：client-entry-module-loader（注册 id 不等于包名的后果）。
