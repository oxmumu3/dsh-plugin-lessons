---
标题: 主面板响应式布局用 @container 量自身宽度，用 @media 量窗口宽度会在宿主左右分屏时挤坏
类型: 踩过的坑
分类: 界面与体验
状态: 有效
宿主版本: 0.2.2-rc.3
最近核对: 2026-11-14
来源: 牛村木木山做 dsh-superagent 主面板分屏适配时
---

## 什么情况下会遇到

挂在 `main` 展位的插件面板写了 `@media (max-width: 720px)` 做窄屏折行。单独把整个桌面窗口拉窄时看着正常，但用户在宽屏显示器上开启宿主左右分屏（左边看对话、右边开插件面板）时，多列卡片、筛选条或横向表单没有折行，输入框甚至被挤成一条细缝。

## 该怎么做

宿主开启左右分屏时，整个窗口宽度仍然是 1440px 甚至更宽，`@media` 根本不会触发，而插件所在的 `main` 展位实际只有 640px–700px 左右宽。

把插件根容器声明为尺寸查询容器，内部多列网格和工具栏统一改用 `@container` 按面板自身可用宽度折行：

```css
.my-plugin-root {
  container-type: inline-size;
}

@container (max-width: 760px) {
  .my-plugin-grid {
    grid-template-columns: 1fr;
  }
}
```

交付前除了看 1440px 全宽和 390px 窄窗口，还要专门看一眼 680px 左右的分屏宽度。

## 证据

- 本人实测：2026-11-14，在 1440px 窗口、680px 分屏宽度与 390px 窄屏下对照实测插件主面板，依赖窗口级断点的横向打回表单在分屏下将文本域挤压至 28px 宽；根容器加 `container-type: inline-size` 并改用 `@container` 后，三种宽度下均正常折行。
- 宿主代码：0.2.2-rc.3 桌面端支持主工作区多栏并列布局，单个 `main` 展位的实际渲染宽度独立于浏览器窗口总宽度。

## 备注

相关条目：check-light-dark-narrow（多尺寸双主题检查）、component-padding-loses-to-button-reset（根容器重置选择器的优先级问题；也可以在根重置上用 `:where(.my-plugin-root) button` 保持零特异性，避免吞掉组件类的内边距）。
