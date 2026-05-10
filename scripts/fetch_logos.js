#!/usr/bin/env node
const https = require("https");
const fs = require("fs");
const path = require("path");

const LOGOS_DIR = path.join(__dirname, "..", "gui", "public", "logos");
const CATEGORIES_DIR = path.join(__dirname, "..", "nexploy", "dist", "categories");
const CDN_BASE = "https://cdn.jsdelivr.net/gh/selfhst/icons@main/png";

const ALIASES = {
    "hassio-supervisor": "home-assistant",
};

const download = (url, dest) => new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, res => {
        if (res.statusCode === 302 || res.statusCode === 301) {
            file.close();
            return download(res.headers.location, dest).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
            file.close();
            fs.unlinkSync(dest);
            return reject(new Error(`HTTP ${res.statusCode}`));
        }
        res.pipe(file);
        file.on("finish", () => file.close(resolve));
    }).on("error", err => {
        fs.unlinkSync(dest);
        reject(err);
    });
});

const isValidPng = dest => {
    try {
        const buf = fs.readFileSync(dest);
        return buf[0] === 0x89 && buf[1] === 0x50;
    } catch {
        return false;
    }
};

(async () => {
    if (!fs.existsSync(LOGOS_DIR)) fs.mkdirSync(LOGOS_DIR, { recursive: true });

    const files = fs.readdirSync(CATEGORIES_DIR).filter(f => f.endsWith(".json"));
    const apps = [];

    for (const file of files) {
        const data = JSON.parse(fs.readFileSync(path.join(CATEGORIES_DIR, file), "utf8"));
        for (const app of data.apps || []) {
            if (app.hasLogo) apps.push(app.id);
        }
    }

    const unique = [...new Set(apps)];
    let fetched = 0, skipped = 0, failed = 0;

    for (const id of unique) {
        const dest = path.join(LOGOS_DIR, `${id}.png`);
        if (fs.existsSync(dest) && isValidPng(dest)) {
            skipped++;
            continue;
        }

        const iconName = ALIASES[id] || id;
        const url = `${CDN_BASE}/${iconName}.png`;

        process.stdout.write(`  Fetching ${id}... `);
        try {
            await download(url, dest);
            if (isValidPng(dest)) {
                console.log("OK");
                fetched++;
            } else {
                fs.unlinkSync(dest);
                throw new Error("not a PNG");
            }
        } catch (err) {
            console.log(`MISS (${err.message})`);
            failed++;
        }
    }

    console.log(`\nLogos: ${fetched} fetched, ${skipped} already exist, ${failed} not found`);
})();
