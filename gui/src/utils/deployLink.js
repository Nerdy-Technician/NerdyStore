// Nexploy opens a store listing at /apps/:source/:slug and starts install from there.
// See gnmyt/Nexploy client/src/pages/Apps/Apps.jsx (store-link handler).

export const DEFAULT_SOURCE_NAME = "NerdyStore";
export const SERVER_URL_STORAGE_KEY = "nexploy_server_url";

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

export const normalizeServerUrl = (raw) => {
    const trimmed = String(raw ?? "").trim();
    if (!trimmed) return "";
    let url;
    try {
        url = new URL(trimmed);
    } catch {
        return "";
    }
    if (!ALLOWED_PROTOCOLS.has(url.protocol)) return "";
    if (url.username || url.password) return "";
    const path = url.pathname.replace(/\/+$/, "");
    return `${url.origin}${path === "/" ? "" : path}`;
};

export const buildNexployDeployUrl = (serverUrl, sourceName, slug) => {
    const base = normalizeServerUrl(serverUrl);
    const source = String(sourceName ?? "").trim();
    const id = String(slug ?? "").trim();
    if (!base || !source || !id) return "";
    if (source.includes("/") || id.includes("/")) return "";
    return `${base}/apps/${encodeURIComponent(source)}/${encodeURIComponent(id)}`;
};

export const serverLabel = (serverUrl) => {
    const normalized = normalizeServerUrl(serverUrl);
    if (!normalized) return "";
    return new URL(normalized).host;
};

export const readSavedServerUrl = () => {
    try {
        return normalizeServerUrl(localStorage.getItem(SERVER_URL_STORAGE_KEY));
    } catch {
        return "";
    }
};

export const saveServerUrl = (serverUrl) => {
    const normalized = normalizeServerUrl(serverUrl);
    if (!normalized) return "";
    try {
        localStorage.setItem(SERVER_URL_STORAGE_KEY, normalized);
    } catch {
        return "";
    }
    return normalized;
};
