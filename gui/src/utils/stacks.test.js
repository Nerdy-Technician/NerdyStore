import { test } from "node:test";
import assert from "node:assert/strict";
import { appInStack, stackBadges, groupByStackRole } from "./stacks.js";

const jf = { id: "jellyfin", stacks: [{ slug: "jellyglance", badge: "Pairs with JellyGlance", role: "Media server" }] };
const son = { id: "sonarr", stacks: [{ slug: "jellyglance", badge: "Pairs with JellyGlance", role: "Library automation" }] };
const other = { id: "ghost" };
const stack = { slug: "jellyglance", roles: [{ name: "Media server", apps: ["jellyfin"] }, { name: "Library automation", apps: ["sonarr", "radarr"] }, { name: "Empty", apps: ["missing"] }] };

test("appInStack", () => {
    assert.equal(appInStack(jf, "jellyglance"), true);
    assert.equal(appInStack(other, "jellyglance"), false);
    assert.equal(appInStack(jf, null), false);
});

test("stackBadges", () => {
    assert.deepEqual(stackBadges(jf), ["Pairs with JellyGlance"]);
    assert.deepEqual(stackBadges(other), []);
});

test("groupByStackRole keeps role order and drops empty roles", () => {
    const groups = groupByStackRole(stack, [son, other, jf]);
    assert.deepEqual(groups.map((g) => [g.name, g.apps.map((a) => a.id)]), [["Media server", ["jellyfin"]], ["Library automation", ["sonarr"]]]);
    assert.deepEqual(groupByStackRole(null, [jf]), []);
});
