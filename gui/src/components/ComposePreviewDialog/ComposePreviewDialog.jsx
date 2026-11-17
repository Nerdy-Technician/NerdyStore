import { useState } from "react";
import { Icon } from "@mdi/react";
import { mdiDownload, mdiContentCopy, mdiCheck } from "@mdi/js";
import { Dialog } from "../Dialog";
import { copyToClipboard } from "../../utils/clipboard";
import { DEFAULT_BASE_PATH, DEFAULT_PGID, DEFAULT_PUID, appDataPath, browserTimeZone, buildEnvFile, composeFileName, fillCompose } from "../../utils/composePreview";
import "./styles.sass";

const SETTINGS_KEY = "nerdystore_compose_defaults";

const readSettings = () => {
    try {
        return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
    } catch {
        return {};
    }
};

const download = (name, text) => {
    const url = URL.createObjectURL(new Blob([text], { type: "text/yaml;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
};

const Field = ({ label, value, setValue, placeholder, hint }) => (
    <label className="compose-field">
        <span>{label}</span>
        <input value={value} placeholder={placeholder} onChange={(e) => setValue(e.target.value)} spellCheck={false} />
        {hint && <small>{hint}</small>}
    </label>
);

export const ComposePreviewDialog = ({ open, onClose, app }) => {
    const [saved] = useState(readSettings);
    const [puid, setPuid] = useState(saved.puid || DEFAULT_PUID);
    const [pgid, setPgid] = useState(saved.pgid || DEFAULT_PGID);
    const [tz, setTz] = useState(saved.tz || browserTimeZone());
    const [basePath, setBasePath] = useState(saved.basePath || DEFAULT_BASE_PATH);
    const [tab, setTab] = useState("compose");
    const [copied, setCopied] = useState(false);

    const options = { puid, pgid, tz, basePath, appId: app.id };
    const compose = fillCompose(app.compose, options);
    const env = buildEnvFile(app.compose, app.envExample, options);
    const shown = tab === "env" && env ? env : compose;

    const remember = () => {
        try { localStorage.setItem(SETTINGS_KEY, JSON.stringify({ puid, pgid, tz, basePath })); } catch { /* private mode */ }
    };

    const copy = async () => {
        if (await copyToClipboard(shown)) { setCopied(true); setTimeout(() => setCopied(false), 1500); }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <div className="compose-preview-dialog">
                <div className="dialog-header">
                    <div className="app-info">
                        {app.hasLogo && <img src={`/logos/${app.id}.png`} alt={app.name} className="app-logo" />}
                        <div className="app-details">
                            <h2>{app.name} compose</h2>
                            <span className="app-version">v{app.version} · data in {appDataPath(basePath, app.id)}</span>
                        </div>
                    </div>
                </div>
                <div className="compose-fields">
                    <Field label="PUID" value={puid} setValue={setPuid} placeholder={DEFAULT_PUID} />
                    <Field label="PGID" value={pgid} setValue={setPgid} placeholder={DEFAULT_PGID} />
                    <Field label="Time zone" value={tz} setValue={setTz} placeholder="Europe/London" />
                    <Field label="Data path" value={basePath} setValue={setBasePath} placeholder={DEFAULT_BASE_PATH} hint="./ bind mounts move under <path>/<app>" />
                </div>
                <div className="compose-tabs" role="tablist">
                    <button type="button" role="tab" aria-selected={tab === "compose"} className={tab === "compose" ? "active" : ""} onClick={() => setTab("compose")}>docker-compose.yml</button>
                    {env && <button type="button" role="tab" aria-selected={tab === "env"} className={tab === "env" ? "active" : ""} onClick={() => setTab("env")}>.env</button>}
                </div>
                <pre className="compose-code" aria-label="Compose preview"><code>{shown}</code></pre>
                <div className="dialog-actions">
                    <button type="button" className="compose-action secondary" onClick={copy}><Icon path={copied ? mdiCheck : mdiContentCopy} /><span>{copied ? "Copied" : "Copy"}</span></button>
                    {env && <button type="button" className="compose-action secondary" onClick={() => { remember(); download(".env", env); }}><Icon path={mdiDownload} /><span>.env</span></button>}
                    <button type="button" className="compose-action" onClick={() => { remember(); download(composeFileName(app.id), compose); }}><Icon path={mdiDownload} /><span>Download compose</span></button>
                </div>
            </div>
        </Dialog>
    );
};
