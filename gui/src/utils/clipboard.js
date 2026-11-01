// Copy text to the clipboard; falls back to a hidden textarea where the async API is unavailable.
export const copyToClipboard = async (text) => {
    const value = String(text ?? "");
    if (!value) return false;
    try {
        if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(value); return true; }
    } catch { /* fall through */ }
    try {
        const el = document.createElement("textarea");
        el.value = value;
        el.setAttribute("readonly", "");
        el.style.position = "fixed";
        el.style.opacity = "0";
        document.body.appendChild(el);
        el.select();
        const ok = document.execCommand("copy");
        el.remove();
        return ok;
    } catch {
        return false;
    }
};
