import "./styles/main.sass";
import "./App.sass";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Icon } from "@mdi/react";
import { mdiPackageVariant, mdiAdvertisements, mdiWeb, mdiMagnify, mdiScriptText, mdiLan, mdiPlayCircle, mdiCloud, mdiCodeBraces, mdiWrench, mdiApps, mdiDotsHorizontal, mdiChevronDown, mdiGamepadVariant, mdiConsoleLine, mdiPalette, mdiDocker, mdiStore, mdiHomeAutomation, mdiChartLine, mdiViewDashboard, mdiClipboardList, mdiBriefcase, mdiPencilRuler, mdiClose, mdiServer, mdiLinkVariant } from "@mdi/js";
import IconInput from "./components/IconInput";
import SelectBox from "./components/SelectBox";
import AppCard from "./components/AppCard";
import NextermCard from "./components/NextermCard";
import Loader from "./components/Loader";
import ServerUrlDialog from "./components/ServerUrlDialog";
import { loadCategoriesIndex, loadCategoryApps, loadNextermData, loadSourceName, loadStoreVersion } from "./utils/api";
import { DEFAULT_SOURCE_NAME, buildNexployDeployUrl, readSavedServerUrl, serverLabel } from "./utils/deployLink";
import HomePage from "./components/HomePage";
import ThemeCreator from "./components/ThemeCreator";
import NotFound from "./components/NotFound";
import { matchesQuery, appSearchFields, nextermSearchFields } from "./utils/search";
import { ALL_PLATFORMS, matchesPlatform, platformOptions } from "./utils/platforms";
import { appInStack, groupByStackRole } from "./utils/stacks";

const CATEGORY_ICONS = { scripts: mdiScriptText, networking: mdiLan, "media-servers": mdiPlayCircle, cloud: mdiCloud, development: mdiCodeBraces, utilities: mdiWrench, gaming: mdiGamepadVariant, all: mdiApps, other: mdiDotsHorizontal, "container-management": mdiDocker, "web-tools": mdiWeb, "ad-blockers": mdiAdvertisements, "home-automation": mdiHomeAutomation, monitoring: mdiChartLine, dashboard: mdiViewDashboard, inventory: mdiClipboardList, productivity: mdiBriefcase };
const NEXTERM_ICONS = { all: mdiApps, scripts: mdiScriptText, snippets: mdiCodeBraces, themes: mdiPalette };
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

const KNOWN_SECTIONS = ["nexploy", "nexterm", "tools"];
const ALL_APPS = { name: "All apps", slug: "all" };
const ALL_NEXTERM = "all";

const parsePath = () => {
    // Handle GitHub Pages 404 redirect: /?path=/nexploy/monitoring
    const params = new URLSearchParams(window.location.search);
    const redirected = params.get("path");
    if (redirected) {
        window.history.replaceState(null, "", redirected);
    }
    const parts = window.location.pathname.replace(/^\//, "").split("/").filter(Boolean);
    const section = parts[0] || null;
    const known = !section || KNOWN_SECTIONS.includes(section);
    return { section: known ? section : null, sub: parts[1] || null, notFound: !known || parts.length > 2 };
};

const App = () => {
    const initialPath = parsePath();
    const [activeView, setActiveView] = useState(initialPath.notFound ? "notfound" : initialPath.section ? "store" : "home");
    const [notFoundPath, setNotFoundPath] = useState(initialPath.notFound ? window.location.pathname : null);
    const [activeSection, setActiveSection] = useState(initialPath.section || "nexploy");
    const [activeTool, setActiveTool] = useState(initialPath.sub || "theme-creator");
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [allApps, setAllApps] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingApps, setLoadingApps] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("name");
    const [selectedApp, setSelectedApp] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [generatedAt, setGeneratedAt] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [sourceName, setSourceName] = useState(DEFAULT_SOURCE_NAME);
    const [deployServer, setDeployServer] = useState(readSavedServerUrl);
    const [storeVersion, setStoreVersion] = useState(null);

    const [nextermData, setNextermData] = useState(null);
    const [nextermCategory, setNextermCategory] = useState(null);
    const [loadingNexterm, setLoadingNexterm] = useState(true);
    const [nextermSearch, setNextermSearch] = useState("");
    const [nextermSubcat, setNextermSubcat] = useState(null);
    const [appPlatform, setAppPlatform] = useState(ALL_PLATFORMS);
    const [stacks, setStacks] = useState([]);
    const [activeStack, setActiveStack] = useState(() => new URLSearchParams(window.location.search).get("stack"));
    const [nextermPlatform, setNextermPlatform] = useState(ALL_PLATFORMS);

    const baseUrl = "/";

    useEffect(() => {
        loadSourceName(baseUrl).then(setSourceName).catch(() => {});
        loadStoreVersion(baseUrl).then((data) => setStoreVersion(data?.version || null)).catch(() => {});
        loadCategoriesIndex(baseUrl).then((data) => {
            setCategories(data.categories);
            setStacks(data.stacks || []);
            setGeneratedAt(data.generatedAt);
            const { section, sub } = parsePath();
            const match = section === "nexploy" && sub && data.categories.find(c => c.slug === sub);
            if (section === "nexploy" && sub && sub !== ALL_APPS.slug && !match) { setNotFoundPath(window.location.pathname); setActiveView("notfound"); }
            setSelectedCategory(match || ALL_APPS);
            setLoadingCategories(false);
            Promise.all(data.categories.map((cat) => loadCategoryApps(baseUrl, cat.slug).then((d) => d.apps.map((app) => ({ ...app, categorySlug: cat.slug })))))
                .then((lists) => setAllApps(lists.flat()))
                .catch((err) => setError(err.message))
                .finally(() => setLoadingApps(false));
        }).catch((err) => { setError(err.message); setLoadingCategories(false); });

        loadNextermData(baseUrl).then((data) => {
            setNextermData(data);
            const { section, sub } = parsePath();
            const match = section === "nexterm" && sub && data.categories.find(c => c.slug === sub);
            if (section === "nexterm" && sub && sub !== ALL_NEXTERM && !match) { setNotFoundPath(window.location.pathname); setActiveView("notfound"); }
            setNextermCategory(match ? match.slug : ALL_NEXTERM);
            setLoadingNexterm(false);
        }).catch(() => { setLoadingNexterm(false); });
    }, [baseUrl]);

    useEffect(() => {
        const handleClick = (e) => { if (mobileMenuOpen && !e.target.closest('.category-dropdown')) setMobileMenuOpen(false); };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [mobileMenuOpen]);

    const navigate = useCallback((section, sub) => {
        if (typeof section !== "string" || (sub != null && typeof sub !== "string")) return;
        const path = sub ? `/${section}/${sub}` : `/${section}`;
        window.history.pushState(null, "", path);
    }, []);

    const handleBrowse = (section) => {
        const target = typeof section === "string" && KNOWN_SECTIONS.includes(section) ? section : "nexploy";
        setActiveSection(target); navigate(target);
        setActiveView("store");
    };
    const handleDeploy = (app) => {
        setSelectedApp(app);
        setDialogOpen(true);
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        setMobileMenuOpen(false);
        setActiveView("store");
        navigate("nexploy", category.slug === ALL_APPS.slug ? undefined : category.slug);
    };

    useEffect(() => {
        const onPop = () => {
            const { section, sub, notFound } = parsePath();
            if (notFound) { setNotFoundPath(window.location.pathname); setActiveView("notfound"); }
            else if (section) {
                setActiveSection(section); setActiveView("store");
                if (section === "tools" && sub) setActiveTool(sub);
                if (section === "nexploy") setSelectedCategory(categories.find(c => c.slug === sub) || ALL_APPS);
                if (section === "nexterm") { setNextermCategory(sub || ALL_NEXTERM); setNextermSubcat(null); }
            }
            else setActiveView("home");
        };
        window.addEventListener("popstate", onPop);
        return () => window.removeEventListener("popstate", onPop);
    }, [categories]);

    const goHome = () => { window.history.pushState(null, "", "/"); setActiveView("home"); };
    const sortOptions = [{ label: "Name (A-Z)", value: "name" }, { label: "Name (Z-A)", value: "name-desc" }, { label: "Version", value: "version" }];

    const nexployCategories = useMemo(() => [{ ...ALL_APPS, count: allApps.length }, ...categories], [categories, allApps.length]);

    const appPlatforms = useMemo(() => platformOptions(allApps), [allApps]);
    const currentStack = useMemo(() => stacks.find((s) => s.slug === activeStack) || null, [stacks, activeStack]);
    const searchedApps = useMemo(() => allApps.filter((app) => matchesPlatform(app, appPlatform) && (!currentStack || appInStack(app, currentStack.slug)) && matchesQuery(appSearchFields(app), searchQuery)), [allApps, searchQuery, appPlatform, currentStack]);
    const toggleStack = (slug) => {
        const next = activeStack === slug ? null : slug;
        setActiveStack(next);
        const url = new URL(window.location.href);
        if (next) url.searchParams.set("stack", next); else url.searchParams.delete("stack");
        window.history.replaceState(null, "", url.pathname + url.search);
    };

    const appMatchCounts = useMemo(() => {
        const counts = { [ALL_APPS.slug]: searchedApps.length };
        searchedApps.forEach((app) => { counts[app.categorySlug] = (counts[app.categorySlug] || 0) + 1; });
        return counts;
    }, [searchedApps]);

    const filteredAndSortedApps = useMemo(() => {
        const slug = selectedCategory?.slug || ALL_APPS.slug;
        let result = slug === ALL_APPS.slug ? [...searchedApps] : searchedApps.filter((app) => app.categorySlug === slug);
        result.sort((a, b) => sortBy === "name" ? a.name.localeCompare(b.name) : sortBy === "name-desc" ? b.name.localeCompare(a.name) : b.version.localeCompare(a.version));
        return result;
    }, [searchedApps, selectedCategory, sortBy]);

    const stackGroups = useMemo(() => groupByStackRole(currentStack, filteredAndSortedApps), [currentStack, filteredAndSortedApps]);
    const nexployFiltered = Boolean(searchQuery.trim()) || appPlatform !== ALL_PLATFORMS || Boolean(currentStack) || (selectedCategory && selectedCategory.slug !== ALL_APPS.slug);
    const clearNexployFilters = () => { if (activeStack) toggleStack(activeStack); setSearchQuery(""); setAppPlatform(ALL_PLATFORMS); setSelectedCategory(ALL_APPS); navigate("nexploy"); };

    const allNextermItems = useMemo(() => nextermData ? Object.values(nextermData.items).flatMap((group) => group.items) : [], [nextermData]);

    const nextermCategories = useMemo(() => nextermData ? [{ name: "All", slug: ALL_NEXTERM, count: allNextermItems.length }, ...nextermData.categories] : [], [nextermData, allNextermItems.length]);

    const nextermCategoryItems = useMemo(() => {
        if (!nextermData || !nextermCategory) return [];
        return nextermCategory === ALL_NEXTERM ? allNextermItems : nextermData.items[nextermCategory]?.items || [];
    }, [nextermData, nextermCategory, allNextermItems]);

    const nextermSubcats = useMemo(() => {
        const items = nextermCategoryItems;
        const seen = new Set();
        items.forEach(i => { if (i.subcategory) seen.add(i.subcategory); });
        return [...seen].sort();
    }, [nextermCategoryItems]);

    const nextermMatchCounts = useMemo(() => {
        const counts = { [ALL_NEXTERM]: 0 };
        allNextermItems.forEach((item) => {
            if (!matchesPlatform(item, nextermPlatform)) return;
            if (!matchesQuery(nextermSearchFields(item), nextermSearch)) return;
            counts[ALL_NEXTERM]++;
            counts[item.category] = (counts[item.category] || 0) + 1;
        });
        return counts;
    }, [allNextermItems, nextermSearch, nextermPlatform]);

    const nextermPlatforms = useMemo(() => platformOptions(allNextermItems), [allNextermItems]);

    const filteredNextermItems = useMemo(() => {
        let result = nextermCategoryItems;
        if (nextermSubcat) result = result.filter(i => i.subcategory === nextermSubcat);
        return result.filter((item) => matchesPlatform(item, nextermPlatform) && matchesQuery(nextermSearchFields(item), nextermSearch));
    }, [nextermCategoryItems, nextermSearch, nextermSubcat, nextermPlatform]);

    const nextermFiltered = Boolean(nextermSearch.trim()) || nextermPlatform !== ALL_PLATFORMS || nextermCategory !== ALL_NEXTERM || Boolean(nextermSubcat);
    const selectNextermCategory = (slug) => { setNextermCategory(slug); setNextermSubcat(null); setMobileMenuOpen(false); setActiveView("store"); navigate("nexterm", slug === ALL_NEXTERM ? undefined : slug); };
    const clearNextermFilters = () => { setNextermSearch(""); setNextermPlatform(ALL_PLATFORMS); selectNextermCategory(ALL_NEXTERM); };

    const currentNextermCategoryName = nextermCategories.find(c => c.slug === nextermCategory)?.name || "All";

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
                        {nexployCategories.map((cat) => (
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
                        {nextermCategories.map((cat) => (
                            <button key={cat.slug} className={`nav-item${nextermCategory === cat.slug ? ' active' : ''}`} onClick={() => selectNextermCategory(cat.slug)}>
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
                                        {nexployCategories.map((cat) => (
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
                                        {nextermCategories.map((cat) => (
                                            <button key={cat.slug} className={`dropdown-item${nextermCategory === cat.slug ? ' active' : ''}`} onClick={() => selectNextermCategory(cat.slug)}>
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

                {activeView === "notfound" ? (
                    <NotFound path={notFoundPath || window.location.pathname} onHome={goHome} onBrowse={handleBrowse} />
                ) : activeView === "home" ? (
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
                            <div className="header-actions">
                                <button type="button" className="deploy-target" onClick={() => { setSelectedApp(null); setDialogOpen(true); }}>
                                    <Icon path={mdiServer} />
                                    <span>{deployServer ? serverLabel(deployServer) : "Set Nexploy server"}</span>
                                </button>
                                <span className="app-count">{filteredAndSortedApps.length} {filteredAndSortedApps.length === 1 ? 'app' : 'apps'}</span>
                            </div>
                        </div>
                        <div className="store-filters">
                            <div className="search-wrapper"><IconInput type="text" placeholder="Search apps by name, description or category…" icon={mdiMagnify} value={searchQuery} setValue={setSearchQuery} /></div>
                            <div className="sort-wrapper"><SelectBox options={sortOptions} selected={sortBy} setSelected={setSortBy} /></div>
                        </div>
                        <div className="subcat-filters" role="group" aria-label="Filter apps by category">
                            {nexployCategories.map((cat) => (
                                <button key={cat.slug} className={`subcat-pill${(selectedCategory?.slug || ALL_APPS.slug) === cat.slug ? ' active' : ''}`} onClick={() => handleCategoryChange(cat)}>
                                    {cat.name} ({appMatchCounts[cat.slug] || 0})
                                </button>
                            ))}
                            {nexployFiltered && <button className="subcat-pill clear-filters" onClick={clearNexployFilters}><Icon path={mdiClose} size={0.6} /> Clear filters</button>}
                        </div>
                        {appPlatforms.length > 0 && (
                            <div className="subcat-filters platform-filters" role="group" aria-label="Filter apps by platform">
                                <span className="filter-label">Platform</span>
                                <button className={`subcat-pill${appPlatform === ALL_PLATFORMS ? ' active' : ''}`} aria-pressed={appPlatform === ALL_PLATFORMS} onClick={() => setAppPlatform(ALL_PLATFORMS)}>Any</button>
                                {appPlatforms.map((p) => (
                                    <button key={p.slug} className={`subcat-pill${appPlatform === p.slug ? ' active' : ''}`} aria-pressed={appPlatform === p.slug} onClick={() => setAppPlatform(p.slug)}>{p.name} ({p.count})</button>
                                ))}
                            </div>
                        )}
                        {stacks.length > 0 && (
                            <div className="subcat-filters stack-filters" role="group" aria-label="Filter apps by stack">
                                <span className="filter-label">Stack</span>
                                {stacks.map((s) => (
                                    <button key={s.slug} className={`subcat-pill stack-pill${activeStack === s.slug ? ' active' : ''}`} aria-pressed={activeStack === s.slug} onClick={() => toggleStack(s.slug)}>
                                        <Icon path={mdiLinkVariant} size={0.6} /> {s.badge} ({s.count})
                                    </button>
                                ))}
                            </div>
                        )}
                        {currentStack && !loadingApps && (
                            <div className="stack-intro">
                                <h3>{currentStack.name} stack</h3>
                                <p>{currentStack.description}{currentStack.url && <> <a href={currentStack.url} target="_blank" rel="noopener noreferrer">Learn more</a></>}</p>
                            </div>
                        )}
                        <div className="store-results">
                            {currentStack && !loadingApps && stackGroups.length > 0 ? stackGroups.map((group) => (
                                <section key={group.name} className="stack-group">
                                    <h4 className="stack-group-title">{group.name} <span>{group.apps.length}</span></h4>
                                    <div className="apps-grid">
                                        {group.apps.map((app) => (
                                            <AppCard key={app.id} app={app} baseUrl={baseUrl} deployUrl={buildNexployDeployUrl(deployServer, sourceName, app.slug || app.id)} onDeploy={() => handleDeploy(app)} />
                                        ))}
                                    </div>
                                </section>
                            )) : loadingApps ? <div className="loading-container"><Loader size="medium" /></div> : filteredAndSortedApps.length > 0 ? (
                                <div className="apps-grid">
                                    {filteredAndSortedApps.map((app) => (
                                        <AppCard key={app.id} app={app} baseUrl={baseUrl} deployUrl={buildNexployDeployUrl(deployServer, sourceName, app.slug || app.id)} onDeploy={() => handleDeploy(app)} />
                                    ))}
                                </div>
                            ) : <div className="no-results"><Icon path={mdiMagnify} /><h3>No apps found</h3><p>Try a different search or category</p>{nexployFiltered && <div className="subcat-filters"><button className="subcat-pill active" onClick={clearNexployFilters}>Clear filters</button></div>}</div>}
                        </div>
                    </div>
                ) : (
                    <div className="store-content">
                        <div className="content-header">
                            <h2>{currentNextermCategoryName}</h2>
                            <span className="app-count">{filteredNextermItems.length} {filteredNextermItems.length === 1 ? 'item' : 'items'}</span>
                        </div>
                        <div className="store-filters">
                            <div className="search-wrapper"><IconInput type="text" placeholder="Search scripts, snippets and themes…" icon={mdiMagnify} value={nextermSearch} setValue={setNextermSearch} /></div>
                        </div>
                        <div className="subcat-filters" role="group" aria-label="Filter Nexterm items by category">
                            {nextermCategories.map((cat) => (
                                <button key={cat.slug} className={`subcat-pill${nextermCategory === cat.slug ? ' active' : ''}`} onClick={() => selectNextermCategory(cat.slug)}>
                                    {cat.name} ({nextermMatchCounts[cat.slug] || 0})
                                </button>
                            ))}
                            {nextermFiltered && <button className="subcat-pill clear-filters" onClick={clearNextermFilters}><Icon path={mdiClose} size={0.6} /> Clear filters</button>}
                        </div>
                        {nextermPlatforms.length > 0 && (
                            <div className="subcat-filters platform-filters" role="group" aria-label="Filter Nexterm items by platform">
                                <span className="filter-label">Platform</span>
                                <button className={`subcat-pill${nextermPlatform === ALL_PLATFORMS ? ' active' : ''}`} aria-pressed={nextermPlatform === ALL_PLATFORMS} onClick={() => setNextermPlatform(ALL_PLATFORMS)}>Any</button>
                                {nextermPlatforms.map((p) => (
                                    <button key={p.slug} className={`subcat-pill${nextermPlatform === p.slug ? ' active' : ''}`} aria-pressed={nextermPlatform === p.slug} onClick={() => setNextermPlatform(p.slug)}>{p.name} ({p.count})</button>
                                ))}
                            </div>
                        )}
                        {nextermSubcats.length > 0 && (
                            <div className="subcat-filters">
                                <button className={`subcat-pill${!nextermSubcat ? ' active' : ''}`} onClick={() => setNextermSubcat(null)}>All folders</button>
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
                            ) : <div className="no-results"><Icon path={mdiMagnify} /><h3>No items found</h3><p>Try a different search or category</p>{nextermFiltered && <div className="subcat-filters"><button className="subcat-pill active" onClick={clearNextermFilters}>Clear filters</button></div>}</div>}
                        </div>
                    </div>
                )}

                <footer className="store-footer">
                    <div className="footer-links">
                        <a rel="me noopener noreferrer" href="https://masto.nerdy-technician.social/@Roffo" target="_blank">Mastodon</a>
                        <span className="footer-separator">/</span>
                        <a href="https://nerdytech.dev/" target="_blank" rel="noopener noreferrer">Portfolio</a>
                        <span className="footer-separator">/</span>
                        <a href="https://nerdytech.dev/docs/NerdyStore/" target="_blank" rel="noopener noreferrer">Docs</a>
                    </div>
                    <div className="footer-info">
                        <span className="footer-copyright">NerdyTech</span>
                        {generatedAt && <span className="footer-generated">Updated {new Date(generatedAt).toLocaleDateString()}</span>}
                    </div>
                </footer>
            </main>
            {dialogOpen && <ServerUrlDialog open onClose={() => { setDialogOpen(false); setSelectedApp(null); }} app={selectedApp} sourceName={sourceName} onSaved={setDeployServer} />}
        </div>
    );
};

export default App;
