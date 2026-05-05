import "./styles.sass";
import Icon from "@mdi/react";
import { mdiChevronDown } from "@mdi/js";
import { useEffect, useRef, useState } from "react";

export const TabSwitcher = ({ tabs, activeTab, onTabChange }) => {
    const tabRefs = useRef({});
    const containerRef = useRef(null);
    const [indicatorStyle, setIndicatorStyle] = useState({});
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const activeTabData = tabs.find(t => t.key === activeTab);

    useEffect(() => {
        if (activeTab && tabRefs.current[activeTab]) {
            const tab = tabRefs.current[activeTab];
            setIndicatorStyle({ width: tab.offsetWidth, left: tab.offsetLeft });
            if (containerRef.current && window.innerWidth <= 768) tab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
    }, [activeTab]);

    useEffect(() => {
        const handleClickOutside = (e) => { if (dropdownOpen && !e.target.closest('.tab-switcher-mobile')) setDropdownOpen(false); };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [dropdownOpen]);

    const handleTabSelect = (key) => { onTabChange(key); setDropdownOpen(false); };

    return (
        <div className="tab-switcher">
            <div className="tab-switcher-desktop">
                <div className="tab-switcher-container" ref={containerRef}>
                    <div className="tab-switcher-indicator" style={indicatorStyle} />
                    {tabs.map((tab) => (
                        <div key={tab.key} ref={el => tabRefs.current[tab.key] = el} className={`tab-switcher-tab${activeTab === tab.key ? ' active' : ''}`} onClick={() => onTabChange(tab.key)}>
                            {tab.icon && <Icon path={tab.icon} />}<span>{tab.label}</span>{tab.count !== undefined && <span className="tab-count">{tab.count}</span>}
                        </div>
                    ))}
                </div>
            </div>
            <div className="tab-switcher-mobile">
                <button className={`tab-dropdown-trigger${dropdownOpen ? ' open' : ''}`} onClick={() => setDropdownOpen(!dropdownOpen)}>
                    <span className="trigger-label">{activeTabData?.label || 'Select category'}</span>
                    {activeTabData?.count !== undefined && <span className="trigger-count">{activeTabData.count}</span>}
                    <Icon path={mdiChevronDown} className="trigger-icon" />
                </button>
                {dropdownOpen && (
                    <div className="tab-dropdown-menu">
                        {tabs.map((tab) => (
                            <div key={tab.key} className={`tab-dropdown-item${activeTab === tab.key ? ' active' : ''}`} onClick={() => handleTabSelect(tab.key)}>
                                {tab.icon && <Icon path={tab.icon} />}<span>{tab.label}</span>{tab.count !== undefined && <span className="item-count">{tab.count}</span>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
