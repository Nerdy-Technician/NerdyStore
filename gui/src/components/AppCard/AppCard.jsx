import "./styles.sass";
import { Icon } from "@mdi/react";
import { mdiPackageVariantClosed, mdiOpenInNew, mdiLinkVariant } from "@mdi/js";
import { platformLabel } from "../../utils/platforms";
import { stackBadges } from "../../utils/stacks";

export const AppCard = ({ app, baseUrl, deployUrl, onDeploy }) => (
    <div className="app-card" onClick={onDeploy}>
        <div className="card-header">
            {app.hasLogo ? <img src={`${baseUrl}logos/${app.id}.png`} alt={app.name} className="app-icon" /> : <div className="app-icon-placeholder"><Icon path={mdiPackageVariantClosed} /></div>}
            <div className="card-title">
                <h3>{app.name}</h3>
                <div className="app-meta"><span className="app-category">{app.category}</span><span className="app-version">v{app.version}</span>{platformLabel(app) && <span className="app-platform">{platformLabel(app)}</span>}</div>
            </div>
        </div>
        {stackBadges(app).length > 0 && (
            <div className="stack-badges">
                {stackBadges(app).map((badge) => <span key={badge} className="stack-badge" title={badge}><Icon path={mdiLinkVariant} />{badge}</span>)}
            </div>
        )}
        <div className="app-content"><p className="app-description">{app.description || "No description available"}</p></div>
        <div className="card-actions">
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
