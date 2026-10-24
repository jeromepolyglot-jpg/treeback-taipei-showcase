import { createFileRoute } from "@tanstack/react-router";
import { GuardianPage } from "@/lib/treeback/guardian-page";
import { TreeBackShell } from "@/lib/treeback/shell";

export const Route = createFileRoute("/guardian")({
  head: () => ({
    meta: [
      { title: "大樹守護｜TreeBack 台北見縫插樹" },
      { name: "description", content: "訂閱受保護與中大型樹木，瀏覽臺北市 3,874 棵官方受保護樹木並訂閱，工程預警為模擬。" },
      { property: "og:title", content: "大樹守護｜TreeBack" },
      { property: "og:description", content: "訂閱受保護與中大型樹木，瀏覽臺北市 3,874 棵官方受保護樹木並訂閱，工程預警為模擬。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <TreeBackShell hero={false}>
      <GuardianPage />
    </TreeBackShell>
  ),
});
