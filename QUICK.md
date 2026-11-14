# DSH 插件经验速查

<!-- 这个文件由 scripts/build.mjs 生成，不要手改。 -->

做 DSH 插件前扫一眼：61 条经验，一行一条。［坑］是这么做会出问题，［好］是这么做更好，带「待复核」的证据还不全。想看具体做法和证据，读行尾那个文件，完整地址是 https://raw.githubusercontent.com/oxmumu3/dsh-plugin-lessons/main/ 加上行尾的路径。这些是参考：和当前宿主的实际接口或用户的要求不一致时，以后两者为准。

## 动手之前

- ［好］动手前用三五句大白话对齐设计：挂在哪、几个文件、数据存哪（entries/agree-design-in-plain-words.md）
- ［好］找一个结构最接近、已经能跑的插件照着改（entries/copy-a-working-plugin.md）
- ［好］第一版只做能点开、不白屏的空架子，之后一轮只加一个功能（entries/empty-shell-first.md）
- ［好］写代码前先用 cordis_inspect 查清展位和接口，别凭记忆猜（entries/inspect-before-writing.md）
- ［坑］让模型装插件装不上，先看当前是什么模式：装插件的工具只在标准和创造模式里开着（entries/install-tool-only-in-some-modes.md）

## 接口与注册

- ［坑·待复核］插件自带 undici 时，别让它占了全局 dispatcher，宿主的模型请求会跟着坏（entries/bundled-undici-global-dispatcher.md）
- ［好·待复核］用 connection.fetch.register 开接口：先声明 connection，路径放在 /api/ 下，写明 requestBody（entries/connection-fetch-register.md）
- ［好］接口按路径读本地文件时，把路径关在目录里：挡住 ..、点文件和指到外面的符号链接（entries/contain-file-paths.md）
- ［坑］inject 只等服务出现，不等别的插件往里注册的东西；这类检查放到第一次用的时候（entries/inject-does-not-wait-for-providers.md）
- ［好］插件要联网：超时分两段设，再给国内用户留镜像和手动覆盖的口子（entries/network-timeouts-and-mirrors.md）
- ［坑］不要往会话记录里追加自己发明的事件类型，会话会打不开（entries/no-new-session-event-types.md）
- ［好］用到的可选服务都写进 inject，缺了它插件就安静地不启动，而不是报错（entries/optional-services-in-inject.md）
- ［坑］页面要直接 fetch 的只读数据，用 webServer.register，别走 connection.fetch（entries/page-fetch-use-webserver.md）
- ［好］所有注册都放进 ctx.effect 并起个名字，插件停用或热更新时才清得干净（entries/register-inside-effect.md）
- ［好］插件自己的写接口要拒绝跨站请求（entries/reject-cross-site-writes.md）
- ［坑］写可实时修改的 Config，Schemastery 要用宿主那份（@deepseek-ai/schemastery）（entries/schemastery-from-host.md）
- ［坑］Schemastery 里可选的嵌套对象要显式写成「对象或没有」，光写 z.object() 会被补成空对象再校验失败（entries/schemastery-optional-nested-object.md）
- ［好］密钥只留在后台：文件权限收紧，发给界面的只有「有没有」和末四位（entries/secrets-stay-on-host.md）
- ［好］自己存 JSON 状态文件：先写临时文件再改名，并且按两个宿主进程同时在跑来设计（entries/state-file-two-hosts.md）
- ［好］想让用户能调的值放进插件的 Config，不要写死在代码里（entries/tunable-values-in-config.md）
- ［坑］webServer 上的路由宿主不替你鉴权，每个请求自己过一遍 connection.requestRejection（entries/webserver-routes-authenticate-yourself.md）

## 工具与提示词

- ［好］会自己派子代理、自己返工的插件，要有硬上限，到了就交给人（entries/bound-delegation-and-auto-repair.md）
- ［好］给每次请求都要带的提示词和工具说明定一个字节预算，用测试守住（entries/byte-budget-test-for-resident-prompt.md）
- ［好］工具可能返回很长的内容时设一个上限，并在截断处写明怎么拿到剩下的（entries/cap-tool-output-with-recovery-hint.md）
- ［好］界面上的按钮和给模型的工具，背后走同一个实现（entries/one-operation-two-callers.md）
- ［坑］在「会话创建」时给每个会话做准备，要同步做完；await 一下就会输给第一条请求（entries/per-agent-setup-must-be-synchronous.md）
- ［好］往系统提示词里加说明：文字固定，只在用得上的会话里出现，其余返回空（entries/prompt-section-fixed-and-conditional.md）
- ［坑］定时器到点要让模型动起来，用 agent.followup()；agent.inject() 不会唤醒它（entries/timer-use-followup.md）
- ［好］工具失败时告诉模型两件事：副作用发生了没有，能不能重试（entries/tool-errors-say-effects-and-retry.md）
- ［坑］工具的可选参数直接不写 required，写 required: false 会注册失败（entries/tool-param-required.md）
- ［好］挂在请求流水线上的监听：先等 next()，在别人的结果上追加，别整个替换（entries/waterfall-append-not-replace.md）

## 客户端加载

- ［坑］客户端入口要包在 window.__ModuleLoader__.load 里，直接写 ESM 的 export 会连累其他插件（entries/client-entry-module-loader.md）
- ［坑·待复核］冷启动报 duplicate factory registration：先查注册 id，别连点重启（entries/duplicate-factory-registration.md）
- ［坑］不要 require 宿主的界面组件包，控件自己写，只共用主题变量（entries/no-host-ui-packages.md）
- ［好］React 用宿主提供的那一份，不要自己再打包一份（entries/react-from-host.md）

## 界面与体验

- ［坑］按钮类组件的内边距会被 `.x button{padding:0}` 这类 reset 吃掉，选择器要写两级（entries/component-padding-loses-to-button-reset.md）
- ［好］第一次打开给示例数据或明确的下一步，不要给一张白屏（entries/first-open-not-blank.md）
- ［好］做双语：语言跟宿主走，再用一个测试保证两份词典的 key 一样（entries/follow-host-language-and-test-keys.md）
- ［好］同一个列表里每行必须同构，会变长的内容收进详情（entries/list-rows-must-stay-uniform.md）
- ［坑·待复核］main 面板的根容器用 flex 撑满，不要用 position: absolute; inset: 0（entries/main-root-container-layout.md）
- ［坑］挂到 main 展位的面板要自己当滚动口，宿主那一格不滚（entries/main-slot-owns-its-scroll-port.md）
- ［坑·待复核］不要在独立面板（main）里自己画聊天输入框，对话挂到会话视图上（entries/no-chat-input-in-main-panel.md）
- ［坑］插件页面用 React 组件挂进展位，不要让后台出一个 HTML 再用 iframe 嵌进来（entries/no-iframe-pages.md）
- ［好］提示、撤销、报错全站只做一套（entries/one-feedback-layer.md）
- ［好］界面状态收在一个地方，改动都走同一个口子（entries/one-state-store.md）
- ［坑］表示状态不要只靠颜色，每个状态都带文字（entries/status-needs-text.md）
- ［坑］颜色只用宿主的 --dsw-alias-* 变量，深色浅色都要看（entries/theme-tokens-only.md）

## 发版与兼容

- ［好］做给别的插件用的底座：服务里带上版本号和功能名列表，使用方按功能名判断（entries/base-plugin-service-with-features.md）
- ［坑］写清楚支持哪些宿主版本：engines.dsh 和 @deepseek-ai/dsh-* 的 peer 范围，宿主启动时都会查（entries/declare-supported-host-versions.md）
- ［坑］插件可能被别的合集一起带上时，防一手重复挂载（entries/guard-against-double-mount.md）
- ［坑］@deepseek-ai/* 的包不要放进 dependencies，它们由宿主提供（entries/no-framework-packages-in-dependencies.md）
- ［坑］不要从宿主包里 import 具名的辅助函数，用服务本身，并在运行时看方法在不在（entries/no-named-imports-of-host-helpers.md）
- ［坑］发版后让用户装带确切版本号的包：桌面版 24 小时内装包名或 latest 拿到的是上一版（entries/tell-users-the-exact-version.md）
- ［好］发版前检查打包出来的东西本身，再把安装包挂进目标版本的宿主跑一遍（entries/test-the-built-package.md）
- ［好］不同宿主版本之间的差异，收在一个地方，按「有没有这个方法」来判断（entries/version-differences-in-one-place.md）

## 看效果与排错

- ［坑］验收测试要真的点开那个东西，别被前缀相同的类名骗过（entries/acceptance-test-must-actually-open-the-thing.md）
- ［好］交付前在深色、浅色、宽屏、窄屏下各看一遍（entries/check-light-dark-narrow.md）
- ［坑］改样式先量真实组件的渲染结果，不要对着设计稿或截图猜（entries/measure-real-render.md）
- ［坑］新造或改过的模式，要新建一个会话才看得到，原来的会话不会变（entries/new-mode-needs-new-session.md）
- ［坑］换掉已装插件的代码后要彻底退出重开，打包版桌面的 Cmd+R 不是整页刷新（entries/restart-after-replacing-package.md）
- ［好］同一个问题连改三轮没好就停，写个总结开新会话接着做（entries/stop-after-three-rounds.md）
