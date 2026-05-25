import Icon from "@mdi/react";
import { mdiStore, mdiPackageVariant, mdiConsoleLine, mdiArrowRight, mdiLayersTriple, mdiCubeOutline, mdiScriptText, mdiCodeBraces, mdiPalette, mdiPencilRuler } from "@mdi/js";
import "./styles.sass";

const NEXTERM_ICONS = { scripts: mdiScriptText, snippets: mdiCodeBraces, themes: mdiPalette };

const HomePage = ({ categories, nextermData, onBrowse }) => {
    const totalApps = categories.reduce((sum, cat) => sum + cat.count, 0);

    return (
        <div className="home-page">
            <div className="home-hero">
                <div className="home-logo">
                    <Icon path={mdiStore} />
                </div>
                <h1 className="home-title">NerdyStore</h1>
                <p className="home-subtitle">
                    A curated self-hosted app store for your homelab. Browse, deploy, and manage Docker apps with ease.
                </p>
                <button className="home-cta" onClick={onBrowse}>
                    <span>Browse Apps</span>
                    <Icon path={mdiArrowRight} />
                </button>
            </div>

            <div className="home-stats">
                <div className="stat-card">
                    <Icon path={mdiCubeOutline} />
                    <span className="stat-value">{totalApps}</span>
                    <span className="stat-label">Apps</span>
                </div>
                {nextermData?.categories.map((cat) => (
                    <div className="stat-card" key={cat.slug}>
                        <Icon path={NEXTERM_ICONS[cat.slug] || mdiScriptText} />
                        <span className="stat-value">{cat.count}</span>
                        <span className="stat-label">{cat.name}</span>
                    </div>
                ))}
                <div className="stat-card">
                    <Icon path={mdiLayersTriple} />
                    <span className="stat-value">{categories.length}</span>
                    <span className="stat-label">Categories</span>
                </div>
            </div>

            <div className="home-sections">
                <div className="home-section-card" onClick={() => onBrowse("nexploy")}>
                    <div className="section-card-icon">
                        <Icon path={mdiPackageVariant} />
                    </div>
                    <div className="section-card-body">
                        <h3>Nexploy</h3>
                        <p>Docker compose files and manifests for self-hosted applications</p>
                    </div>
                    <Icon path={mdiArrowRight} className="section-card-arrow" />
                </div>
                <div className="home-section-card" onClick={() => onBrowse("nexterm")}>
                    <div className="section-card-icon">
                        <Icon path={mdiConsoleLine} />
                    </div>
                    <div className="section-card-body">
                        <h3>Nexterm</h3>
                        <p>Terminal scripts, snippets, and themes for your workflow</p>
                    </div>
                    <Icon path={mdiArrowRight} className="section-card-arrow" />
                </div>
                <div className="home-section-card" onClick={() => onBrowse("tools")}>
                    <div className="section-card-icon">
                        <Icon path={mdiPencilRuler} />
                    </div>
                    <div className="section-card-body">
                        <h3>Theme Creator</h3>
                        <p>Design custom Nexterm themes with live preview and CSS export</p>
                    </div>
                    <Icon path={mdiArrowRight} className="section-card-arrow" />
                </div>
            </div>
        </div>
    );
};

export default HomePage;
