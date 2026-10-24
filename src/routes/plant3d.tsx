import { createFileRoute } from "@tanstack/react-router";
import { Plant3DCanvas } from "@/lib/treeback/plant3d-canvas";

export const Route = createFileRoute("/plant3d")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "見縫插樹 3D — TreeBack 台北" },
      {
        name: "description",
        content:
          "點擊空樹穴把樹種回台北街區的 3D 小遊戲：90 秒計時，樹蔭沙漠區加倍計分，呼應台北一年流失約三千棵樹的議題。",
      },
      { property: "og:title", content: "見縫插樹 3D — TreeBack 台北" },
      {
        property: "og:description",
        content: "在 3D 街區裡點擊空樹穴種樹，把一年流失的三千棵樹種回來。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Plant3DCanvas,
});
