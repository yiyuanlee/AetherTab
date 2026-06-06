# AetherTab | Premium Tab Manager

AetherTab is a lightweight, high-performance Chrome Extension that replaces your default New Tab page with a stunning glassmorphic workspace dashboard. Inspired by Toby, it simplifies your browsing workspace by allowing you to organize, save, and manage your browser tabs into customizable collections.

AetherTab 是一款极简、高颜值的 Chrome 标签页管理扩展程序。它用拟物化磨砂玻璃（Glassmorphic）风格的控制面板取代了浏览器默认的新标签页，让您可以将当前打开的标签拖入不同的收藏夹分类中并自动关闭它们，瞬间还您一个干净清爽的浏览器工作区。

---

## 🚀 Features | 核心特性

- **Interactive Weather Widget / 实时天气情况卡片**
  Displays current weather info with a glowing glassmorphic card in the header. Supports browser geolocation detection (GPS) and manual city searches. Includes clickable Celsius/Fahrenheit toggle, local storage caching, and dynamic light colors for weather statuses.
  顶部中央展示实时天气卡片。支持一键获取浏览器 GPS 定位或手动输入搜索城市。气温支持摄氏/华氏度点击切换，并自动缓存与渲染对应天气色调的虚化背光。

- **Larger Premium Link Cards / 大号网页链接卡片**
  Saved webpages are rendered as larger, beautifully spaced horizontal cards. Featuring larger icons (32x32px container), bold text, and responsive lift-on-hover shadows.
  保存的网页采用面积更大、间距更合理的大号卡片。配备大尺寸图标容器、加粗标题以及优雅的悬浮抬升阴影。

- **Auto Domain Badging & HSL Coding / 自动网站标签与色彩编码**
  Automatically extracts site domain and displays custom capsule badges (e.g. `ChatGPT`, `GitHub`). Badges are dynamically colored with transparent HSL tones based on a stable hash of the domain name.
  自动识别域名并附带胶囊标签（如 `ChatGPT`、`GitHub`）。基于域名哈希算法自动生成唯一的 HSL 色调着色，使相同域名在视觉上归类一致。

- **Group by Site (Domain Clustering) / 按网站自动分组**
  A toggle button in the card header clusters tabs from the same domain into neat, collapsible folders (e.g., `Google Docs (3)`), making dense lists highly manageable.
  卡片右上角新增“按网站分组”切换。点击后将同站点的标签页自动折叠归类至独立抽屉中，告别长 Session 难寻痛点。

- **Collection Card Local Filter / 卡片级局部搜索过滤**
  Toggle an inline search bar inside any collection card to filter tabs locally in real-time. Features carefully preserved input focus for smooth typing.
  卡片右上角新增搜索按钮。点击展开卡片微型输入框，实时过滤检索本分类卡片内的链接，快速定位。

- **Glassmorphic Aesthetics / 毛玻璃视觉设计**
  Deep space background radial gradients, translucent card panels with dynamic border glow shadows, and ultra-smooth micro-interactions.
  自适应深浅色背景流光渐变、半透明卡片容器与呼吸边缘发光微动效。
  
- **Interactive Drag & Drop Tab Cleanup / 拖拽自动整理与清理**
  Drag open tabs from the sidebar directly into any collection to save and automatically close the browser tab. Drag saved links between collections to organize.
  可将左侧的当前活动标签拖曳进分类卡片中保存，保存后该标签页会自动从浏览器关闭（强迫症福音）。亦可在收藏夹分类之间自由拖移。

- **Dynamic Clock & Custom Greetings / 实时时钟与问候**
  A beautiful large header displaying localized date, dynamic ticking clock, and natural greetings tailored to the hour.
  主页面上方显示实时流光电子时钟，并根据不同时段为您展示定制问候语。

- **Light & Dark Themes / 深浅双色主题**
  Toggle instantly between dark/galaxy mode and light/glass mode.
  支持一键在深邃星空暗色主题与明亮剔透亮色主题之间切换。

---

## 🧱 Project Structure | 项目结构

```
AetherTab/
├── js/
│   ├── app.js          # Entry point
│   ├── collections.js  # Data CRUD & session save
│   ├── constants.js    # Mock data & config constants
│   ├── events.js       # Event listeners
│   ├── modal.js        # Custom link modal
│   ├── render.js       # DOM rendering (single createTabEl)
│   ├── state.js        # Shared app state & DOM refs
│   ├── storage.js      # chrome.storage / localStorage adapter
│   ├── tabs.js         # Active tab sync (debounced)
│   ├── toast.js        # Toast notifications
│   ├── utils.js        # Helpers (escapeHtml, debounce, favicon)
│   ├── weather.js      # Weather widget with 30-min cache
│   └── widgets.js      # Clock & theme
├── scripts/build.mjs   # Optional esbuild bundle → dist/
├── newtab.html
├── newtab.css
└── manifest.json
```

### Development | 开发

```bash
# Generate extension icons
npm run icons

# Optional: bundle modules into dist/js/app.js
npm install
npm run build
```

Load the project folder as an unpacked extension in `chrome://extensions/`. ES modules work directly — no build step required for daily development.

---

## 🛠️ Installation | 安装指引

To install AetherTab in Google Chrome:

1. Clone or download this repository.
   克隆或下载本仓库代码到本地。
2. Open **Google Chrome** and navigate to `chrome://extensions/`.
   打开 Chrome 浏览器并访问 `chrome://extensions/` 管理页面。
3. Turn on the **"Developer mode"** toggle in the top-right corner.
   开启页面右上角的 **“开发者模式”**。
4. Click **"Load unpacked"** in the top-left corner.
   点击左上角的 **“加载已解压的扩展程序”**。
5. Select the folder containing these project files.
   选择包含本项目文件的文件夹。
6. Open a new browser tab and enjoy!
   新建一个浏览器标签页，体验 AetherTab！

---

## 🎨 Local Testing / 免安装预览

No extension context required for previewing! You can double-click `newtab.html` to open it locally in any browser. It will automatically load mock active tabs and collections for you to test the visuals and layouts.

无需加载扩展亦可直接预览设计！您可以在本地直接双击 `newtab.html`，页面会自动识别非扩展运行环境并进入“离线模拟模式”，展现预置的模拟数据和分类卡片以供测试。

---

## 📄 License | 许可证
[MIT License](LICENSE)
