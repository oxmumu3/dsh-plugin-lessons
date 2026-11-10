---
标题: 用 connection.fetch.register 开接口：先声明 connection，路径放在 /api/ 下，写明 requestBody
类型: 好做法
分类: 接口与注册
状态: 待复核
宿主版本: 0.2.2-rc.1
最近核对: 2026-11-10
来源: 「发现好插件」内置避坑清单
---

## 什么情况下会遇到

插件后台要给自己的界面提供一个带鉴权的 HTTP 接口。

## 该怎么做

- 在插件的 `inject` 里声明 `connection`。
- 路径放在 `/api/` 下。
- 写上 `methods`。
- 写明 `requestBody`：一般请求用 `'buffered'`，大文件上传用 `'streaming'`。

```js
// 插件的 inject 里要有 'connection'
ctx.connection.fetch.register({
  path: '/api/my-plugin/items',
  methods: ['GET'],
  requestBody: 'buffered',
  fetch: request => Response.json({ok: true}),
});
```

## 证据

- 宿主代码：0.2.2-rc.1 里宿主自己注册的几条路由都是这个形状：`inject` 里有 `connection`，`path` 在 `/api/` 下，带 `methods` 和 `requestBody`（见到 `'buffered'` 和 `'streaming'` 两种取值）。
- 经验做法：「发现好插件」内置清单。

## 还没核对的

两点。一是内置清单原话里还有一句「不要包在 `ctx.effect()` 里」，但 0.2.2-rc.1 宿主自己的代码有三处正是包在 `ctx.effect(() => ctx.connection.fetch.register(...))` 里注册的；这句话当初为什么写没有留下记录，所以没收进做法；社区头部插件注册路由时也都包在 `ctx.effect` 里（见 register-inside-effect）。二是路径不放在 `/api/` 下、或者不写 `requestBody` 分别会怎样，没找到宿主对应的校验，也没实测，只知道照上面写是宿主自己在用的写法。
