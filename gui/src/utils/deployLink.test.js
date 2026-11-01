import { test } from "node:test";
import assert from "node:assert/strict";
import { buildNexployDeployUrl, normalizeServerUrl, serverLabel } from "./deployLink.js";

const NEXPLOY_STORE_LINK = /^\/apps\/([^/]+)\/([^/]+)$/;

test("builds the Nexploy store-link path from a saved server", () => {
    const href = buildNexployDeployUrl("https://nexploy.example.com/", "NerdyStore", "uptime-kuma");
    const url = new URL(href);
    assert.equal(url.origin, "https://nexploy.example.com");
    assert.equal(url.pathname, "/apps/NerdyStore/uptime-kuma");
    assert.match(url.pathname, NEXPLOY_STORE_LINK);
    assert.equal(url.pathname.match(NEXPLOY_STORE_LINK)[1], "NerdyStore");
    assert.equal(url.pathname.match(NEXPLOY_STORE_LINK)[2], "uptime-kuma");
});

test("keeps a subpath and drops a trailing slash, query, and hash", () => {
    const href = buildNexployDeployUrl("https://lab.example:8443/nexploy/?next=/apps#x", "NerdyStore", "pi-hole");
    assert.equal(href, "https://lab.example:8443/nexploy/apps/NerdyStore/pi-hole");
});

test("rejects missing pieces and non-http targets", () => {
    assert.equal(buildNexployDeployUrl("", "NerdyStore", "adguard"), "");
    assert.equal(buildNexployDeployUrl("https://nexploy.example", "", "adguard"), "");
    assert.equal(buildNexployDeployUrl("https://nexploy.example", "NerdyStore", ""), "");
    assert.equal(buildNexployDeployUrl("javascript:alert(1)", "NerdyStore", "adguard"), "");
    assert.equal(buildNexployDeployUrl("ftp://files.example/apps", "NerdyStore", "adguard"), "");
    assert.equal(normalizeServerUrl("https://user:secret@nexploy.example"), "");
    assert.equal(buildNexployDeployUrl("https://nexploy.example", "NerdyStore", "bad/slug"), "");
});

test("labels the server by host", () => {
    assert.equal(serverLabel("https://nexploy.example:8443/nexploy/"), "nexploy.example:8443");
    assert.equal(serverLabel("not a url"), "");
});
