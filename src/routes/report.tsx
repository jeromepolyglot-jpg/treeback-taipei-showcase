import { createFileRoute } from "@tanstack/react-router";
import { ReportPage } from "@/lib/treeback/report-page";
import { TreeBackShell } from "@/lib/treeback/shell";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "見縫插樹通報｜TreeBack 台北見縫插樹" },
      { name: "description", content: "拍照、定位、分類空樹穴與水泥填平處，產生可分享的樹穴卡片，並附樹木降溫研究來源。" },
      { property: "og:title", content: "見縫插樹通報｜TreeBack" },
      { property: "og:description", content: "拍照、定位、分類空樹穴與水泥填平處，產生可分享的樹穴卡片，並附樹木降溫研究來源。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <TreeBackShell hero={false}>
      <ReportPage />
    </TreeBackShell>
  ),
});
