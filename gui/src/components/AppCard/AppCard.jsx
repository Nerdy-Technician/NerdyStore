import "./styles.sass";
import Icon from "@mdi/react";
import { mdiPackageVariantClosed } from "@mdi/js";

export const AppCard = ({ app, baseUrl, onClick }) => (
    <div className="app-card" onClick={onClick}>
        <div className="card-header">
            {app.hasLogo ? <img src={`${baseUrl}logos/${app.id}.png`} alt={app.name} className="app-icon" /> : <div className="app-icon-placeholder"><Icon path={mdiPackageVariantClosed} /></div>}
            <div className="card-title">
                <h3>{app.name}</h3>
                <div className="app-meta"><span className="app-category">{app.category}</span><span className="app-version">v{app.version}</span></div>
            </div>
        </div>
        <div className="app-content"><p className="app-description">{app.description || "No description available"}</p></div>
    </div>
);
