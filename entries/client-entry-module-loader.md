---
标题: 客户端入口要包在 window.__ModuleLoader__.load 里，直接写 ESM 的 export 会连累其他插件
分类: 客户端加载
状态: 有效
宿主版本: 0.2.2-rc.1
最近核对: 2026-11-10
来源: 「发现好插件」作者的创造经验记录
---

## 什么情况下会遇到

给插件写客户端部分（`package.json` 里 `./client` 指向的那个文件），按写普通模块的习惯直接写 `export const inject = ...`、`export function apply() {}`。

## 该怎么做

客户端文件是当普通浏览器脚本加载的，不是 ES 模块。整个文件就是一次注册调用：

```js
window.__ModuleLoader__.load({
  id: '@your-scope/your-plugin', // 和 package.json 的 name 完全一样，scope 不能省
  factory(require) {
    const React = require('react');
    // ...
    return {
      inject: ['slots'],
      apply(ctx) { /* 在这里注册 */ },
    };
  },
});
```

工厂函数直接返回插件对象，或者用 `module.exports` 交付，两种都有人在用。

用了打包工具的话，检查的是最终产物是不是这个形状，不是源码。按 ES 模块方式跑 `node --check` 抓不到这个问题。

## 证据

- 官方说明：0.2.2-rc.1 内置的创造说明写明，客户端产物注册一个惰性工厂，id 等于包名；自带模板 `templates/decoration/client.js` 就是上面这个形状。
- 宿主代码：0.2.2-rc.1 自带的客户端包（例如 `@deepseek-ai/dsh-api-gateway`）也是 `window.__ModuleLoader__.load({id, factory: (require) => {...}})`。
- 本人实测：「发现好插件」作者 2026-11-10 把客户端写成 ESM 的 `export`，脚本语法失败（控制台是 `Unexpected token 'export'` 这类报错），同一批加载的其他插件客户端跟着失败，宿主启动失败并弹出禁用第三方插件的恢复框。一个插件写错，所有插件一起倒。
- 公开仓库：社区插件 dsh-media-desk 2.6.2 的构建脚本开头就注明，要把客户端打包成宿主的惰性 CommonJS 模块。
