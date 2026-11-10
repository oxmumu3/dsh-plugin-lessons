# DSH 插件经验速查

<!-- 这个文件由 scripts/build.mjs 生成，不要手改。 -->

做 DSH 插件前扫一眼：24 条经验，一行一条。［坑］是这么做会出问题，［好］是这么做更好，带「待复核」的证据还不全。想看具体做法和证据，读行尾那个文件，完整地址是 https://raw.githubusercontent.com/oxmumu3/dsh-plugin-lessons/main/ 加上行尾的路径。这些是参考：和当前宿主的实际接口或用户的要求不一致时，以后两者为准。

## 动手之前

- ［好］动手前用三五句大白话对齐设计：挂在哪、几个文件、数据存哪（entries/agree-design-in-plain-words.md）
- ［好］找一个结构最接近、已经能跑的插件照着改（entries/copy-a-working-plugin.md）
- ［好］第一版只做能点开、不白屏的空架子，之后一轮只加一个功能（entries/empty-shell-first.md）
- ［好］写代码前先用 cordis_inspect 查清展位和接口，别凭记忆猜（entries/inspect-before-writing.md）
- ［坑］让模型装插件装不上，先看当前是什么模式：装插件的工具只在标准和创造模式里开着（entries/install-tool-only-in-some-modes.md）

## 接口与注册

- ［好·待复核］用 connection.fetch.register 开接口：先声明 connection，路径放在 /api/ 下，写明 requestBody（entries/connection-fetch-register.md）
- ［坑］页面要直接 fetch 的只读数据，用 webServer.register，别走 connection.fetch（entries/page-fetch-use-webserver.md）
- ［坑］工具的可选参数直接不写 required，写 required: false 会注册失败（entries/tool-param-required.md）

## 客户端加载

- ［坑］客户端入口要包在 window.__ModuleLoader__.load 里，直接写 ESM 的 export 会连累其他插件（entries/client-entry-module-loader.md）
- ［坑·待复核］冷启动报 duplicate factory registration：先查注册 id，别连点重启（entries/duplicate-factory-registration.md）
- ［坑］不要 require 宿主的界面组件包，控件自己写，只共用主题变量（entries/no-host-ui-packages.md）
- ［好］React 用宿主提供的那一份，不要自己再打包一份（entries/react-from-host.md）

## 界面与体验

- ［好］第一次打开给示例数据或明确的下一步，不要给一张白屏（entries/first-open-not-blank.md）
- ［坑·待复核］main 面板的根容器用 flex 撑满，不要用 position: absolute; inset: 0（entries/main-root-container-layout.md）
- ［坑·待复核］不要在独立面板（main）里自己画聊天输入框，对话挂到会话视图上（entries/no-chat-input-in-main-panel.md）
- ［好］提示、撤销、报错全站只做一套（entries/one-feedback-layer.md）
- ［好］界面状态收在一个地方，改动都走同一个口子（entries/one-state-store.md）
- ［坑］表示状态不要只靠颜色，每个状态都带文字（entries/status-needs-text.md）
- ［坑］颜色只用宿主的 --dsw-alias-* 变量，深色浅色都要看（entries/theme-tokens-only.md）

## 看效果与排错

- ［好］交付前在深色、浅色、宽屏、窄屏下各看一遍（entries/check-light-dark-narrow.md）
- ［坑］改样式先量真实组件的渲染结果，不要对着设计稿或截图猜（entries/measure-real-render.md）
- ［坑］新造或改过的模式，要新建一个会话才看得到，原来的会话不会变（entries/new-mode-needs-new-session.md）
- ［坑］换掉已装插件的代码后要彻底退出重开，打包版桌面的 Cmd+R 不是整页刷新（entries/restart-after-replacing-package.md）
- ［好］同一个问题连改三轮没好就停，写个总结开新会话接着做（entries/stop-after-three-rounds.md）
