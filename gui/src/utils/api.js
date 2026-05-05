export const loadSourceName = async (baseUrl) => {
    const res = await fetch(`${baseUrl}NPINDEX`);
    if (!res.ok) return "official";
    const text = await res.text();
    const match = text.match(/^#!NPINDEX1\s+(\S+)/);
    return match ? match[1] : "official";
};

export const loadCategoriesIndex = async (baseUrl) => {
    const res = await fetch(`${baseUrl}categories.json`);
    if (!res.ok) throw new Error('Failed to load categories index');
    return res.json();
};

export const loadCategoryApps = async (baseUrl, slug) => {
    const res = await fetch(`${baseUrl}categories/${slug}.json`);
    if (!res.ok) throw new Error(`Failed to load category: ${slug}`);
    return res.json();
};

export const loadNextermData = async (baseUrl) => {
    const res = await fetch(`${baseUrl}nexterm.json`);
    if (!res.ok) throw new Error('Failed to load Nexterm data');
    return res.json();
};
