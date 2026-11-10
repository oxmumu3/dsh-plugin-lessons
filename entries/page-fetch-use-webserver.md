---
标题: 页面要直接 fetch 的只读数据，用 webServer.register，别走 connection.fetch
分类: 接口与注册
状态: 有效
宿主版本: 0.2.2-rc.1
最近核对: 2026-11-10
来源: 「发现好插件」作者的创造经验记录
---

## 什么情况下会遇到

想让插件界面在页面里直接 `fetch()` 读一点数据，于是用 `connection.fetch.register` 注册了一条 `/api/...` 路由。页面一请求，返回 401。

## 该怎么做

`/api/` 下的路由在连接鉴权后面，页面里裸 `fetch` 不带凭据，会被拦住。页面要直接读的数据，改用 `webServer.register` 注册到一个不在 `/api` 下的路径：

```js
ctx.webServer.register({
  kind: 'exact',
  path: '/my-plugin/state',
  handler(req, res) { /* 写响应 */ },
});
```

注意反过来的一面：这条路由页面不带凭据就能读到，所以只放不敏感的只读内容。写操作、带个人信息的数据仍然走 `connection.fetch`，让鉴权替你把门。

## 证据

- 本人实测：「发现好插件」作者 2026-11-10 做一个用量浮窗插件时，用 `connection.fetch.register` 注册的 `/api/*` 路由在页面里 fetch 返回 401；同一份数据改用 `webServer.register({kind: 'exact', ...})` 注册到非 `/api` 路径后，页面可以直接读到。
- 宿主代码：0.2.2-rc.1 里 `/api` 这条总路由由连接服务注册并做准入检查，代码注释把 `connection.fetch` 的路由称为在连接的鉴权围栏之内；宿主自己也用 `webServer.register({kind: 'exact', path, handler(req, res)})` 这个写法注册路径。

## 备注

用之前用 `cordis_inspect_query` 查一下 `webServer` 服务在你这个版本上的签名。
