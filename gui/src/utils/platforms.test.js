import { test } from "node:test";
import assert from "node:assert/strict";
import { matchesPlatform, platformOptions, platformLabel, platformsOf } from "./platforms.js";

const linux = { platforms: { os: ["linux"], arch: ["any"] } };
const both = { platforms: { os: ["windows", "linux"], arch: ["amd64"] } };
const none = { name: "legacy" };

test("reads os list and ignores malformed values", () => {
    assert.deepEqual(platformsOf(both), ["windows", "linux"]);
    assert.deepEqual(platformsOf(none), []);
    assert.deepEqual(platformsOf({ platforms: { os: "linux" } }), []);
});

test("filters by os, all and empty match everything", () => {
    assert.equal(matchesPlatform(linux, "linux"), true);
    assert.equal(matchesPlatform(linux, "windows"), false);
    assert.equal(matchesPlatform(none, "all"), true);
    assert.equal(matchesPlatform(none, null), true);
    assert.equal(matchesPlatform(none, "linux"), false);
});

test("builds ordered options with counts and labels", () => {
    assert.deepEqual(platformOptions([linux, both, none]), [
        { slug: "linux", name: "Linux", count: 2 },
        { slug: "windows", name: "Windows", count: 1 },
    ]);
    assert.equal(platformLabel(both), "Windows · Linux");
});
