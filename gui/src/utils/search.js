// Client-side catalogue search helpers.
// Field names follow NerdyStore schema v1 (summary, tags, kind, category); every
// schema field is optional here so current manifests and header comments keep working.
const normalise = (value) => String(value ?? "").toLowerCase();

const asList = (value) => Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [];

// Every whitespace-separated term must appear in at least one of the fields.
export const matchesQuery = (fields, query) => {
    const terms = normalise(query).trim().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return true;
    const haystack = fields.flat().map(normalise).join(" \u0000 ");
    return terms.every((term) => haystack.includes(term));
};

export const appSearchFields = (app) => [
    app.name, app.summary, app.description, app.id, app.category, app.categorySlug,
    asList(app.tags), app.kind, app.type, app.mainService,
];

export const nextermSearchFields = (item) => [
    item.name, item.summary, item.description, item.id, item.file,
    item.category, item.subcategory, asList(item.tags), item.kind,
];
