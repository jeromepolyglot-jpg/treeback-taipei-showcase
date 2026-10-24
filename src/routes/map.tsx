import { createFileRoute } from "@tanstack/react-router";
import { MapPage } from "@/lib/treeback/map-page";
import { TreeBackShell } from "@/lib/treeback/shell";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "樹蔭公平地圖｜TreeBack 台北見縫插樹" },
      { name: "description", content: "真實行政區邊界與官方受保護樹木分布的台北地圖，並比較現有與方案書兩套 TES 公式。" },
      { property: "og:title", content: "樹蔭公平地圖｜TreeBack" },
      { property: "og:description", content: "真實行政區邊界與官方受保護樹木分布的台北地圖，並比較現有與方案書兩套 TES 公式。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <TreeBackShell hero={false}>
      <MapPage />
    </TreeBackShell>
  ),
});
