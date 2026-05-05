import "./styles/main.sass";
import "./App.sass";
import { useEffect, useState, useCallback, useMemo } from "react";
import Icon from "@mdi/react";
import { mdiPackageVariant, mdiAdvertisements, mdiWeb, mdiMagnify, mdiScriptText, mdiLan, mdiPlayCircle, mdiCloud, mdiCodeBraces, mdiWrench, mdiApps, mdiDotsHorizontal, mdiChevronDown, mdiGamepadVariant, mdiConsoleLine, mdiPalette, mdiDocker } from "@mdi/js";
import IconInput from "./components/IconInput";
import SelectBox from "./components/SelectBox";
import AppCard from "./components/AppCard";
import NextermCard from "./components/NextermCard";
import Loader from "./components/Loader";
import ServerUrlDialog from "./components/ServerUrlDialog";
import { loadCategoriesIndex, loadCategoryApps, loadNextermData, loadSourceName } from "./utils/api";

const CATEGORY_ICONS = { scripts: mdiScriptText, networking: mdiLan, media: mdiPlayCircle, cloud: mdiCloud, development: mdiCodeBraces, utilities: mdiWrench, gaming: mdiGamepadVariant, all: mdiApps, other: mdiDotsHorizontal, "container-management": mdiDocker, web: mdiWeb, "ad-blockers": mdiAdvertisements };
const NEXTERM_ICONS = { scripts: mdiScriptText, snippets: mdiCodeBraces, themes: mdiPalette };
const getCategoryIcon = (slug) => CATEGORY_ICONS[slug?.toLowerCase()] || mdiApps;
const getNextermIcon = (slug) => NEXTERM_ICONS[slug?.toLowerCase()] || mdiScriptText;

const SECTIONS = [
    { key: "nexploy", label: "Nexploy", icon: mdiPackageVariant },
    { key: "nexterm", label: "Nexterm", icon: mdiConsoleLine },
];

const App = () => {
    const [activeSection, setActiveSection] = useState("nexploy");
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

    const [nextermData, setNextermData] = useState(null);
    const [nextermCategory, setNextermCategory] = useState(null);
    const [loadingNexterm, setLoadingNexterm] = useState(true);
    const [nextermSearch, setNextermSearch] = useState("");

    const baseUrl = "./";

    useEffect(() => {
        loadSourceName(baseUrl).then(setSourceName).catch(() => {});
        loadCategoriesIndex(baseUrl).then((data) => {
            setCategories(data.categories);
            setGeneratedAt(data.generatedAt);
            if (data.categories.length > 0) setSelectedCategory(data.categories[0]);
            setLoadingCategories(false);
        }).catch((err) => { setError(err.message); setLoadingCategories(false); });

        loadNextermData(baseUrl).then((data) => {
            setNextermData(data);
            if (data.categories.length > 0) setNextermCategory(data.categories[0].slug);
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

    const handleCategoryChange = (category) => { setSelectedCategory(category); setMobileMenuOpen(false); };
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

    const filteredNextermItems = useMemo(() => {
        if (!nextermData || !nextermCategory) return [];
        const items = nextermData.items[nextermCategory]?.items || [];
        if (!nextermSearch) return items;
        const q = nextermSearch.toLowerCase();
        return items.filter(item => item.name.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q));
    }, [nextermData, nextermCategory, nextermSearch]);

    const currentNextermCategoryName = nextermData?.categories.find(c => c.slug === nextermCategory)?.name || "All";

    if (loadingCategories && loadingNexterm) return <div className="app-loading"><Loader size="large" /></div>;
    if (error) return <div className="app-error"><p>Error: {error}</p></div>;

    return (
        <div className="store-layout">
            <aside className="store-sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-logo"><Icon path={mdiPackageVariant} /></div>
                    <div className="sidebar-title"><h1>NerdyStore</h1><p>3rd party source</p></div>
                </div>

                <div className="sidebar-sections">
                    {SECTIONS.map((section) => (
                        <button key={section.key} className={`section-btn${activeSection === section.key ? ' active' : ''}`} onClick={() => setActiveSection(section.key)}>
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
                ) : (
                    <nav className="sidebar-nav">
                        <div className="nav-label">Categories</div>
                        {nextermData?.categories.map((cat) => (
                            <button key={cat.slug} className={`nav-item${nextermCategory === cat.slug ? ' active' : ''}`} onClick={() => setNextermCategory(cat.slug)}>
                                <Icon path={getNextermIcon(cat.slug)} className="nav-icon" />
                                <span className="nav-text">{cat.name}</span>
                                <span className="nav-count">{cat.count}</span>
                            </button>
                        ))}
                    </nav>
                )}
            </aside>
            <main className="store-main">
                <header className="mobile-header">
                    <div className="mobile-brand"><Icon path={mdiPackageVariant} /><span>NerdyStore</span></div>
                    <div className="mobile-sections">
                        {SECTIONS.map((section) => (
                            <button key={section.key} className={`mobile-section-btn${activeSection === section.key ? ' active' : ''}`} onClick={() => setActiveSection(section.key)}>
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

                {activeSection === "nexploy" ? (
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
