// Curated stacks published in categories.json (see nexploy/stacks.json).
export const appInStack = (app, slug) => Boolean(slug) && (app?.stacks || []).some((s) => s.slug === slug);

export const stackBadges = (app) => (app?.stacks || []).map((s) => s.badge).filter(Boolean);

// Group the given apps by the stack's role order; apps outside the stack are dropped.
export const groupByStackRole = (stack, apps) => {
    if (!stack) return [];
    const byId = new Map(apps.map((a) => [a.id, a]));
    return stack.roles
        .map((role) => ({ name: role.name, apps: role.apps.map((id) => byId.get(id)).filter(Boolean) }))
        .filter((role) => role.apps.length);
};
