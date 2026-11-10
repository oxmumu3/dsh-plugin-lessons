---
标题: 所有注册都放进 ctx.effect 并起个名字，插件停用或热更新时才清得干净
类型: 好做法
分类: 接口与注册
状态: 有效
宿主版本: 0.2.2-rc.1
最近核对: 2026-11-10
来源: 社区插件拆解（2026-11-10）
---

## 什么情况下会遇到

在 `apply` 里直接注册路由、展位、词典、定时器、监听。插件被停用、卸载或热更新之后，旧的注册还留着，再启用就撞上「已经注册过」，或者旧代码还在响应。

## 该怎么做

每一处注册都包进 `ctx.effect`，把注册返回的清理函数交回去，并在第二个参数里写个带插件名的标签，出问题时日志里认得出是谁的：

```js
ctx.effect(() => ctx.webServer.register({kind: 'prefix', path: '/my-plugin', handler}), 'my-plugin: routes');
```

自己开的定时器、监听、临时文件，也在 effect 的清理函数里收掉。

## 证据

- 公开仓库：dsh-media-desk 2.6.2 的 `src/host.js` 和 `client/index.jsx`，路由和侧栏入口都包在带标签的 `ctx.effect` 里，清理函数里取消订阅并释放注册。
- 公开仓库：DSH-better-sidebar 0.30.1 的 `src/client/index.tsx`，注册词典时把两个取消函数一起从 effect 里返回，标签是插件名加用途。
- 官方说明：0.2.2-rc.1 内置的插件开发说明把「注册是属于某个上下文的 effect」列为基本原则，并要求在 `apply` 里用 `ctx.effect` 注册资源并返回清理函数。
- 宿主代码：0.2.2-rc.1 宿主自己注册路由时也是 `ctx.effect(() => ctx.connection.fetch.register(...), '标签')`。
