import "./styles.sass";
import Icon from "@mdi/react";
import { mdiScriptText, mdiCodeBraces, mdiPalette } from "@mdi/js";

const CATEGORY_ICONS = {
    scripts: mdiScriptText,
    snippets: mdiCodeBraces,
    themes: mdiPalette,
};

const CATEGORY_LABELS = {
    scripts: "Script",
    snippets: "Snippet",
    themes: "Theme",
};

const ThemeCard = ({ item }) => {
    const c = item.colors || {};
    const style = c.background ? {
        background: c.background,
        borderColor: c.primary || c.background,
    } : {};
    return (
        <div className="nexterm-card theme-card" style={style}>
            {c.background && (
                <div className="theme-preview">
                    <div className="theme-swatch" style={{ background: c.terminal || c.background }} />
                    <div className="theme-swatch" style={{ background: c.primary }} />
                    <div className="theme-swatch" style={{ background: c.text }} />
                    <div className="theme-swatch" style={{ background: c.subtext }} />
                </div>
            )}
            <div className="card-header">
                <div className="nexterm-icon-wrapper" style={c.primary ? { background: `${c.primary}22`, borderColor: `${c.primary}44` } : {}}>
                    <Icon path={mdiPalette} style={c.primary ? { color: c.primary } : {}} />
                </div>
                <div className="card-title">
                    <h3 style={c.text ? { color: c.text } : {}}>{item.name}</h3>
                    <div className="nexterm-meta">
                        <span className="nexterm-type" style={c.primary ? { background: `${c.primary}33`, color: c.primary } : {}}>Theme</span>
                    </div>
                </div>
            </div>
            <div className="card-content">
                <p className="nexterm-description" style={c.subtext ? { color: c.subtext } : {}}>{item.description || "No description available"}</p>
            </div>
        </div>
    );
};

export const NextermCard = ({ item }) => {
    if (item.category === "themes") return <ThemeCard item={item} />;
    return (
        <div className="nexterm-card">
            <div className="card-header">
                <div className="nexterm-icon-wrapper">
                    <Icon path={CATEGORY_ICONS[item.category] || mdiScriptText} />
                </div>
                <div className="card-title">
                    <h3>{item.name}</h3>
                    <div className="nexterm-meta">
                        <span className="nexterm-type">{CATEGORY_LABELS[item.category] || item.category}</span>
                        {item.subcategory && <span className="nexterm-subcat">{item.subcategory}</span>}
                        <span className="nexterm-file">{item.id.split("/").pop()}</span>
                    </div>
                </div>
            </div>
            <div className="card-content">
                <p className="nexterm-description">{item.description || "No description available"}</p>
            </div>
        </div>
    );
};
