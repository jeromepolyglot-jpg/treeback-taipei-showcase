import type { ReactNode } from "react";

function Frame({ n, children, dark }: { n: number; children: ReactNode; dark?: boolean }) {
  return (
    <div className={`slide-content ${dark ? "!bg-primary text-primary-foreground" : ""}`}>
      <div className="absolute inset-0 px-[140px] py-[110px] flex flex-col">{children}</div>
      <div className="slide-chrome absolute bottom-[50px] left-[140px] right-[140px] flex justify-between opacity-60">
        <span>TreeBack 台北見縫插樹</span>
        <span>{String(n).padStart(2, "0")} / 06</span>
      </div>
    </div>
  );
}

const Card = ({ t, d }: { t: string; d: string }) => (
  <div className="rounded-lg bg-card border p-10 min-h-[260px]">
    <div className="slide-subtitle font-bold text-primary mb-4">{t}</div>
    <div className="slide-body text-muted-foreground">{d}</div>
  </div>
);

export const slides: { title: string; el: (n: number) => ReactNode }[] = [
  {
    title: "封面",
    el: (n) => (
      <Frame n={n} dark>
        <div className="my-auto">
          <div className="slide-kicker !text-accent mb-8">CIVIC TECH · SHADE EQUITY</div>
          <h1 className="slide-title-lg">TreeBack<br />台北見縫插樹</h1>
          <p className="slide-subtitle mt-10 max-w-[1300px] opacity-85">
            樹蔭公平情境實驗室：讓樹蔭回到市民每天步行、候車與生活的地方
          </p>
        </div>
      </Frame>
    ),
  },
  {
    title: "問題與邊界",
    el: (n) => (
      <Frame n={n}>
        <div className="slide-kicker">WHY</div>
        <h2 className="slide-title mt-4 mb-14">不只是「補植幾棵」</h2>
        <div className="grid grid-cols-3 gap-10">
          <Card t="共同語言" d="市民、環團與市府用同一套公式比較需求。" />
          <Card t="需求≠可種" d="把補植需求與現地可行性分開討論。" />
          <Card t="誠實假設" d="12 區輸入與 24% 樹冠目標皆為展示假設，非市府實測。" />
        </div>
      </Frame>
    ),
  },
  {
    title: "計算模型",
    el: (n) => (
      <Frame n={n}>
        <div className="slide-kicker">MODEL</div>
        <h2 className="slide-title mt-4 mb-12">透明、可解釋的公式</h2>
        <div className="grid grid-cols-[1.1fr_1fr] gap-16 items-start">
          <pre className="slide-code rounded-lg bg-stage text-secondary p-12">{`G   = clip(1 − C/24, 0, 1)
S   = (wH·H + wP·P + wV·V)/100
PPI = 100 × G × (0.5 + 0.5S)
TES = 100 − PPI`}</pre>
          <ul className="slide-body space-y-6">
            <li><b>C</b> 樹冠率；<b>G</b> 樹冠缺口</li>
            <li><b>H / P / V</b> 熱暴露、人口、脆弱度</li>
            <li>預設權重 40 / 35 / 25，總和恆為 100</li>
            <li>TES 越低 → 補植需求越高</li>
          </ul>
        </div>
      </Frame>
    ),
  },
  {
    title: "互動功能",
    el: (n) => (
      <Frame n={n}>
        <div className="slide-kicker">FEATURES</div>
        <h2 className="slide-title mt-4 mb-14">現在就能操作</h2>
        <div className="grid grid-cols-2 gap-10">
          <Card t="權重滑桿" d="調整 H／P／V，其餘兩項等比例重新分配。" />
          <Card t="12 區即時比較" d="TES／PPI 分數、基準差值與名次變化。" />
          <Card t="計算拆解" d="點選行政區，看見缺口 G 與需求 S。" />
          <Card t="48h 街區行動" d="大同、萬華的抽樣與有限現勘作業設計。" />
        </div>
      </Frame>
    ),
  },
  {
    title: "技術架構",
    el: (n) => (
      <Frame n={n}>
        <div className="slide-kicker">STACK</div>
        <h2 className="slide-title mt-4 mb-14">輕量純前端</h2>
        <div className="grid grid-cols-3 gap-10">
          <Card t="原生網頁" d="HTML／CSS／ESM，無登入、資料庫或金鑰。" />
          <Card t="完整測試" d="Node 模型測試＋Playwright 桌機／手機。" />
          <Card t="自動部署" d="GitHub Actions 測試通過後發布到 GitHub Pages。" />
        </div>
      </Frame>
    ),
  },
  {
    title: "下一步",
    el: (n) => (
      <Frame n={n} dark>
        <div className="slide-kicker !text-accent">NEXT</div>
        <h2 className="slide-title mt-4 mb-14">從原型到實地試辦</h2>
        <ul className="slide-body-lg slide-subtitle space-y-8 max-w-[1500px]">
          <li>· 取得合法資料快照，取代展示假設</li>
          <li>· 跨局處在大同、萬華進行實地試辦</li>
          <li>· 未來：GIS 地圖、政府 API、樹冠自動辨識</li>
        </ul>
      </Frame>
    ),
  },
];
