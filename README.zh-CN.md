# AetherTab — Chrome 标签页与书签管理工具

**[安装到 Chrome](https://chromewebstore.google.com/detail/aethertab/nnacnehbnklljafemehfhjekkoghfgok)** · [官方网站](https://aethertab.com/) · [观看操作演示](https://aethertab.com/#demo) · [English](README.md)

**一个安静、直观的浏览器标签页工作区。**

AetherTab 会替换 Chrome 的新标签页。你可以保存当前标签、将链接整理到收藏夹中，并在不堆满浏览器标签的情况下，随时回到重要工作。

[![AetherTab 暗色新标签页与收藏夹界面](promo/aethertab-dark-1280x800.png)](https://aethertab.com/#demo)

## 操作演示

[观看 AetherTab 演示](https://aethertab.com/#demo)，了解如何将打开的标签保存到收藏夹。也可以[直接打开演示视频](promo/aethertab-demo.mp4)。

## 核心功能

- 将打开的标签拖入收藏夹即可保存，原标签会自动关闭。
- 一键保存整个浏览器会话。
- 可直接导入 Chrome 书签，或导入 Netscape HTML、Toby JSON/TXT、通用 JSON 与 AetherTab 分享文件。
- 根据网站、标题、关键词和原文件夹在本地智能分类，导入前可预览，并自动去重。
- 可将任意收藏夹分享为便携分享码、直达链接、JSON 文件或系统分享项。
- 创建、搜索、排序收藏夹，并按网站自动分组。
- 在已登录同一 Chrome 账号的浏览器间同步收藏夹、偏好与主题设置。
- 支持收藏夹内搜索、键盘快捷键、删除撤销与天气组件。
- 提供四套覆盖整个页面的协调配色，并支持亮色 / 暗色模式。
- 首次打开时提供可跳过的三步上手引导。

## 快速开始

1. [从 Chrome 应用商店安装 AetherTab](https://chromewebstore.google.com/detail/aethertab/nnacnehbnklljafemehfhjekkoghfgok)。
2. 新建一个标签页，为工作、学习或阅读创建收藏夹。
3. 将侧边栏中的标签拖入收藏夹，或点击 **Import** 导入已有书签。

无需单独注册 AetherTab 账号。[官方网站](https://aethertab.com/)提供产品介绍与演示。

## 使用方式

### 保存当前工作流

将左侧打开的标签拖入任意收藏夹，或使用 **Save Session** 一次保存全部打开的标签。

### 整理重要内容

可为工作、学习、旅行、阅读等内容建立收藏夹；使用收藏夹内搜索和按网站分组功能快速找到链接。

### 导入与智能整理书签

点击 **Import**，可以直接读取 Chrome 书签、选择浏览器或 Toby 导出的 HTML / JSON / TXT 文件，或粘贴 AetherTab 分享码。导入器可识别旧版 Toby 的 `lists → cards` 和新版 `spaces → collections → resources` 结构，并保留 Space 与收藏夹上下文。选择 **By category**、**Keep folders** 或 **One collection** 后，先确认本地预览再导入。重复链接、仅跟踪参数不同的链接、无效链接和不安全链接会被自动跳过。由于 AetherTab 当前只保存网页链接，Toby 笔记与标签不会被导入。

随时点击 **Organize** 重新整理当前工作区；应用后五秒内可撤销。

### 分享收藏夹

点击收藏夹卡片上的分享图标。分享码可跨 AetherTab 安装使用，JSON 文件可作为便携备份；接收端支持时，直达链接可一键进入导入预览。分享内容仅包含收藏夹名称、链接标题和 HTTP(S) 地址。

### 跨设备使用

在侧边栏开启 Chrome Sync 后，收藏夹和偏好会同步到已登录同一 Chrome 账号的浏览器。

## 开发

```bash
npm install
npm test
npm run build
npm run test:preview
```

本地安装：在 `chrome://extensions` 中开启 **开发者模式**，点击 **加载已解压的扩展程序** 并选择项目文件夹。直接打开 `newtab.html` 可使用示例数据预览界面。

日常开发可直接使用 ES modules，不必每次构建；只有需要打包输出时才运行构建命令。

## 项目结构

```text
js/
  app.js           应用入口
  bookmark-manager.js 书签导入、智能整理与分享交互
  bookmark-tools.js   书签解析、分类、去重与分享格式
  collections.js   收藏夹 CRUD 与会话保存
  onboarding.js    首次使用引导
  storage.js       本地与 Chrome Sync 存储适配器
  sync.js          跨设备同步
  tabs.js          当前标签同步
  weather.js       天气组件
newtab.html        扩展的新标签页
newtab.css         界面样式
manifest.json      Chrome 扩展配置
```

## 隐私

收藏夹与偏好保存在 Chrome 存储中。书签解析、去重与智能分类全部在当前设备本地运行。跨设备同步为可选功能，开启后会使用 Chrome Sync；主动分享收藏夹时会导出名称、链接标题与网址。天气查询会使用城市或位置，只有选择基于位置的天气功能时，扩展才会请求位置权限。

完整说明见[隐私政策](https://aethertab.com/privacy.html)。

## 问题与建议

欢迎[提交问题或功能建议](https://github.com/yiyuanlee/AetherTab/issues)。报告问题时请附上复现步骤、Chrome 版本与 AetherTab 版本。

## 许可证

[MIT](LICENSE)
