---
标题: 插件可能被别的合集一起带上时，防一手重复挂载
类型: 踩过的坑
分类: 发版与兼容
状态: 有效
宿主版本: 0.2.2-rc.1
最近核对: 2026-11-10
来源: 社区插件拆解（2026-11-10）
---

## 什么情况下会遇到

你的插件比较受欢迎，被别人做的「全家桶」合集收了进去。用户既装了合集、又单独装了你的插件，同一个包被挂载两次：同一组路由注册两遍，启动时报 `duplicate prefix route`，整棵插件树都起不来。

## 该怎么做

在自己的 `cordis.patch.yml` 里，给插入的那一行加一个 `disabled` 表达式：如果已经有另一行启用着、挂的是同一个包，自己这一行就退让。

```yaml
- insert:
    - id: my-plugin
      name: 'my-plugin'
      disabled: !!js "[...ctx.loader.entries()].some((e) => e.options.name === 'my-plugin' && e.options.id !== 'my-plugin' && !e.disabled)"
```

它只看得见排在自己前面的行，所以合集要排在前面才有效。这是已知的局限。

## 证据

- 公开仓库：DSH-better-sidebar 0.30.1 的 `cordis.patch.yml`。文件里的注释写明了场景（合集已经用自己的 id 挂载了这个包）、后果（两次挂载重复注册路由，启动时整棵插件树失败，报 duplicate prefix route）、做法和局限；它的 CI 里有一条专门测这种情况的流程。

## 备注

宿主版本取的是这个插件版本声明支持的 0.2.2-rc.1；没有在宿主里单独复现。用之前用 `cordis_inspect_query` 确认 `ctx.loader.entries()` 在你的版本上可用。
