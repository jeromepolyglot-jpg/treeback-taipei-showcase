import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { readFileSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { routeTree } from "@/routeTree.gen";

const router = createRouter({
  routeTree,
  context: { queryClient: new QueryClient() },
});

describe("TreeBack routes", () => {
  for (const path of ["/", "/fieldwork", "/sources", "/slides", "/map", "/report", "/guardian", "/oasis"]) {
    it(`matches a page for ${path}`, () => {
      const matches = router.matchRoutes(path);
      expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
    });
  }
});

describe("TreeBack downloads", () => {
  for (const file of [
    "site-sampling-plan.md",
    "candidate-template.csv",
    "simulation-inputs.csv",
  ]) {
    it(`keeps /downloads/${file} nonempty`, () => {
      expect(statSync(`public/downloads/${file}`).size).toBeGreaterThan(0);
    });
  }

  it("links each download from the page that offers it", () => {
    const fieldwork = readFileSync("src/lib/treeback/fieldwork-page.tsx", "utf8");
    const sources = readFileSync("src/lib/treeback/sources-page.tsx", "utf8");
    expect(fieldwork).toContain("/downloads/site-sampling-plan.md");
    expect(fieldwork).toContain("/downloads/candidate-template.csv");
    expect(sources).toContain("/downloads/simulation-inputs.csv");
  });
});
