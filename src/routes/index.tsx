import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/lib/treeback/dashboard";
import { TreeBackShell } from "@/lib/treeback/shell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TreeBack｜樹蔭公平情境實驗室" },
      {
        name: "description",
        content:
          "TreeBack 樹蔭公平情境實驗室：動態調整權重，比較臺北 12 區模擬分數，探索大同與萬華 48 小時公民盤點方案。非官方評分或植樹核定。",
      },
      { property: "og:title", content: "TreeBack｜樹蔭公平情境實驗室" },
      {
        property: "og:description",
        content: "用公開的方法，探索城市的補植優先序。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <TreeBackShell>
      <Dashboard />
    </TreeBackShell>
  );
}
