import { useState, useEffect } from "react";
import { mdiServer, mdiOpenInNew } from "@mdi/js";
import { Dialog } from "../Dialog";
import IconInput from "../IconInput";
import Button from "../Button";
import "./styles.sass";

const STORAGE_KEY = "nexploy_server_url";

export const ServerUrlDialog = ({ open, onClose, app, sourceName }) => {
    const [serverUrl, setServerUrl] = useState("");

    useEffect(() => { const saved = localStorage.getItem(STORAGE_KEY); if (saved) setServerUrl(saved); }, []);

    const handleOpen = () => {
        if (!serverUrl) return;
        localStorage.setItem(STORAGE_KEY, serverUrl);
        const baseUrl = serverUrl.endsWith('/') ? serverUrl.slice(0, -1) : serverUrl;
        window.open(`${baseUrl}/apps/${sourceName}/${app.id}`, '_blank');
        onClose();
    };

    if (!app) return null;

    return (
        <Dialog open={open} onClose={onClose}>
            <div className="server-url-dialog">
                <div className="dialog-header">
                    <div className="app-info">
                        {app.hasLogo && <img src={`./logos/${app.id}.png`} alt={app.name} className="app-logo" />}
                        <div className="app-details"><h2>Install {app.name}</h2><span className="app-version">v{app.version}</span></div>
                    </div>
                </div>
                <p className="dialog-description">Enter your Nexploy server URL to install this app.</p>
                <div className="input-wrapper" onKeyDown={(e) => e.key === 'Enter' && serverUrl && handleOpen()}>
                    <IconInput type="url" placeholder="https://your-server.example.com" icon={mdiServer} value={serverUrl} setValue={setServerUrl} />
                </div>
                <div className="dialog-actions">
                    <Button text="Cancel" type="secondary" onClick={onClose} />
                    <Button text="Open in Nexploy" icon={mdiOpenInNew} onClick={handleOpen} disabled={!serverUrl} />
                </div>
            </div>
        </Dialog>
    );
};
