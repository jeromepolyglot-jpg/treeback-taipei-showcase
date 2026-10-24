import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { slides } from "@/components/Slides";

export const Route = createFileRoute("/slides")({
  validateSearch: (
    s: Record<string, unknown>,
  ): { slide?: number; print?: boolean | undefined } => ({
    slide: Math.min(Math.max(Number(s["slide"]) || 1, 1), slides.length),
    print: s["print"] !== undefined ? true : undefined,
  }),
  head: () => ({
    meta: [
      { title: "TreeBack 台北見縫插樹｜專案簡報" },
      {
        name: "description",
        content: "TreeBack 樹蔭公平情境實驗室的專案說明投影片。",
      },
      {
        property: "og:title",
        content: "TreeBack 台北見縫插樹｜專案簡報",
      },
      {
        property: "og:description",
        content: "樹蔭公平情境實驗室的問題、模型、功能與下一步。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Deck,
});

function Deck() {
  const { slide = 1, print } = Route.useSearch();
  const navigate = useNavigate({ from: "/slides" });
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const i = slide - 1;
  const go = (d: number) =>
    navigate({
      search: {
        print: undefined,
        slide: Math.min(Math.max(slide + d, 1), slides.length),
      },
      replace: true,
    });

  useEffect(() => {
    const fit = () => {
      const el = box.current;
      if (el) setScale(Math.min(el.clientWidth / 1920, el.clientHeight / 1080));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  useEffect(() => {
    document.title = `${slide}/${slides.length} — ${slides[i]!.title}`;
    const k = (e: KeyboardEvent) => {
      if (["ArrowRight", " ", "PageDown"].includes(e.key)) go(1);
      if (["ArrowLeft", "PageUp"].includes(e.key)) go(-1);
      if (e.key === "f") document.documentElement.requestFullscreen?.();
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });

  if (print)
    return (
      <div>
        {slides.map((s, n) => (
          <div key={n} className="print-slide">
            {s.el(n + 1)}
          </div>
        ))}
      </div>
    );

  let x0 = 0;
  return (
    <div
      ref={box}
      className="relative h-screen w-screen overflow-hidden bg-stage"
      onTouchStart={(e) => (x0 = e.touches[0]!.clientX)}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0]!.clientX - x0;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      }}
      onClick={(e) => go(e.clientX > window.innerWidth / 2 ? 1 : -1)}
    >
      <div className="slide-wrapper" style={{ ["--scale" as string]: scale }}>
        {slides[i]!.el(slide)}
      </div>
    </div>
  );
}
