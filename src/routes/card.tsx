import { createFileRoute } from "@tanstack/react-router";
import { CardPage } from "@/lib/treeback/card-page";
import { TreeBackShell } from "@/lib/treeback/shell";

export const Route = createFileRoute("/card")({
  head: () => ({
    meta: [
      { title: "認領卡分享｜TreeBack 台北見縫插樹" },
      { name: "description", content: "產生可下載的許願卡、大樹守護卡與綠洲證書分享圖，標示資料來源與遊戲參數界線。" },
      { property: "og:title", content: "認領卡分享｜TreeBack" },
      { property: "og:description", content: "產生可下載的許願卡、大樹守護卡與綠洲證書分享圖，標示資料來源與遊戲參數界線。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <TreeBackShell hero={false}>
      <CardPage />
    </TreeBackShell>
  ),
});
