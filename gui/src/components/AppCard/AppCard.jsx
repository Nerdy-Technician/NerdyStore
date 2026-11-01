import "./styles.sass";
import { Icon } from "@mdi/react";
import { mdiPackageVariantClosed, mdiOpenInNew } from "@mdi/js";

export const AppCard = ({ app, baseUrl, deployUrl, onDeploy }) => (
    <div className="app-card" onClick={onDeploy}>
        <div className="card-header">
            {app.hasLogo ? <img src={`${baseUrl}logos/${app.id}.png`} alt={app.name} className="app-icon" /> : <div className="app-icon-placeholder"><Icon path={mdiPackageVariantClosed} /></div>}
            <div className="card-title">
                <h3>{app.name}</h3>
                <div className="app-meta"><span className="app-category">{app.category}</span><span className="app-version">v{app.version}</span></div>
            </div>
        </div>
        <div className="app-content"><p className="app-description">{app.description || "No description available"}</p></div>
        <div className="card-actions">
            {deployUrl ? (
                <a className="deploy-btn" href={deployUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
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
