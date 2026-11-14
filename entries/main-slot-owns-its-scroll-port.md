---
标题: 挂到 main 展位的面板要自己当滚动口，宿主那一格不滚
类型: 踩过的坑
分类: 界面与体验
状态: 有效
宿主版本: 0.2.2-rc.2
最近核对: 2026-11-14
来源: 牛村木木山做 dsh-superagent 主面板时
---

## 什么情况下会遇到

面板挂进 `main` 展位，内容比一屏长。写的时候只给了根节点 `min-height:100%`，看起来"页面会滚"，实际用户滚不动：滚轮没反应，`scrollIntoView` 也不动，连"滑到哪亮哪个页签"的 scroll-spy 都永远不触发。

## 该怎么做

面板根节点自己撑出滚动口，并把它当唯一滚动目标：

```css
.sa2 { height:100%; min-height:0; overflow-y:auto; overflow-x:hidden; overscroll-behavior:contain }
```

- 滚动监听绑在根节点上（`root.addEventListener('scroll', ...)`），不要只绑 `window`。
- 跳转用 `root.scrollTo({ top: el.offsetTop - 64 })`，不要用 `el.scrollIntoView()`。
- 测量"滑到第几组"时，把根节点的 `getBoundingClientRect().top` 当基准，不要写死视口 8px。

## 证据

- 本人实测：2026-11-14，官方 0.2.2-rc.2 桌面，面板 `.sa2` 的 `clientHeight 800 / scrollHeight 1840 / overflow-y visible`，外层 `mainPanel` 的 `clientHeight 800 / scrollHeight 1840` 也不滚。整条链路没有滚动容器，内容被裁掉。
- 本人实测：同一次改动把根节点改成滚动口后，滚轮 `scrollTop 0 → 700 → 1058`，页签随滚动点亮，点页签跳到底部。
