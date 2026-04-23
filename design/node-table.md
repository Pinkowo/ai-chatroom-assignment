# design.pen 節點表

> 檔案路徑：`design/design.pen`

---

## 一、畫面節點 (Screens)

| Node ID | Name | Position (x, y) | Size (w × h) | 說明 |
|---------|------|-----------------|--------------|------|
| `z1Llv` | Nitra AI - default | -2307, -715.5 | 1440 × 1024 | 主畫面：預設狀態（尚未有 AI 回覆） |
| `Gyb45` | Nitra AI - response | -700, -715.5 | 1440 × 1024 | 主畫面：AI 回覆狀態 |
| `CjvL8` | Nitra AI - response | 867, -715.5 | 1440 × 1697 | 主畫面：多輪對話展開狀態 |

### z1Llv 子節點

| Node ID | Name | 說明 |
|---------|------|------|
| `y6WNg` | Member's Marketplace | 背景頁面 (1440 × 1024) |
| `1kwp5` | Core / Google Chrome / Toolbar / Light | 瀏覽器工具列 (h: 79) |
| `vR464` | Nitra AI | Chat 面板容器 (x: 630, y: 355) |
| `UmD1u` | chat window | 聊天視窗 (w: 780, cornerRadius: 8, shadow) |
| `0dzNw` | Help Button | 懸浮協助按鈕 |

### Gyb45 子節點

| Node ID | Name | 說明 |
|---------|------|------|
| `g1Yz4` | Member's Marketplace | 背景頁面 |
| `z6aup` | Core / Google Chrome / Toolbar / Light | 瀏覽器工具列 |
| `fq2b9` | Nitra AI | Chat 面板容器 (x: 630, y: 355) |
| `WlHyZ` | chat window | 聊天視窗 (w: 780) |

### CjvL8 子節點

| Node ID | Name | 說明 |
|---------|------|------|
| `vVWJH` | Member's Marketplace | 背景頁面 |
| `gRRPk` | Core / Google Chrome / Toolbar / Light | 瀏覽器工具列 |
| `DZ9Ix` | Nitra AI | Chat 面板容器 (x: 630, y: 537) |
| `bODqZ` | chat window | 聊天視窗 (w: 780, clip: true) |

---

## 二、UI Flow 標籤

| Node ID | Name | Position (x, y) | 對應畫面 |
|---------|------|-----------------|---------|
| `7JYp3` | UI Flow | -2307, -981.5 | Nitra AI - default |
| `cVWgS` | UI Flow | -700, -981.5 | Nitra AI - response |
| `GsemY` | UI Flow | 867, -981.5 | Nitra AI - response (extended) |

---

## 三、原型元件

| Node ID | Name | Position (x, y) | Size (w × h) | 說明 |
|---------|------|-----------------|--------------|------|
| `OhQ0H` | text | -2307, 427.5 | 600 × 301 | 文字清單 Variants (5 種) |

### OhQ0H 子節點 (文字項目 Variants)

| Node ID | Variant Name | 說明 |
|---------|-------------|------|
| `s9x0Y` | Property 1=1 | 文字項目 variant 1 |
| `7jjOz` | Property 1=2 | 文字項目 variant 2 |
| `mBTt2` | Property 1=Variant3 | 文字項目 variant 3 |
| `ZgNjq` | Property 1=Variant4 | 文字項目 variant 4 |
| `1eZUU` | Property 1=Variant5 | 文字項目 variant 5 |

---

## 四、Style Guide 節點

| Node ID | Name | Position (x, y) | Size | 說明 |
|---------|------|-----------------|------|------|
| `uqSO4` | General Style Guidelines | -2307, 1081.5 | w: 960 | 主風格指南框架 |
| `p98A5` | — | — | — | 標題文字 |
| `iC6dR` | — | — | — | 色彩面板容器 |
| `1H4g8` | — | — | — | "Color Palette" 標題 |
| `r4YYB` | — | — | — | 字型比例容器 |
| `OrMd5` | — | — | — | "Typography Scale" 標題 |
| `dyBbS` | — | — | — | UI Components 展示容器 |

### 色彩漸層列

| Node ID | 色彩群 | 說明 |
|---------|--------|------|
| `miXfB` / `jZO9S` | Gray | 漸層列 (0 → 900) |
| `KjYqg` / `w7XLL` | Teal | 漸層列 (0 → 900) |
| `8j1pp` / `cWHaQ` | Green | 漸層列 (0 → 900) |
| `khGTc` / `XRu6q` | Yellow | 漸層列 (0 → 900) |
| `2vU9N` / `7uuRr` | Amber | 漸層列 (0 → 900) |
| `0X25w` / `KKPi1` | Orange | 漸層列 (0 → 900) |
| `6g2Dx` / `PRnD5` | Red | 漸層列 (0 → 900) |

---

## 五、Component Kit 節點

| Node ID | Name | Position (x, y) | 說明 |
|---------|------|-----------------|------|
| `Muh61` | Component Kit | -1240, 1081.5 | 元件庫容器 |

### 可重複使用元件 (Reusable = true)

| Node ID | Name | 說明 |
|---------|------|------|
| `mmvpj` | Btn/Primary | — 詳見 components.md |
| `4KbqA` | Btn/Secondary | — |
| `zGfP4` | Btn/Ghost | — |
| `CmGK0` | Btn/Danger | — |
| `3hM76` | Btn/Icon | — |
| `1p4g8` | Input/Default | — |
| `7pwq0` | Badge/Default | — |
| `Aef8m` | Avatar/Default | — |
| `6SaRO` | ChatBubble/User | — |
| `kdprP` | ChatBubble/AI | — |
