import { test } from "node:test";
import assert from "node:assert/strict";
import { fillCompose, buildEnvFile, composeVariables, sanitizeBasePath, composeFileName } from "./composePreview.js";

const SONARR = `services:
  sonarr:
    image: ghcr.io/linuxserver/sonarr
    volumes:
      - ./config:/config
      - "./tv:/tv"
      - /etc/localtime:/etc/localtime:ro
      - named:/cache
    environment:
      - PUID=1026
      - PGID=100
      - TZ=UTC
`;

test("fills PUID/PGID/TZ list entries and moves relative binds under the data path", () => {
    const out = fillCompose(SONARR, { puid: "1001", pgid: "1002", tz: "Europe/London", basePath: "/srv/appdata/", appId: "sonarr" });
    assert.match(out, /- PUID=1001$/m);
    assert.match(out, /- PGID=1002$/m);
    assert.match(out, /- TZ=Europe\/London$/m);
    assert.match(out, /- \/srv\/appdata\/sonarr\/config:\/config$/m);
    assert.match(out, /- "\/srv\/appdata\/sonarr\/tv:\/tv"$/m);
    assert.match(out, /- \/etc\/localtime:\/etc\/localtime:ro$/m);
    assert.match(out, /- named:\/cache$/m);
});

test("fills map-style environment and *_TIME_ZONE keys", () => {
    const out = fillCompose("    environment:\n      PUID: 1026\n      PAPERLESS_TIME_ZONE: UTC\n", { tz: "Asia/Tokyo" });
    assert.match(out, /PUID: "1000"/);
    assert.match(out, /PAPERLESS_TIME_ZONE: "Asia\/Tokyo"/);
});

test("rejects unsafe input and falls back to defaults", () => {
    const out = fillCompose(SONARR, { puid: "1; rm", tz: "Bad Zone", basePath: "relative/x", appId: "sonarr" });
    assert.match(out, /PUID=1000/);
    assert.match(out, /TZ=Europe\/London/);
    assert.match(out, /\/opt\/appdata\/sonarr\/config/);
    assert.equal(sanitizeBasePath("/a/../b"), "/opt/appdata");
    assert.equal(sanitizeBasePath("~/appdata"), "~/appdata");
});

test("leaves ${VAR} references alone and lists them for the .env", () => {
    const tpl = "      - PASS=${DB_PASS:?Set DB_PASS}\n      - MODE=${MODE:-prod}\n      - X=${X}\n";
    assert.equal(fillCompose(tpl), tpl);
    assert.deepEqual(composeVariables(tpl).map(v => v.name), ["DB_PASS", "MODE", "X"]);
    const env = buildEnvFile(tpl, "DB_PASS=example\n", {});
    assert.match(env, /^DB_PASS=example$/m);
    assert.match(env, /^MODE=prod$/m);
    assert.match(env, /^X=$/m);
    assert.match(buildEnvFile("${S:?x}", "", {}), /^S=change-me$/m);
    assert.equal(buildEnvFile(SONARR, "", {}), "");
});

test("file names stay safe", () => {
    assert.equal(composeFileName("uptime-kuma"), "uptime-kuma-docker-compose.yml");
    assert.equal(composeFileName("../x"), "..-x-docker-compose.yml");
});

test("adds TZ after PGID when a PUID/PGID template has no TZ", () => {
    const out = fillCompose("    environment:\n      - PUID=1026\n      - PGID=100\n", { tz: "Europe/Paris" });
    assert.equal(out, "    environment:\n      - PUID=1000\n      - PGID=1000\n      - TZ=Europe/Paris\n");
});
