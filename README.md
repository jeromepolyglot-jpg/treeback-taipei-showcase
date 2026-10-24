# TreeBack 台北見縫插樹

> 「把三千棵樹種回來」— 一個用 GIS 與台北開放資料檢查城市樹蔭公平、
> 並讓市民實際參與補植的公民科技原型。

台北市因道路工程、病蟲害與管理疏失，一年移除約三千棵樹；樹蔭在不同行政區之間
分配不均，弱勢區域同時也是最熱的區域。TreeBack 想做的不是又多一個抱怨的版面，
而是一套可以**檢視空間、找出補植熱區、讓市民回報樹穴、並追蹤大樹異動**的工具。

本倉庫是这个專案的完整程式碼與內容頁面。

---

## 頁面導覽

| 路徑 | 內容 |
| --- | --- |
| `/` | 樹蔭公平實驗室：調整權重滑桿，看各區情境分數與計算拆解，可匯出情境 CSV |
| `/map` | 樹蔭地圖：台北 12 區真實行政區形狀，顯示各區官方受保護樹木數量 |
| `/report` | 見縫插樹通報牆：市民回報可補植位置、集氣 |
| `/guardian` | 大樹守護：文化局受保護樹木清單（3,874 棵），可訂閱 |
| `/card` | 認領卡：即時產生可分享的許願卡（純前端產圖，不落地儲存） |
| `/plant3d` | 見縫插樹 3D：大安區典型街景模擬，觀察可補植點並顯示 C／H／P／V 貢獻 |
| `/oasis` | 城市綠洲遊戲：三種角色預算的種樹策略遊戲，進度會保存 |
| `/leaderboard` | 排行榜：玩家自願發佈的遊戲成績 |
| `/records` | 遊戲紀錄：每週由 AI 產生的個人回顧（僅本人可見） |
| `/fieldwork` | 48h 街區行動：補植規畫抽樣 |
| `/sources` | 資料與方法：每個圖資能回答與不能回答什麼 |
| `/slides` | 專案簡報（左右鍵翻頁，`?print` 可另存 PDF） |
| `/admin` | 後台管理：僅管理員可見的站務數據總覽 |

## 資料來源

- **臺北市受保護樹木**：台北市政府文化局開放資料（3,874 棵，2026 年 3 月版本，
  內容收錄至 2023 年 4 月）。存放於 `public/data/protected-trees.json`。
- **行政區界線**：g0v 社群整理的內政部行政區界線。
- **3D 樹木模型**：Kenney 的 CC0 授權資產（見 `THIRD_PARTY_NOTICES.md`）。

## 資料界線（重要）

這個原型刻意把「真實資料」與「情境假設」分開標示：

- 沒有可靠公開資料的項目（熱暴露圖層、每棵樹的降溫量、工程預警）一律標示為
  **模擬**或**假設**，不冒充實測或官方數據。
- TreeBack TES 不是官方 Tree Equity Score；候選線索不是實測空穴或核准植樹點。
- 遊戲數值（預算、加成、排行榜）是遊戲參數，不代表真實成果。
- 降溫估算引用國際研究（2021 Nature Communications、2019 PNAS），
  並註明不能直接套用到台北。

## 本地開發

需要 Node.js 與 npm（建議用 nvm 安裝）。

```sh
git clone <this-repository-url>
cd <repository-name>
cp .env.example .env   # 填入你自己的後端專案設定
npm i
npm run dev            # http://localhost:8080
```

其他指令：

```sh
npm run test           # 執行測試
npm run lint           # 程式碼檢查
npm run build          # 正式版建置
```

## 後端

網站的資料庫、登入與圖庫來自 Lovable Cloud（Supabase）。資料庫結構與權限規則
存放在 `drizzle/migrations/`，函式與頁面邏輯在 `src/lib/treeback/`。
若要在自己的後端跑，請填入 `.env` 並套用 migrations。

## 技術棧

TanStack Start（React 19 + Vite 7）、TypeScript、Tailwind CSS v4、Three.js（3D 場景）、
Supabase（資料庫／登入／圖庫）、Lovable AI Gateway（每週回顧）。

## 授權與關係說明

- 本倉庫是 `https://github.com/jeromepolyglot-jpg/treeback-taipei` 的下游成果：
  上游更新會單向拉进来，不假設雙向同步。
- 第三方資產與授權見 `THIRD_PARTY_NOTICES.md`；協作說明見 `CONTRIBUTING.md`。
- 專案內容為公民科技原型與政策討論素材，不取代市府審查。
