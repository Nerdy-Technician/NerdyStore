import { useState } from "react";
import { Icon } from "@mdi/react";
import { mdiServer, mdiOpenInNew } from "@mdi/js";
import { Dialog } from "../Dialog";
import IconInput from "../IconInput";
import Button from "../Button";
import { buildNexployDeployUrl, normalizeServerUrl, readSavedServerUrl, saveServerUrl } from "../../utils/deployLink";
import "./styles.sass";

export const ServerUrlDialog = ({ open, onClose, app, sourceName, onSaved }) => {
    const [serverUrl, setServerUrl] = useState(readSavedServerUrl);

    const slug = app?.slug || app?.id || "";
    const base = normalizeServerUrl(serverUrl);
    const deployUrl = slug ? buildNexployDeployUrl(base, sourceName, slug) : "";
    const canSubmit = slug ? Boolean(deployUrl) : Boolean(base);
    const invalid = Boolean(serverUrl.trim()) && !base;

    const remember = () => {
        const saved = saveServerUrl(serverUrl);
        if (!saved) return false;
        onSaved?.(saved);
        return true;
    };

    const handleSave = () => {
        if (!remember()) return;
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <div className="server-url-dialog">
                <div className="dialog-header">
                    <div className="app-info">
                        {app?.hasLogo && <img src={`/logos/${app.id}.png`} alt={app.name} className="app-logo" />}
                        <div className="app-details">
                            <h2>{app ? `Deploy ${app.name}` : "Nexploy server"}</h2>
                            {app && <span className="app-version">v{app.version}</span>}
                        </div>
                    </div>
                </div>
                <p className="dialog-description">
                    {app
                        ? "Opens this listing in Nexploy. That path is the store link Nexploy uses to start install."
                        : "Listings deploy to /apps/<source>/<slug> on this server."}
                </p>
                <div className="input-wrapper" onKeyDown={(e) => {
                    if (e.key !== "Enter" || !canSubmit) return;
                    if (deployUrl) {
                        e.currentTarget.closest(".server-url-dialog")?.querySelector("a.btn")?.click();
                        return;
                    }
                    handleSave();
                }}>
                    <IconInput type="url" placeholder="https://nexploy.example.com" icon={mdiServer} value={serverUrl} setValue={setServerUrl} />
                </div>
                {slug && (
                    <p className={invalid ? "deploy-preview invalid" : "deploy-preview"}>
                        {deployUrl || `/apps/${sourceName}/${slug}`}
                    </p>
                )}
                {invalid && <p className="deploy-error">Use a full http or https URL, with no username or password in it.</p>}
                <div className="dialog-actions">
                    <Button text="Cancel" type="secondary" onClick={onClose} />
                    {deployUrl ? (
                        <a className="btn" href={deployUrl} target="_blank" rel="noopener noreferrer" aria-label={`Deploy ${app.name}`} onClick={() => { if (remember()) setTimeout(onClose, 0); }}>
                            <Icon path={mdiOpenInNew} /><span>Deploy</span>
                        </a>
                    ) : (
                        <Button text={app ? "Deploy" : "Save server"} onClick={handleSave} disabled={!canSubmit} />
                    )}
                </div>
            </div>
        </Dialog>
    );
};
