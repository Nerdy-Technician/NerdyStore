import "./styles/main.sass";
import "./App.sass";
import { useEffect, useState, useCallback, useMemo } from "react";
import Icon from "@mdi/react";
import { mdiPackageVariant, mdiAdvertisements, mdiWeb, mdiMagnify, mdiScriptText, mdiLan, mdiPlayCircle, mdiCloud, mdiCodeBraces, mdiWrench, mdiApps, mdiDotsHorizontal, mdiChevronDown, mdiGamepadVariant, mdiConsoleLine, mdiPalette, mdiDocker, mdiStore, mdiHomeAutomation, mdiChartLine, mdiViewDashboard, mdiClipboardList, mdiBriefcase, mdiPencilRuler } from "@mdi/js";
import IconInput from "./components/IconInput";
import SelectBox from "./components/SelectBox";
import AppCard from "./components/AppCard";
import NextermCard from "./components/NextermCard";
import Loader from "./components/Loader";
import ServerUrlDialog from "./components/ServerUrlDialog";
import { loadCategoriesIndex, loadCategoryApps, loadNextermData, loadSourceName, loadStoreVersion } from "./utils/api";
import HomePage from "./components/HomePage";
import ThemeCreator from "./components/ThemeCreator";

const CATEGORY_ICONS = { scripts: mdiScriptText, networking: mdiLan, "media-servers": mdiPlayCircle, cloud: mdiCloud, development: mdiCodeBraces, utilities: mdiWrench, gaming: mdiGamepadVariant, all: mdiApps, other: mdiDotsHorizontal, "container-management": mdiDocker, "web-tools": mdiWeb, "ad-blockers": mdiAdvertisements, "home-automation": mdiHomeAutomation, monitoring: mdiChartLine, dashboard: mdiViewDashboard, inventory: mdiClipboardList, productivity: mdiBriefcase };
const NEXTERM_ICONS = { scripts: mdiScriptText, snippets: mdiCodeBraces, themes: mdiPalette };
const getCategoryIcon = (slug) => CATEGORY_ICONS[slug?.toLowerCase()] || mdiApps;
const getNextermIcon = (slug) => NEXTERM_ICONS[slug?.toLowerCase()] || mdiScriptText;

const SECTIONS = [
    { key: "nexploy", label: "Nexploy", icon: mdiPackageVariant },
    { key: "nexterm", label: "Nexterm", icon: mdiConsoleLine },
    { key: "tools", label: "Tools", icon: mdiPencilRuler },
];

const TOOLS = [
    { key: "theme-creator", label: "Theme Creator", icon: mdiPalette },
];

const parsePath = () => {
    // Handle GitHub Pages 404 redirect: /?path=/nexploy/monitoring
    const params = new URLSearchParams(window.location.search);
    const redirected = params.get("path");
    if (redirected) {
        window.history.replaceState(null, "", redirected);
    }
    const parts = window.location.pathname.replace(/^\//, "").split("/").filter(Boolean);
    return { section: parts[0] || null, sub: parts[1] || null };
};

const App = () => {
    const initialPath = parsePath();
    const [activeView, setActiveView] = useState(initialPath.section ? "store" : "home");
    const [activeSection, setActiveSection] = useState(initialPath.section || "nexploy");
    const [activeTool, setActiveTool] = useState(initialPath.sub || "theme-creator");
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [apps, setApps] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingApps, setLoadingApps] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("name");
    const [selectedApp, setSelectedApp] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [generatedAt, setGeneratedAt] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [appsCache, setAppsCache] = useState({});
    const [sourceName, setSourceName] = useState("official");
    const [storeVersion, setStoreVersion] = useState(null);

    const [nextermData, setNextermData] = useState(null);
    const [nextermCategory, setNextermCategory] = useState(null);
    const [loadingNexterm, setLoadingNexterm] = useState(true);
    const [nextermSearch, setNextermSearch] = useState("");
    const [nextermSubcat, setNextermSubcat] = useState(null);

    const baseUrl = "/";

    useEffect(() => {
        loadSourceName(baseUrl).then(setSourceName).catch(() => {});
        loadStoreVersion(baseUrl).then((data) => setStoreVersion(data?.version || null)).catch(() => {});
        loadCategoriesIndex(baseUrl).then((data) => {
            setCategories(data.categories);
            setGeneratedAt(data.generatedAt);
            const { section, sub } = parsePath();
            const match = sub && data.categories.find(c => c.slug === sub);
            setSelectedCategory(match || data.categories[0]);
            setLoadingCategories(false);
        }).catch((err) => { setError(err.message); setLoadingCategories(false); });

        loadNextermData(baseUrl).then((data) => {
            setNextermData(data);
            const { section, sub } = parsePath();
            const match = section === "nexterm" && sub && data.categories.find(c => c.slug === sub);
            setNextermCategory(match ? match.slug : data.categories[0]?.slug);
            setLoadingNexterm(false);
        }).catch(() => { setLoadingNexterm(false); });
    }, [baseUrl]);

    const loadAppsForCategory = useCallback(async (category) => {
        if (!category) return;
        if (appsCache[category.slug]) { setApps(appsCache[category.slug]); return; }
        setLoadingApps(true);
        try {
            const data = await loadCategoryApps(baseUrl, category.slug);
            setApps(data.apps);
            setAppsCache(prev => ({...prev, [category.slug]: data.apps}));
        } catch (err) { setError(err.message); }
        finally { setLoadingApps(false); }
    }, [appsCache, baseUrl]);

    useEffect(() => { if (selectedCategory) loadAppsForCategory(selectedCategory); }, [selectedCategory, loadAppsForCategory]);

    useEffect(() => {
        const handleClick = (e) => { if (mobileMenuOpen && !e.target.closest('.category-dropdown')) setMobileMenuOpen(false); };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [mobileMenuOpen]);

    const navigate = useCallback((section, sub) => {
        const path = sub ? `/${section}/${sub}` : `/${section}`;
        window.history.pushState(null, "", path);
    }, []);

    const handleBrowse = (section) => {
        if (section) { setActiveSection(section); navigate(section); }
        setActiveView("store");
    };
    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        setMobileMenuOpen(false);
        setActiveView("store");
        navigate("nexploy", category.slug);
    };

    useEffect(() => {
        const onPop = () => {
            const { section, sub } = parsePath();
            if (section) { setActiveSection(section); setActiveView("store"); if (sub) setActiveTool(sub); }
            else setActiveView("home");
        };
        window.addEventListener("popstate", onPop);
        return () => window.removeEventListener("popstate", onPop);
    }, []);
    const sortOptions = [{ label: "Name (A-Z)", value: "name" }, { label: "Name (Z-A)", value: "name-desc" }, { label: "Version", value: "version" }];

    const filteredAndSortedApps = useMemo(() => {
        let result = [...apps];
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(app => app.name.toLowerCase().includes(q) || app.description?.toLowerCase().includes(q));
        }
        result.sort((a, b) => sortBy === "name" ? a.name.localeCompare(b.name) : sortBy === "name-desc" ? b.name.localeCompare(a.name) : b.version.localeCompare(a.version));
        return result;
    }, [apps, searchQuery, sortBy]);

    const nextermSubcats = useMemo(() => {
        if (!nextermData || !nextermCategory) return [];
        const items = nextermData.items[nextermCategory]?.items || [];
        const seen = new Set();
        items.forEach(i => { if (i.subcategory) seen.add(i.subcategory); });
        return [...seen].sort();
    }, [nextermData, nextermCategory]);

    const filteredNextermItems = useMemo(() => {
        if (!nextermData || !nextermCategory) return [];
        const items = nextermData.items[nextermCategory]?.items || [];
        let result = items;
        if (nextermSubcat) result = result.filter(i => i.subcategory === nextermSubcat);
        if (nextermSearch) {
            const q = nextermSearch.toLowerCase();
            result = result.filter(item => item.name.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q));
        }
        return result;
    }, [nextermData, nextermCategory, nextermSearch, nextermSubcat]);

    const currentNextermCategoryName = nextermData?.categories.find(c => c.slug === nextermCategory)?.name || "All";

    if (loadingCategories && loadingNexterm) return <div className="app-loading"><Loader size="large" /></div>;
    if (error) return <div className="app-error"><p>Error: {error}</p></div>;

    return (
        <div className="store-layout">
            <aside className="store-sidebar">
                <div className="sidebar-header" onClick={() => setActiveView("home")} style={{ cursor: "pointer" }}>
                    <div className="sidebar-logo"><Icon path={mdiStore} /></div>
                    <div className="sidebar-title"><h1>NerdyStore</h1><p>3rd party source</p></div>
                </div>

                <div className="sidebar-sections">
                    {SECTIONS.map((section) => (
                        <button key={section.key} className={`section-btn${activeSection === section.key ? ' active' : ''}`} onClick={() => { setActiveSection(section.key); setActiveView("store"); navigate(section.key); }}>
                            <Icon path={section.icon} className="section-icon" />
                            <span>{section.label}</span>
                        </button>
                    ))}
                </div>

                {activeSection === "nexploy" ? (
                    <nav className="sidebar-nav">
                        <div className="nav-label">Categories</div>
                        {categories.map((cat) => (
                            <button key={cat.slug} className={`nav-item${selectedCategory?.slug === cat.slug ? ' active' : ''}`} onClick={() => handleCategoryChange(cat)}>
                                <Icon path={getCategoryIcon(cat.slug)} className="nav-icon" />
                                <span className="nav-text">{cat.name}</span>
                                <span className="nav-count">{cat.count}</span>
                            </button>
                        ))}
                    </nav>
                ) : activeSection === "nexterm" ? (
                    <nav className="sidebar-nav">
                        <div className="nav-label">Categories</div>
                        {nextermData?.categories.map((cat) => (
                            <button key={cat.slug} className={`nav-item${nextermCategory === cat.slug ? ' active' : ''}`} onClick={() => { setNextermCategory(cat.slug); setNextermSubcat(null); setActiveView("store"); navigate("nexterm", cat.slug); }}>
                                <Icon path={getNextermIcon(cat.slug)} className="nav-icon" />
                                <span className="nav-text">{cat.name}</span>
                                <span className="nav-count">{cat.count}</span>
                            </button>
                        ))}
                    </nav>
                ) : activeSection === "tools" ? (
                    <nav className="sidebar-nav">
                        <div className="nav-label">Tools</div>
                        {TOOLS.map((tool) => (
                            <button key={tool.key} className={`nav-item${activeTool === tool.key ? ' active' : ''}`} onClick={() => { setActiveTool(tool.key); setActiveView("store"); navigate("tools", tool.key); }}>
                                <Icon path={tool.icon} className="nav-icon" />
                                <span className="nav-text">{tool.label}</span>
                            </button>
                        ))}
                    </nav>
                ) : null}

                <a className="sidebar-github" href="https://github.com/Nerdy-Technician/NerdyStore" target="_blank" rel="noopener noreferrer">
                    <svg className="github-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" fill="currentColor"/>
                    </svg>
                    <div className="github-info">
                        <span className="github-name">NerdyStore</span>
                        <span className="github-version">{storeVersion ? `v${storeVersion}` : "GitHub"}</span>
                    </div>
                    <svg className="github-arrow" viewBox="0 0 24 24"><path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z" fill="currentColor"/></svg>
                </a>
            </aside>
            <main className="store-main">
                <header className="mobile-header">
                    <div className="mobile-brand"><Icon path={mdiPackageVariant} /><span>NerdyStore</span></div>
                    <div className="mobile-sections">
                        {SECTIONS.map((section) => (
                            <button key={section.key} className={`mobile-section-btn${activeSection === section.key ? ' active' : ''}`} onClick={() => { setActiveSection(section.key); setActiveView("store"); }}>
                                <Icon path={section.icon} /><span>{section.label}</span>
                            </button>
                        ))}
                    </div>
                    <div className="category-dropdown">
                        {activeSection === "nexploy" ? (
                            <>
                                <button className={`dropdown-trigger${mobileMenuOpen ? ' open' : ''}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                                    <Icon path={getCategoryIcon(selectedCategory?.slug)} className="trigger-icon" />
                                    <span>{selectedCategory?.name}</span>
                                    <Icon path={mdiChevronDown} className="chevron" />
                                </button>
                                {mobileMenuOpen && (
                                    <div className="dropdown-menu">
                                        {categories.map((cat) => (
                                            <button key={cat.slug} className={`dropdown-item${selectedCategory?.slug === cat.slug ? ' active' : ''}`} onClick={() => handleCategoryChange(cat)}>
                                                <Icon path={getCategoryIcon(cat.slug)} />
                                                <span className="item-text">{cat.name}</span>
                                                <span className="item-count">{cat.count}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <button className={`dropdown-trigger${mobileMenuOpen ? ' open' : ''}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                                    <Icon path={getNextermIcon(nextermCategory)} className="trigger-icon" />
                                    <span>{currentNextermCategoryName}</span>
                                    <Icon path={mdiChevronDown} className="chevron" />
                                </button>
                                {mobileMenuOpen && (
                                    <div className="dropdown-menu">
                                        {nextermData?.categories.map((cat) => (
                                            <button key={cat.slug} className={`dropdown-item${nextermCategory === cat.slug ? ' active' : ''}`} onClick={() => { setNextermCategory(cat.slug); setMobileMenuOpen(false); }}>
                                                <Icon path={getNextermIcon(cat.slug)} />
                                                <span className="item-text">{cat.name}</span>
                                                <span className="item-count">{cat.count}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </header>

                {activeView === "home" ? (
                    <HomePage categories={categories} nextermData={nextermData} onBrowse={handleBrowse} />
                ) : activeSection === "tools" ? (
                    <div className="store-content">
                        <div className="content-header"><h2>{TOOLS.find(t => t.key === activeTool)?.label || "Tools"}</h2></div>
                        {activeTool === "theme-creator" && <ThemeCreator />}
                    </div>
                ) : activeSection === "nexploy" ? (
                    <div className="store-content">
                        <div className="content-header">
                            <h2>{selectedCategory?.name || "Apps"}</h2>
                            <span className="app-count">{filteredAndSortedApps.length} {filteredAndSortedApps.length === 1 ? 'app' : 'apps'}</span>
                        </div>
                        <div className="store-filters">
                            <div className="search-wrapper"><IconInput type="text" placeholder="Search apps..." icon={mdiMagnify} value={searchQuery} setValue={setSearchQuery} /></div>
                            <div className="sort-wrapper"><SelectBox options={sortOptions} selected={sortBy} setSelected={setSortBy} /></div>
                        </div>
                        <div className="store-results">
                            {loadingApps ? <div className="loading-container"><Loader size="medium" /></div> : filteredAndSortedApps.length > 0 ? (
                                <div className="apps-grid">
                                    {filteredAndSortedApps.map((app) => <AppCard key={app.id} app={app} baseUrl={baseUrl} onClick={() => { setSelectedApp(app); setDialogOpen(true); }} />)}
                                </div>
                            ) : <div className="no-results"><Icon path={mdiMagnify} /><h3>No apps found</h3><p>Try adjusting your search</p></div>}
                        </div>
                    </div>
                ) : (
                    <div className="store-content">
                        <div className="content-header">
                            <h2>{currentNextermCategoryName}</h2>
                            <span className="app-count">{filteredNextermItems.length} {filteredNextermItems.length === 1 ? 'item' : 'items'}</span>
                        </div>
                        <div className="store-filters">
                            <div className="search-wrapper"><IconInput type="text" placeholder="Search items..." icon={mdiMagnify} value={nextermSearch} setValue={setNextermSearch} /></div>
                        </div>
                        {nextermSubcats.length > 0 && (
                            <div className="subcat-filters">
                                <button className={`subcat-pill${!nextermSubcat ? ' active' : ''}`} onClick={() => setNextermSubcat(null)}>All</button>
                                {nextermSubcats.map(s => (
                                    <button key={s} className={`subcat-pill${nextermSubcat === s ? ' active' : ''}`} onClick={() => setNextermSubcat(s)}>{s}</button>
                                ))}
                            </div>
                        )}
                        <div className="store-results">
                            {loadingNexterm ? <div className="loading-container"><Loader size="medium" /></div> : filteredNextermItems.length > 0 ? (
                                <div className="apps-grid">
                                    {filteredNextermItems.map((item) => <NextermCard key={item.id} item={item} />)}
                                </div>
                            ) : <div className="no-results"><Icon path={mdiMagnify} /><h3>No items found</h3><p>Try adjusting your search</p></div>}
                        </div>
                    </div>
                )}

                <footer className="store-footer">
                    <div className="footer-info">
                        <span className="footer-copyright"><a href="https://nerdytech.dev/" target="_blank" rel="noopener noreferrer">NerdyTech</a> </span>
                        {generatedAt && <span className="footer-generated">Updated {new Date(generatedAt).toLocaleDateString()}</span>}
                    </div>
                </footer>
            </main>
            <ServerUrlDialog open={dialogOpen} onClose={() => { setDialogOpen(false); setSelectedApp(null); }} app={selectedApp} sourceName={sourceName} />
        </div>
    );
};

export default App;
