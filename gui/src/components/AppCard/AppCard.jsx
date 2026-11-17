import "./styles.sass";
import { Icon } from "@mdi/react";
import { mdiPackageVariantClosed, mdiOpenInNew, mdiFileCodeOutline } from "@mdi/js";
import { platformLabel } from "../../utils/platforms";

export const AppCard = ({ app, baseUrl, deployUrl, onDeploy, onPreview }) => (
    <div className="app-card" onClick={onDeploy}>
        <div className="card-header">
            {app.hasLogo ? <img src={`${baseUrl}logos/${app.id}.png`} alt={app.name} className="app-icon" /> : <div className="app-icon-placeholder"><Icon path={mdiPackageVariantClosed} /></div>}
            <div className="card-title">
                <h3>{app.name}</h3>
                <div className="app-meta"><span className="app-category">{app.category}</span><span className="app-version">v{app.version}</span>{platformLabel(app) && <span className="app-platform">{platformLabel(app)}</span>}</div>
            </div>
        </div>
        <div className="app-content"><p className="app-description">{app.description || "No description available"}</p></div>
        <div className="card-actions">
            {app.compose && onPreview && (
                <button type="button" className="compose-btn" aria-label={`Preview compose for ${app.name}`} onClick={(e) => { e.stopPropagation(); onPreview(); }}>
                    <Icon path={mdiFileCodeOutline} /><span>Compose</span>
                </button>
            )}
            {deployUrl ? (
                <a className="deploy-btn" href={deployUrl} target="_blank" rel="noopener noreferrer" aria-label={`Deploy ${app.name}`} onClick={(e) => e.stopPropagation()}>
                    <Icon path={mdiOpenInNew} /><span>Deploy</span>
                </a>
            ) : (
                <button type="button" className="deploy-btn" onClick={(e) => { e.stopPropagation(); onDeploy(); }}>
                    <Icon path={mdiOpenInNew} /><span>Deploy</span>
                </button>
            )}
        </div>
    </div>
);
