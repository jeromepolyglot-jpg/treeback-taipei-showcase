import { createFileRoute } from "@tanstack/react-router";
import { FieldworkPage } from "@/lib/treeback/fieldwork-page";
import { TreeBackShell } from "@/lib/treeback/shell";

export const Route = createFileRoute("/fieldwork")({
  head: () => ({
    meta: [
      { title: "48h 街區行動｜TreeBack 台北見縫插樹" },
      {
        name: "description",
        content:
          "大同與萬華的 48 小時公民盤點作業計畫：抽樣框、分層配置、合法影像證據與有限現勘界線。",
      },
      { property: "og:title", content: "48h 街區行動｜TreeBack" },
      {
        property: "og:description",
        content: "60 個街段單側抽樣單位，最多 12 個有限現勘；需求不等於可種。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Fieldwork,
});

function Fieldwork() {
  return (
    <TreeBackShell hero={false}>
      <FieldworkPage />
    </TreeBackShell>
  );
}
