---
标题: webServer 上的路由宿主不替你鉴权，每个请求自己过一遍 connection.requestRejection
类型: 踩过的坑
分类: 接口与注册
状态: 有效
宿主版本: 0.2.2-rc.1
最近核对: 2026-11-10
来源: 社区插件拆解（2026-11-10）
---

## 什么情况下会遇到

用 `webServer.register` 给插件开了一组 HTTP 路由，以为和 `connection.fetch` 一样自带登录检查。其实没有：同一台机器上别的网页也可能请求到它。

## 该怎么做

在 `inject` 里同时声明 `webServer` 和 `connection`。每个请求进来先问一句鉴权服务，被拒就直接返回：

```js
function requestRejection(ctx, req) {
  const connection = ctx.get('connection');
  if (typeof connection?.requestRejection !== 'function') return 403; // 拿不到鉴权服务，一律拒绝
  return connection.requestRejection({headers: req.headers});        // 通过时返回 undefined
}
```

只有完全不敏感的只读内容，才可以不做这一步。

## 证据

- 公开仓库：dsh-media-desk 2.6.2 的 `src/host.js`。代码注释写明 Web 服务不会替插件路由鉴权，所以每个请求都自己走一遍 Host/Origin 和登录凭证检查，拿不到鉴权服务时一律拒绝；处理函数第一步就是调它。
- 公开仓库：DSH-better-sidebar 0.30.1 的 `src/index.ts` 用同一个办法给自己的路由设了一道门：`ctx.connection.requestRejection(req) === undefined` 才放行。

## 备注

相关条目：page-fetch-use-webserver。
