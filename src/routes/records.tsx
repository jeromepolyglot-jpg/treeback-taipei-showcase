import { createFileRoute } from "@tanstack/react-router";
import { RecordsPage } from "@/lib/treeback/records-page";
import { TreeBackShell } from "@/lib/treeback/shell";

export const Route = createFileRoute("/records")({
  head: () => ({
    meta: [
      { title: "我的遊戲紀錄｜TreeBack 台北見縫插樹" },
      { name: "description", content: "每週由 AI 整理你的城市綠洲遊戲進度與成果回顧，只有本人可見；數值為虛構遊戲參數。" },
      { property: "og:title", content: "我的遊戲紀錄｜TreeBack" },
      { property: "og:description", content: "每週由 AI 整理你的城市綠洲遊戲進度與成果回顧，只有本人可見；數值為虛構遊戲參數。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <TreeBackShell hero={false}>
      <RecordsPage />
    </TreeBackShell>
  ),
});
