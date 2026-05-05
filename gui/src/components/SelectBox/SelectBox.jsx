import "./styles.sass";
import Icon from "@mdi/react";
import { mdiChevronDown } from "@mdi/js";
import { useState, useRef, useEffect } from "react";

export const SelectBox = ({ options, selected, setSelected }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="select-box" ref={ref}>
            <div className={`select-trigger ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
                <span>{options.find(o => o.value === selected)?.label || "Select..."}</span>
                <Icon path={mdiChevronDown} className="select-arrow" />
            </div>
            {isOpen && (
                <div className="select-dropdown">
                    {options.map((o) => <div key={o.value} className={`select-option ${selected === o.value ? 'selected' : ''}`} onClick={() => { setSelected(o.value); setIsOpen(false); }}>{o.label}</div>)}
                </div>
            )}
        </div>
    );
};
