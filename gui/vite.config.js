import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// GitHub Pages has no rewrite rules, so give every known client-side route its own
// index.html. Refreshing or deep-linking to /nexploy, /nexterm/scripts, /tools/theme-creator
// etc. then returns HTTP 200 instead of falling through to 404.html.
const readSlugs = (file, pick) => {
    try { return pick(JSON.parse(readFileSync(file, "utf8"))); } catch { return []; }
};

const spaRoutes = () => ({
    name: "nerdystore-spa-routes",
    apply: "build",
    closeBundle() {
        const outDir = join(import.meta.dirname, "dist");
        const index = join(outDir, "index.html");
        if (!existsSync(index)) return;
        const routes = [
            "nexploy", "nexterm", "tools", "tools/theme-creator",
            ...readSlugs(join(outDir, "categories.json"), (d) => d.categories.map((c) => `nexploy/${c.slug}`)),
            ...readSlugs(join(outDir, "nexterm.json"), (d) => d.categories.map((c) => `nexterm/${c.slug}`)),
        ];
        for (const route of routes) {
            const dir = join(outDir, route);
            mkdirSync(dir, { recursive: true });
            copyFileSync(index, join(dir, "index.html"));
        }
    },
});

export default defineConfig({
    plugins: [react(), spaRoutes()],
    base: "/",
    server: {
        fs: {
            allow: [".."],
        },
        historyApiFallback: true,
    },
});
