---
标题: @deepseek-ai/* 的包不要放进 dependencies，它们由宿主提供
类型: 踩过的坑
分类: 发版与兼容
状态: 有效
宿主版本: 0.2.2-rc.1
最近核对: 2026-11-10
来源: 社区插件拆解（2026-11-10）
---

## 什么情况下会遇到

插件代码里 import 了宿主的框架包，顺手 `npm install` 进了 `dependencies`（或者 `optionalDependencies`）。安装插件时，profile 里就多出一份真实的框架拷贝。

## 该怎么做

- `@deepseek-ai/*` 的包只放在 `peerDependencies`（并在 `devDependencies` 里留一份同样范围的，供本地类型检查）。
- `dependencies` 和 `optionalDependencies` 里都不要有。放在 optional 里也不行，装得上的时候它照样会落一份拷贝。

多出来的那份拷贝会盖住宿主自己的那份，同一个模块变成两个身份，表现出来是一些很难看懂的运行时崩溃。

## 证据

- 公开仓库：dsh-TUI 0.19.0 的 `scripts/verify-manifest-deps.ts`。脚本开头的注释写明：框架包由宿主提供，绝不能作为运行时依赖发布，profile 里的真实拷贝会遮住宿主实例并分裂模块身份，并点名了它造成过的一次崩溃。脚本在构建时检查这几条，不满足就失败。

## 备注

宿主版本取的是这个插件版本声明支持的 0.2.2-rc.1；没有在宿主里单独复现。这条和 react-from-host 是同一个道理：宿主有的，就用宿主的。
