import { createFileRoute } from "@tanstack/react-router";
import { SourcesPage } from "@/lib/treeback/sources-page";
import { TreeBackShell } from "@/lib/treeback/shell";

export const Route = createFileRoute("/sources")({
  head: () => ({
    meta: [
      { title: "資料與方法｜TreeBack 台北見縫插樹" },
      {
        name: "description",
        content:
          "TreeBack 的模型公式、情境假設定義、可用圖資與它們不能回答的問題。所有數值皆為展示假設。",
      },
      { property: "og:title", content: "資料與方法｜TreeBack" },
      {
        property: "og:description",
        content: "每個數字，都要知道它從哪裡來。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Sources,
});

function Sources() {
  return (
    <TreeBackShell hero={false}>
      <SourcesPage />
    </TreeBackShell>
  );
}
