#!/usr/bin/env node
const { readdirSync, statSync, readFileSync, writeFileSync, existsSync, mkdirSync, cpSync } = require("fs");
const { join, extname } = require("path");

const APPS_DIR = join(__dirname, "..", "nexploy");
const NEXTERM_DIR = join(__dirname, "..", "nexterm");
const DIST_DIR = join(APPS_DIR, "dist");
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

const NEXTERM_CATEGORIES = {
    scripts: { name: "Scripts", extensions: [".sh"] },
    snippets: { name: "Snippets", extensions: [".snippet"] },
    themes: { name: "Themes", extensions: [".theme.css"] },
};

const buildApp = (appDir, appId, letter) => {
    const manifest = parseManifest(readFileSync(join(appDir, "manifest.yml"), "utf8"));
    const version = manifest.version || "0.0.0";
    const destDir = join(DIST_DIR, letter, appId);
    mkdirSync(destDir, { recursive: true });
    cpSync(appDir, destDir, { recursive: true });
    console.log(`  → ${letter}/${appId}@${version}`);
    return { id: appId, letter, version, name: manifest.name || appId, description: manifest.description || "", category: manifest.category || "Other", type: manifest.type || "unknown", hasLogo: existsSync(join(appDir, "logo.png")) };
};

const npindexPath = join(APPS_DIR, "NPINDEX");
const npindexContent = existsSync(npindexPath) ? readFileSync(npindexPath, "utf8") : "";
const npindexHeader = npindexContent.match(/^#!NPINDEX1\s+(\S+)/);
const sourceName = npindexHeader ? npindexHeader[1] : "official";

console.log(`Building apps (source: ${sourceName})...\n`);
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

for (const [dirName, catInfo] of Object.entries(NEXTERM_CATEGORIES)) {
    const dirPath = join(NEXTERM_DIR, dirName);
    if (!existsSync(dirPath)) continue;
    const items = [];
    for (const file of readdirSync(dirPath)) {
        const filePath = join(dirPath, file);
        if (!statSync(filePath).isFile()) continue;
        const matchesExt = catInfo.extensions.some(ext => file.endsWith(ext));
        if (!matchesExt) continue;
        const content = readFileSync(filePath, "utf8");
        const ext = catInfo.extensions.find(ext => file.endsWith(ext));
        const meta = parseCommentMeta(content, ext);
        const item = {
            id: file,
            name: meta.name || file,
            description: meta.description || "",
            category: dirName,
            file: `${dirName}/${file}`,
        };
        items.push(item);
        console.log(`  → ${dirName}/${file} (${item.name})`);
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
