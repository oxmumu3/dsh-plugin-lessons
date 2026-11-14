---
标题: 在创造模式之外写插件时，直接只读宿主安装包里的 api-catalog 和 slots 定义，不用盲猜接口
类型: 好做法
分类: 动手之前
状态: 有效
宿主版本: 0.2.2-rc.3
最近核对: 2026-11-14
来源: 牛村木木山拆解桌面版安装包与外部开发工作流时
---

## 什么情况下会遇到

用外部编辑器或外部智能体写 DSH 插件时，手头没有创造模式里的 `cordis_inspect` 工具。遇到宿主刚升级（比如新增客户端展位或服务签名调整），容易以为外部拿不到最新契约，只能盲写，或者每写一步都切回创造模式问一次。

## 该怎么做

桌面版宿主安装包自带的 `app.asar` 里直接装着完整的明文静态契约，只读解析文件头索引即可按路径读取，不需要解包或改动宿主文件：

- **服务端接口、事件、配置与主题目录**：`dsh-tool-cordis/src/api-catalog.ts`
- **全部客户端展位名与传入 props 类型**：各个 `dsh-client-ui-*/src/client/contract/slots.ts` 及同目录下的 `README.zh.md`

静态接口和展位定义直接在安装包里核对；只有需要确认「当前正在运行的宿主进程里实际挂载了哪些实例、启用了哪些工具或动态注册项」时，再回创造模式调 `cordis_inspect`。

## 证据

- 宿主代码：0.2.2-rc.3 桌面版安装包的 `app.asar` 内含未压缩混淆的 `dsh-tool-cordis/src/api-catalog.ts`（约 792KB），以及 20 个 `dsh-client-ui-*` 包下的 `src/client/contract/slots.ts` 与 `README.zh.md`，包含该版本新增的 `sidebar.session.action`、`workspace.picker`、`workspace.picker.directoryFlow` 三个展位定义。
- 宿主代码：同版本 `cordis_inspect` 工具内置的接口与说明查询，底层读取的正是同一份 `api-catalog`，只有实时挂载树来自运行中宿主进程内存。

## 备注

相关条目：inspect-before-writing（在创造模式内开发时的查询方式）。
