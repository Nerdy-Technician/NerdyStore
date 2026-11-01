// Schema v1 `platforms` helpers for the storefront platform filter.
export const ALL_PLATFORMS = "all";

export const OS_LABELS = { linux: "Linux", windows: "Windows", macos: "macOS" };

export const platformsOf = (item) => {
    const os = item?.platforms?.os;
    return Array.isArray(os) ? os.filter((v) => typeof v === "string") : [];
};

export const matchesPlatform = (item, os) => !os || os === ALL_PLATFORMS || platformsOf(item).includes(os);

// Platform options present in a list, in a stable order, with counts.
export const platformOptions = (items) => {
    const counts = {};
    items.forEach((item) => platformsOf(item).forEach((os) => { counts[os] = (counts[os] || 0) + 1; }));
    const order = Object.keys(OS_LABELS);
    return Object.keys(counts)
        .sort((a, b) => (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99) || a.localeCompare(b))
        .map((slug) => ({ slug, name: OS_LABELS[slug] || slug, count: counts[slug] }));
};

export const platformLabel = (item) => platformsOf(item).map((os) => OS_LABELS[os] || os).join(" · ");
