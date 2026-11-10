---
标题: 工具的可选参数直接不写 required，写 required: false 会注册失败
类型: 踩过的坑
分类: 工具与提示词
状态: 有效
宿主版本: 0.2.2-rc.1
最近核对: 2026-11-10
来源: 「发现好插件」内置避坑清单
---

## 什么情况下会遇到

用 `defineTool` 给插件注册工具，想标明某个参数是可选的，顺手写了 `required: false`。

## 该怎么做

必填的参数写 `required: true`，可选的参数不写这个字段。

```js
parameters: {
  text: {type: 'string', required: true, description: '必填'},
  note: {type: 'string', description: '可选：不写 required'},
}
```

## 证据

- 报错原文：`harness.defineTool <参数路径>.required must be true when present`
- 宿主代码：0.2.2-rc.1 规范化工具参数时，属性上只要出现 `required` 而值不是 `true`，就抛上面这个错。
