import { useState, type ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { FeedbackDialog } from "./feedback-dialog";

const NAV = [
  { to: "/oasis", label: "城市綠洲遊戲" },
  { to: "/plant3d", label: "見縫插樹 3D" },
  { to: "/", label: "樹蔭公平實驗室" },
  { to: "/map", label: "樹蔭地圖" },
  { to: "/report", label: "見縫插樹" },
  { to: "/guardian", label: "大樹守護" },
  { to: "/card", label: "認領卡" },
  { to: "/leaderboard", label: "排行榜" },
  { to: "/records", label: "遊戲紀錄" },
  { to: "/fieldwork", label: "48h 街區行動" },
  { to: "/sources", label: "資料與方法" },
] as const;

export function TreeBackShell({
  children,
  hero = true,
}: {
  children: ReactNode;
  hero?: boolean;
}) {

  const { pathname } = useLocation();
  const [fbOpen, setFbOpen] = useState(false);

  return (
    <div className="tb">
      <a className="skip-link" href="#main">
        跳至主要內容
      </a>
      <header className="header">
        <a className="brand" href="/" aria-label="TreeBack 首頁">
          <img src="/logo.svg" width="36" height="36" alt="" />
          <span>
            TreeBack<span className="brand-sub">台北見縫插樹</span>
          </span>
        </a>
        <nav aria-label="主導覽">
          {NAV.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`nav-link${active ? " active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <span className="header-tag">
          <span className="live-dot" /> CivicTech Prototype
        </span>
      </header>
      <main id="main">
        {hero && (
        <section className="hero">

          <div>
            <p className="eyebrow">URBAN SHADE · TAIPEI</p>
            <h1>
              把樹蔭，還給日常<span className="title-dot">。</span>
            </h1>
            <p className="hero-copy">
              不只計算種了幾棵，更看見樹蔭該回到哪裡。
              <br />
              用公開的方法，探索城市的補植優先序。
            </p>
          </div>
          <div className="hero-numbers" aria-label="原型範圍">
            <div>
              <strong>12</strong>
              <span>行政區情境</span>
            </div>
            <div>
              <strong>02</strong>
              <span>先導盤點區</span>
            </div>
            <div>
              <strong>
                48<span>h</span>
              </strong>
              <span>原型行動計畫</span>
            </div>
          </div>
        </section>
        )}

        {pathname !== '/oasis' && <aside className="disclaimer">
          <span className="warning-symbol" aria-hidden="true">
            !
          </span>
          <p>
            <strong>這是模擬，不是城市現況排名。</strong>
            所有 C／H／P／V 輸入及 24% 樹冠目標均為情境假設。TreeBack TES 非官方 Tree
            Equity Score；候選線索不是實測空穴或核准植樹點。
          </p>
          <Link to="/sources" className="text-button">
            了解資料界線 ↗
          </Link>
        </aside>}
        {children}
      </main>
      <footer>
        <span>
          <strong>TreeBack</strong> 公民參與 × 可追溯資料 × 城市樹蔭
        </span>
        <span>
          <Link to="/slides">專案簡報 ↗</Link> · <Link to="/admin">後台管理</Link> ·{" "}
          <button
            type="button"
            className="text-button"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, font: "inherit" }}
            onClick={() => setFbOpen(true)}
          >
            意見回饋
          </button>{" "}
          · 情境版本 2026.10 · 不取代市府審查
        </span>
      </footer>
      <FeedbackDialog open={fbOpen} onOpenChange={setFbOpen} />
    </div>
  );
}
