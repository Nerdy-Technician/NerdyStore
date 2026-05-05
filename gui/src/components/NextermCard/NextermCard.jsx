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

export const NextermCard = ({ item }) => (
    <div className="nexterm-card">
        <div className="card-header">
            <div className="nexterm-icon-wrapper">
                <Icon path={CATEGORY_ICONS[item.category] || mdiScriptText} />
            </div>
            <div className="card-title">
                <h3>{item.name}</h3>
                <div className="nexterm-meta">
                    <span className="nexterm-type">{CATEGORY_LABELS[item.category] || item.category}</span>
                    <span className="nexterm-file">{item.id}</span>
                </div>
            </div>
        </div>
        <div className="card-content">
            <p className="nexterm-description">{item.description || "No description available"}</p>
        </div>
    </div>
);
