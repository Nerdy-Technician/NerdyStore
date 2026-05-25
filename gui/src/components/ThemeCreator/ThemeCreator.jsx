import { useState, useMemo, useCallback } from "react";
import Icon from "@mdi/react";
import { mdiContentCopy, mdiCheck, mdiRefresh } from "@mdi/js";
import "./styles.sass";

const hexToRgb = hex => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
};

const darken = (hex, amount) => {
    const { r, g, b } = hexToRgb(hex);
    return `#${[r, g, b].map(c => Math.max(0, Math.round(c * (1 - amount))).toString(16).padStart(2, "0")).join("")}`;
};

const lighten = (hex, amount) => {
    const { r, g, b } = hexToRgb(hex);
    return `#${[r, g, b].map(c => Math.min(255, Math.round(c + (255 - c) * amount)).toString(16).padStart(2, "0")).join("")}`;
};

const toRgba = (hex, alpha) => {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const DEFAULTS = {
    name: "My Theme",
    description: "A custom Nexterm theme",
    background: "#0f1117",
    primary: "#6C63FF",
    text: "#E8E8F0",
    subtext: "#6B6B8A",
    success: "#29C16A",
    warning: "#DC8500",
    error: "#E05050",
};

const deriveTheme = (colors) => {
    const bg = colors.background;
    const pr = colors.primary;
    const { r: pr_r, g: pr_g, b: pr_b } = hexToRgb(pr);
    return {
        dark: {
            "--background": bg,
            "--terminal": darken(bg, 0.25),
            "--lighter-background": lighten(bg, 0.08),
            "--dialog-background": toRgba(bg, 0.6),
            "--gray-full": lighten(bg, 0.15),
            "--darker-gray": `rgba(${pr_r}, ${pr_g}, ${pr_b}, 0.07)`,
            "--dark-gray": `rgba(${pr_r}, ${pr_g}, ${pr_b}, 0.06)`,
            "--gray": `rgba(${pr_r}, ${pr_g}, ${pr_b}, 0.12)`,
            "--light-gray": colors.text,
            "--primary": pr,
            "--primary-opacity": toRgba(pr, 0.25),
            "--error": colors.error,
            "--error-opacity": toRgba(colors.error, 0.25),
            "--success": colors.success,
            "--success-opacity": toRgba(colors.success, 0.25),
            "--warning": colors.warning,
            "--warning-opacity": toRgba(colors.warning, 0.25),
            "--white": colors.text,
            "--subtext": colors.subtext,
            "--text": colors.text,
        },
        oled: {
            "--background": darken(bg, 0.6),
            "--terminal": darken(bg, 0.75),
            "--lighter-background": darken(bg, 0.4),
            "--dialog-background": toRgba(darken(bg, 0.7), 0.7),
            "--gray-full": darken(bg, 0.3),
            "--darker-gray": `rgba(${pr_r}, ${pr_g}, ${pr_b}, 0.05)`,
            "--dark-gray": `rgba(${pr_r}, ${pr_g}, ${pr_b}, 0.05)`,
            "--gray": `rgba(${pr_r}, ${pr_g}, ${pr_b}, 0.10)`,
            "--light-gray": colors.text,
            "--primary": pr,
            "--primary-opacity": toRgba(pr, 0.25),
            "--error": colors.error,
            "--error-opacity": toRgba(colors.error, 0.25),
            "--success": colors.success,
            "--success-opacity": toRgba(colors.success, 0.25),
            "--warning": colors.warning,
            "--warning-opacity": toRgba(colors.warning, 0.25),
            "--white": colors.text,
            "--subtext": darken(colors.subtext, 0.25),
            "--text": colors.text,
        },
        light: {
            "--background": lighten(bg, 0.92),
            "--terminal": lighten(bg, 0.85),
            "--lighter-background": lighten(bg, 0.88),
            "--dialog-background": toRgba(lighten(bg, 0.95), 0.5),
            "--gray-full": lighten(bg, 0.75),
            "--darker-gray": `rgba(${pr_r}, ${pr_g}, ${pr_b}, 0.08)`,
            "--dark-gray": `rgba(${pr_r}, ${pr_g}, ${pr_b}, 0.05)`,
            "--gray": `rgba(${pr_r}, ${pr_g}, ${pr_b}, 0.10)`,
            "--light-gray": darken(bg, 0.5),
            "--primary": darken(pr, 0.2),
            "--primary-opacity": toRgba(darken(pr, 0.2), 0.18),
            "--error": darken(colors.error, 0.15),
            "--error-opacity": toRgba(colors.error, 0.15),
            "--success": darken(colors.success, 0.2),
            "--success-opacity": toRgba(colors.success, 0.15),
            "--warning": darken(colors.warning, 0.2),
            "--warning-opacity": toRgba(colors.warning, 0.15),
            "--white": darken(bg, 0.7),
            "--subtext": darken(colors.subtext, 0.1),
            "--text": darken(bg, 0.7),
        },
    };
};

const slug = name => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const buildCss = (colors, name, description) => {
    const theme = deriveTheme(colors);
    const block = (selector, vars) =>
        `${selector} {\n${Object.entries(vars).map(([k, v]) => `    ${k}: ${v};`).join("\n")}\n}`;
    return [
        `/* @name: ${name} */`,
        `/* @description: ${description} */`,
        block(`:root[data-theme="dark"]`, theme.dark),
        block(`:root[data-theme="oled"]`, theme.oled),
        block(`:root[data-theme="light"]`, theme.light),
    ].join("\n");
};

const ColorField = ({ label, value, onChange }) => (
    <div className="color-field">
        <label>{label}</label>
        <div className="color-input-row">
            <input type="color" value={value} onChange={e => onChange(e.target.value)} />
            <input type="text" value={value} onChange={e => /^#[0-9a-fA-F]{0,6}$/.test(e.target.value) && onChange(e.target.value)} maxLength={7} spellCheck={false} />
        </div>
    </div>
);

export const ThemeCreator = () => {
    const [colors, setColors] = useState(DEFAULTS);
    const [copied, setCopied] = useState(false);

    const set = useCallback((key) => (val) => setColors(prev => ({ ...prev, [key]: val })), []);

    const theme = useMemo(() => deriveTheme(colors), [colors]);
    const css = useMemo(() => buildCss(colors, colors.name, colors.description), [colors]);

    const copy = async () => {
        await navigator.clipboard.writeText(css);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const reset = () => setColors(DEFAULTS);

    const previewStyle = {
        "--bg": theme.dark["--background"],
        "--terminal": theme.dark["--terminal"],
        "--lighter": theme.dark["--lighter-background"],
        "--primary": theme.dark["--primary"],
        "--text": theme.dark["--text"],
        "--subtext": theme.dark["--subtext"],
        "--primary-op": theme.dark["--primary-opacity"],
    };

    return (
        <div className="theme-creator">
            <div className="creator-header">
                <h2>Theme Creator</h2>
                <p>Design a custom Nexterm theme using the colour pickers below. Pick your core colours and everything else — backgrounds, opacities, OLED and light variants — is derived automatically. The live preview updates in real time so you can see exactly how your theme will look inside Nexterm before you export it.</p>
                <div className="creator-steps">
                    <div className="creator-step"><span className="step-num">1</span><span>Pick your background and accent colour</span></div>
                    <div className="creator-step"><span className="step-num">2</span><span>Adjust text, subtext and status colours</span></div>
                    <div className="creator-step"><span className="step-num">3</span><span>Copy the CSS and save as <code>my-theme.theme.css</code> in the themes folder</span></div>
                </div>
            </div>

            <div className="creator-body">
                <div className="creator-controls">
                    <div className="control-section">
                        <h3>Identity</h3>
                        <div className="text-field">
                            <label>Theme Name</label>
                            <input type="text" value={colors.name} onChange={e => set("name")(e.target.value)} placeholder="My Theme" />
                        </div>
                        <div className="text-field">
                            <label>Description</label>
                            <input type="text" value={colors.description} onChange={e => set("description")(e.target.value)} placeholder="A short description" />
                        </div>
                    </div>

                    <div className="control-section">
                        <h3>Core Colors</h3>
                        <ColorField label="Background" value={colors.background} onChange={set("background")} />
                        <ColorField label="Accent / Primary" value={colors.primary} onChange={set("primary")} />
                        <ColorField label="Text" value={colors.text} onChange={set("text")} />
                        <ColorField label="Subtext" value={colors.subtext} onChange={set("subtext")} />
                    </div>

                    <div className="control-section">
                        <h3>Status Colors</h3>
                        <ColorField label="Success" value={colors.success} onChange={set("success")} />
                        <ColorField label="Warning" value={colors.warning} onChange={set("warning")} />
                        <ColorField label="Error" value={colors.error} onChange={set("error")} />
                    </div>

                    <div className="creator-actions">
                        <button className="reset-btn" onClick={reset}>
                            <Icon path={mdiRefresh} />
                            <span>Reset</span>
                        </button>
                        <button className="copy-btn" onClick={copy}>
                            <Icon path={copied ? mdiCheck : mdiContentCopy} />
                            <span>{copied ? "Copied!" : "Copy CSS"}</span>
                        </button>
                    </div>
                </div>

                <div className="creator-right">
                    <div className="preview-panel" style={previewStyle}>
                        {/* Narrow icon rail */}
                        <div className="preview-icon-rail" style={{ background: theme.dark["--terminal"] }}>
                            <div className="preview-rail-logo" style={{ color: theme.dark["--primary"] }}>{">"}_</div>
                            {[0,1,2,3].map(i => (
                                <div key={i} className="preview-rail-icon" style={{ background: i === 0 ? theme.dark["--primary-opacity"] : "transparent", color: i === 0 ? theme.dark["--primary"] : theme.dark["--subtext"] }}>
                                    <div className="rail-icon-shape" />
                                </div>
                            ))}
                            <div className="preview-rail-bottom" style={{ color: theme.dark["--subtext"] }}>
                                <div className="rail-icon-shape small" />
                            </div>
                        </div>
                        {/* Server tree panel */}
                        <div className="preview-tree" style={{ background: theme.dark["--lighter-background"], borderColor: theme.dark["--dark-gray"] }}>
                            <div className="preview-topbar-tree" style={{ borderColor: theme.dark["--dark-gray"] }}>
                                <span style={{ color: theme.dark["--subtext"] }}>🔍</span>
                                <span style={{ color: theme.dark["--subtext"], fontSize: "0.6rem" }}>Search</span>
                            </div>
                            <div className="preview-group" style={{ color: theme.dark["--subtext"] }}>📁 Servers</div>
                            {["web-01","db-01"].map((s, i) => (
                                <div key={s} className="preview-server-row">
                                    <div className="preview-server-icon" style={{ background: theme.dark["--primary-opacity"] }}>
                                        <div style={{ width: "0.5rem", height: "0.35rem", borderRadius: "0.1rem", background: theme.dark["--primary"] }} />
                                    </div>
                                    <span style={{ color: theme.dark["--text"], fontSize: "0.65rem" }}>{s}</span>
                                    <div className="preview-dot-status" style={{ background: [theme.dark["--success"], theme.dark["--warning"]][i] }} />
                                </div>
                            ))}
                            <div className="preview-group" style={{ color: theme.dark["--subtext"] }}>📁 Homelab</div>
                            {["dev-box","media","vpn"].map((s, i) => (
                                <div key={s} className="preview-server-row">
                                    <div className="preview-server-icon" style={{ background: theme.dark["--primary-opacity"] }}>
                                        <div style={{ width: "0.5rem", height: "0.5rem", borderRadius: "50%", background: theme.dark["--primary"] }} />
                                    </div>
                                    <span style={{ color: theme.dark["--text"], fontSize: "0.65rem" }}>{s}</span>
                                    {i < 2 && <><div className="preview-dot-status" style={{ background: theme.dark["--success"] }} /><div className="preview-dot-status" style={{ background: theme.dark["--success"] }} /></>}
                                </div>
                            ))}
                        </div>
                        {/* Main welcome area */}
                        <div className="preview-main" style={{ background: theme.dark["--background"] }}>
                            <div className="preview-welcome">
                                <div className="preview-welcome-text">
                                    <span style={{ color: theme.dark["--text"], fontWeight: 700, fontSize: "0.9rem" }}>Hi, <span style={{ color: theme.dark["--primary"] }}>User</span>!</span>
                                    <span style={{ color: theme.dark["--subtext"], fontSize: "0.65rem" }}>Welcome to Nexterm.</span>
                                </div>
                                <div className="preview-welcome-btns">
                                    <div className="preview-btn" style={{ background: theme.dark["--primary-opacity"], color: theme.dark["--primary"], border: `1px solid ${theme.dark["--primary"]}` }}>↓ Download</div>
                                    <div className="preview-btn" style={{ background: theme.dark["--primary-opacity"], color: theme.dark["--primary"], border: `1px solid ${theme.dark["--primary"]}` }}>⌁ Connect</div>
                                </div>
                            </div>
                        </div>
                        {/* Recent connections */}
                        <div className="preview-recent" style={{ background: theme.dark["--lighter-background"], borderColor: theme.dark["--dark-gray"] }}>
                            <div className="preview-recent-title" style={{ color: theme.dark["--text"] }}>Recent Connections</div>
                            {["web-01","dev-box","media"].map((s, i) => (
                                <div key={s} className="preview-recent-row" style={{ borderColor: theme.dark["--dark-gray"] }}>
                                    <div className="preview-server-icon small" style={{ background: theme.dark["--primary-opacity"] }}>
                                        <div style={{ width: "0.4rem", height: "0.4rem", borderRadius: "50%", background: theme.dark["--primary"] }} />
                                    </div>
                                    <div className="preview-recent-info">
                                        <span style={{ color: theme.dark["--text"], fontSize: "0.65rem", fontWeight: 600 }}>{s}</span>
                                        <span style={{ color: theme.dark["--subtext"], fontSize: "0.55rem" }}>{["2m ago","1h ago","3d ago"][i]}</span>
                                    </div>
                                    <div className="preview-proto" style={{ background: theme.dark["--primary-opacity"], color: theme.dark["--primary"] }}>{["SSH","SSH","RDP"][i]}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="css-output">
                        <div className="css-output-header">
                            <span>Generated CSS — save as <code>{slug(colors.name) || "my-theme"}.theme.css</code></span>
                            <button className="copy-btn small" onClick={copy}>
                                <Icon path={copied ? mdiCheck : mdiContentCopy} />
                                <span>{copied ? "Copied!" : "Copy"}</span>
                            </button>
                        </div>
                        <pre className="css-pre">{css}</pre>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThemeCreator;
