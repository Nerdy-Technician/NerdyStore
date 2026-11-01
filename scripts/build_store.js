#!/usr/bin/env node
const { readdirSync, statSync, readFileSync, writeFileSync, existsSync, mkdirSync, cpSync } = require("fs");
const { join, extname } = require("path");
const { execFileSync } = require("child_process");

const APPS_DIR = join(__dirname, "..", "nexploy");
const NEXTERM_DIR = join(__dirname, "..", "nexterm");
const DIST_DIR = join(APPS_DIR, "dist");
const LOGOS_DIR = join(__dirname, "..", "gui", "public", "logos");
const IGNORE = ["build.js", "auto-update.js", "update.js.template", "dist", "npindex", ".git", ".DS_Store", "NPINDEX"];

const parseManifest = content => Object.fromEntries(
    content.split("\n").map(l => l.match(/^(\w+):\s*["']?([^"'\n]+)["']?/)).filter(Boolean).map(m => [m[1], m[2].trim()])
);

const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const parseCommentMeta = (content, ext) => {
    const meta = {};
    const patterns = ext.endsWith(".css")
        ? [/\/\*\s*@(\w+):\s*(.+?)\s*\*\//g]
        : [/#\s*@(\w+):\s*(.+)/g];
    for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(content))) meta[match[1]] = match[2].trim();
    }
    return meta;
};

const parseThemeColors = (content) => {
    const darkBlock = content.match(/:root\[data-theme="dark"\]\s*\{([^}]+)\}/);
    if (!darkBlock) return null;
    const vars = {};
    for (const [, key, val] of darkBlock[1].matchAll(/--(\w[\w-]*):\s*([^;]+);/g))
        vars[key] = val.trim();
    return {
        background: vars["background"] || null,
        terminal: vars["terminal"] || null,
        primary: vars["primary"] || null,
        text: vars["text"] || null,
        subtext: vars["subtext"] || null,
    };
};

const NEXTERM_CATEGORIES = {
    scripts: { name: "Scripts", kind: "script", extensions: [".sh"] },
    snippets: { name: "Snippets", kind: "snippet", extensions: [".snippet"] },
    themes: { name: "Themes", kind: "theme", extensions: [".theme.css"] },
};

// Optional schema v1 search fields (summary, tags). Accepts "a, b" or "[a, b]".
const parseTags = value => value ? value.replace(/^\[|\]$/g, "").split(",").map(t => t.trim().replace(/^["']|["']$/g, "")).filter(Boolean).slice(0, 8) : undefined;
const optionalSearchFields = meta => ({
    ...(meta.summary ? { summary: meta.summary } : {}),
    ...(parseTags(meta.tags)?.length ? { tags: parseTags(meta.tags) } : {}),
});

// Schema v1 `platforms` ({ os: [...], arch: [...] }). The flat manifest parser above
// skips nested keys, so read the block directly. Accepts inline `[a, b]` or `- a` lists.
const PLATFORM_OS = { linux: "linux", windows: "windows", macos: "macos", mac: "macos", osx: "macos", darwin: "macos" };
const listValues = (lines, key) => {
    const i = lines.findIndex(l => new RegExp(`^\\s+${key}:`).test(l));
    if (i === -1) return [];
    const inline = lines[i].split(":").slice(1).join(":").trim();
    if (inline) return parseTags(inline) || [];
    const out = [];
    for (const l of lines.slice(i + 1)) { const m = l.match(/^\s+-\s*["']?([^"'\s]+)/); if (!m) break; out.push(m[1]); }
    return out;
};
const parsePlatforms = content => {
    const lines = content.split("\n");
    const start = lines.findIndex(l => /^platforms:\s*$/.test(l));
    if (start === -1) return null;
    const end = lines.findIndex((l, i) => i > start && /^\S/.test(l));
    const block = lines.slice(start + 1, end === -1 ? undefined : end);
    const os = [...new Set(listValues(block, "os").map(v => PLATFORM_OS[v.toLowerCase()]).filter(Boolean))];
    const arch = [...new Set(listValues(block, "arch").map(v => v.toLowerCase()))];
    return os.length ? { os, arch: arch.length ? arch : ["any"] } : null;
};
// Nexterm headers use `@OS: Linux` (comma separated); map to the same shape.
const headerPlatforms = meta => {
    const os = [...new Set(String(meta.OS || "").split(",").map(v => PLATFORM_OS[v.trim().toLowerCase()]).filter(Boolean))];
    return os.length ? { os, arch: ["any"] } : null;
};
// Text copied by the storefront "Copy" button: the item exactly as Nexterm imports it
// (header comments and @NEXTERM directives kept). Very large files link out instead.
const MAX_COPY_CHARS = 20000;
const copyText = content => content.length > MAX_COPY_CHARS ? undefined : content.replace(/\s+$/, "") + "\n";

const buildApp = (appDir, appId, letter) => {
    const raw = readFileSync(join(appDir, "manifest.yml"), "utf8");
    const manifest = parseManifest(raw);
    // Docker listings run on Linux hosts; declared schema v1 platforms win.
    const platforms = parsePlatforms(raw) || ((manifest.type || "docker") === "docker" ? { os: ["linux"], arch: ["any"] } : undefined);
    const version = manifest.version || "0.0.0";
    const destDir = join(DIST_DIR, letter, appId);
    mkdirSync(destDir, { recursive: true });
    cpSync(appDir, destDir, { recursive: true });
    console.log(`  → ${letter}/${appId}@${version}`);
    return { id: appId, slug: appId, letter, version, name: manifest.name || appId, description: manifest.description || "", category: manifest.category || "Other", type: manifest.type || "unknown", kind: manifest.kind || "app", ...optionalSearchFields(manifest), ...(platforms ? { platforms } : {}), hasLogo: existsSync(join(LOGOS_DIR, `${appId}.png`)) };
};

const npindexPath = join(APPS_DIR, "NPINDEX");
const npindexContent = existsSync(npindexPath) ? readFileSync(npindexPath, "utf8") : "";
const npindexHeader = npindexContent.match(/^#!NPINDEX1\s+(\S+)/);
const sourceName = npindexHeader ? npindexHeader[1] : "NerdyStore";

console.log("Fetching logos...");
execFileSync(process.execPath, [join(__dirname, "fetch_logos.js")], { stdio: "inherit" });

console.log(`\nBuilding apps (source: ${sourceName})...\n`);
if (!existsSync(DIST_DIR)) mkdirSync(DIST_DIR);
if (!existsSync(join(DIST_DIR, "categories"))) mkdirSync(join(DIST_DIR, "categories"));

const index = [], cats = {};
for (const letter of readdirSync(APPS_DIR)) {
    const lPath = join(APPS_DIR, letter);
    if (IGNORE.includes(letter) || !statSync(lPath).isDirectory() || letter.length !== 1) continue;
    for (const id of readdirSync(lPath)) {
        const aPath = join(lPath, id);
        if (!statSync(aPath).isDirectory() || !existsSync(join(aPath, "manifest.yml"))) continue;
        const r = buildApp(aPath, id, letter);
        index.push(`${r.id}@${r.version}`);
        (cats[r.category] ??= []).push(r);
    }
}

const categories = Object.keys(cats).sort().map(n => ({ name: n, count: cats[n].length, slug: slugify(n) }));
writeFileSync(join(DIST_DIR, "categories.json"), JSON.stringify({ generatedAt: new Date().toISOString(), categories }, null, 2));
Object.entries(cats).forEach(([n, apps]) => writeFileSync(join(DIST_DIR, "categories", `${slugify(n)}.json`), JSON.stringify({ name: n, apps: apps.sort((a, b) => a.name.localeCompare(b.name)) }, null, 2)));
writeFileSync(join(DIST_DIR, "NPINDEX"), `#!NPINDEX1 ${sourceName}\n\n` + index.join("\n") + "\n");

console.log(`\nNPINDEX: ${index.length} apps | categories.json: ${categories.length} categories`);

console.log("\nBuilding Nexterm catalog...\n");
const nextermItems = {};

const collectFiles = (dir, baseDir, extensions) => {
    const results = [];
    for (const entry of readdirSync(dir)) {
        const fullPath = join(dir, entry);
        if (statSync(fullPath).isDirectory()) {
            results.push(...collectFiles(fullPath, baseDir, extensions));
        } else if (extensions.some(ext => entry.endsWith(ext))) {
            results.push({ file: entry, filePath: fullPath, relPath: fullPath.slice(baseDir.length + 1) });
        }
    }
    return results;
};

for (const [dirName, catInfo] of Object.entries(NEXTERM_CATEGORIES)) {
    const dirPath = join(NEXTERM_DIR, dirName);
    if (!existsSync(dirPath)) continue;
    const items = [];
    for (const { file, filePath, relPath } of collectFiles(dirPath, dirPath, catInfo.extensions)) {
        const content = readFileSync(filePath, "utf8");
        const ext = catInfo.extensions.find(ext => file.endsWith(ext));
        const meta = parseCommentMeta(content, ext);
        const subdir = relPath.includes("/")
            ? relPath.split("/").slice(0, -1).join("/")
            : dirName === "snippets" ? file.split("-")[0] : null;
        const item = {
            id: relPath,
            name: meta.name || file,
            description: meta.description || "",
            kind: catInfo.kind,
            category: dirName,
            subcategory: subdir,
            ...optionalSearchFields(meta),
            file: `${dirName}/${relPath}`,
            ...(headerPlatforms(meta) ? { platforms: headerPlatforms(meta) } : {}),
            ...(dirName !== "themes" && copyText(content) ? { copy: copyText(content) } : {}),
            ...(dirName === "themes" ? { colors: parseThemeColors(content) } : {}),
        };
        items.push(item);
        console.log(`  → ${dirName}/${relPath} (${item.name})`);
    }
    nextermItems[dirName] = { name: catInfo.name, items: items.sort((a, b) => a.name.localeCompare(b.name)) };
}

const nextermCategories = Object.entries(nextermItems).map(([slug, data]) => ({ name: data.name, slug, count: data.items.length }));
writeFileSync(join(DIST_DIR, "nexterm.json"), JSON.stringify({
    generatedAt: new Date().toISOString(),
    categories: nextermCategories,
    items: nextermItems,
}, null, 2));

const totalNexterm = nextermCategories.reduce((s, c) => s + c.count, 0);
console.log(`\nNexterm: ${totalNexterm} items | ${nextermCategories.length} categories`);
