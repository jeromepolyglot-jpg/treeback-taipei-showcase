import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "@/lib/treeback/admin-page";
import { TreeBackShell } from "@/lib/treeback/shell";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "後台管理｜TreeBack 台北見縫插樹" },
      { name: "description", content: "站務數據總覽，僅管理員可見。" },
      { property: "og:title", content: "後台管理｜TreeBack" },
      { property: "og:description", content: "站務數據總覽，僅管理員可見。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <TreeBackShell hero={false}>
      <AdminPage />
    </TreeBackShell>
  ),
});
