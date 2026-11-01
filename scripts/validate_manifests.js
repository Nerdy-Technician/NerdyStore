#!/usr/bin/env node
// Validate nexploy/*/*/manifest.yml files.
//   --mode core   : blocking. Only keys every manifest has today (type, name, category, mainService) + YAML parse.
//   --mode strict : full schema/manifest.v1.json (Ajv errors) + soft lints (warnings only).
// Deps (CI installs with --no-save): ajv@8 ajv-formats@3 yaml@2
const fs = require("fs");
const path = require("path");
const YAML = require("yaml");

const ROOT = path.join(__dirname, "..");
const APPS_DIR = path.join(ROOT, "nexploy");
const CORE_KEYS = ["type", "name", "category", "mainService"];

const i = process.argv.indexOf("--mode");
const mode = i > -1 ? process.argv[i + 1] : "strict";
if (!["core", "strict"].includes(mode)) { console.error(`Unknown mode "${mode}" (use core|strict)`); process.exit(2); }

// nexploy/<letter>/<id>/manifest.yml, skipping build output (dist)
const files = [];
for (const letter of fs.readdirSync(APPS_DIR)) {
    if (letter === "dist") continue;
    const ld = path.join(APPS_DIR, letter);
    if (!fs.statSync(ld).isDirectory()) continue;
    for (const id of fs.readdirSync(ld)) {
        const f = path.join(ld, id, "manifest.yml");
        if (fs.existsSync(f)) files.push(f);
    }
}
if (files.length === 0) { console.log("::error::No manifest.yml files found under nexploy/"); process.exit(1); }

let validate = null;
if (mode === "strict") {
    const Ajv = require("ajv/dist/2020");
    const addFormats = require("ajv-formats");
    const ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(ajv);
    validate = ajv.compile(JSON.parse(fs.readFileSync(path.join(ROOT, "schema", "manifest.v1.json"), "utf8")));
}

let errs = 0, warns = 0;
const bad = new Set();
const ann = (lvl, f, m) => {
    const rel = path.relative(ROOT, f);
    console.log(`::${lvl} file=${rel}::${m}`);
    if (lvl === "error") { errs++; bad.add(rel); } else warns++;
};

for (const f of files.sort()) {
    const dir = path.dirname(f), id = path.basename(dir);
    let m;
    try { m = YAML.parse(fs.readFileSync(f, "utf8")); } catch (e) { ann("error", f, `YAML: ${e.message.split("\n")[0]}`); continue; }
    if (!m || typeof m !== "object") { ann("error", f, "manifest is not a YAML mapping"); continue; }

    if (mode === "core") {
        for (const k of CORE_KEYS) if (m[k] === undefined || m[k] === null || m[k] === "") ann("error", f, `missing required key: ${k}`);
        continue;
    }

    // strict: only schema failures are errors (job is soft-fail in CI)
    if (!validate(m)) for (const e of validate.errors) ann("error", f, `${e.instancePath || "/"} ${e.message}`);

    // soft lints: always warnings
    if (m.id && m.id !== id) ann("warning", f, `id "${m.id}" does not match folder "${id}"`);
    if (m.icon && !/^https:/.test(m.icon) && !fs.existsSync(path.join(dir, m.icon))) ann("warning", f, `icon file not found: ${m.icon}`);
    for (const s of Array.isArray(m.screenshots) ? m.screenshots : [])
        if (s && s.src && !/^https:/.test(s.src) && !fs.existsSync(path.join(dir, s.src))) ann("warning", f, `screenshot not found: ${s.src}`);
    if (m.imageTag === "latest" || ["latest", "stable"].includes(m.version)) ann("warning", f, "unpinned version/imageTag");
    if (m.gallery) ann("warning", f, "legacy gallery: migrate to screenshots[]");
}

const summary = `### manifest ${mode}: ${files.length} manifests, ${bad.size} failing, ${errs} errors, ${warns} warnings\n`;
console.log(summary.replace(/^### /, ""));
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
process.exit(errs ? 1 : 0);
