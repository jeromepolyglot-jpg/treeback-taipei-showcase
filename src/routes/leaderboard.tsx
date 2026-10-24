import { createFileRoute } from "@tanstack/react-router";
import { LeaderboardPage } from "@/lib/treeback/leaderboard-page";
import { TreeBackShell } from "@/lib/treeback/shell";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "綠洲守護者排行榜｜TreeBack 台北見縫插樹" },
      { name: "description", content: "城市綠洲遊戲的玩家排行榜：種樹數與 TES 改善比拚。成績為玩家自願發佈的虛構遊戲參數。" },
      { property: "og:title", content: "綠洲守護者排行榜｜TreeBack" },
      { property: "og:description", content: "城市綠洲遊戲的玩家排行榜：種樹數與 TES 改善比拚。成績為玩家自願發佈的虛構遊戲參數。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <TreeBackShell hero={false}>
      <LeaderboardPage />
    </TreeBackShell>
  ),
});
