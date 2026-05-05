import { createContext, useEffect, useRef, useState } from "react";
import Icon from "@mdi/react";
import { mdiClose } from "@mdi/js";
import "./styles.sass";

export const DialogContext = createContext({});

export const Dialog = ({ disableClosing, open, children, onClose }) => {
    const areaRef = useRef();
    const ref = useRef();
    const [isVisible, setIsVisible] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const closeInner = () => { if (!isClosing) setIsClosing(true); };

    useEffect(() => {
        const handleClick = (e) => {
            if (!ref.current?.contains(e.target) && !document.getElementById('select-box-portal')?.contains(e.target) && !e.target.closest('.dialog-close-btn') && !disableClosing) closeInner();
        };
        if (isVisible && !isClosing) { document.addEventListener("mousedown", handleClick); return () => document.removeEventListener("mousedown", handleClick); }
    }, [ref, disableClosing, isVisible, isClosing]);

    useEffect(() => { if (open) { setIsVisible(true); setIsClosing(false); } }, [open]);

    const handleAnimationEnd = () => { if (isClosing) { setIsVisible(false); setIsClosing(false); if (onClose) onClose(); } };

    return (
        <DialogContext.Provider value={closeInner}>
            {isVisible && (
                <div className={`dialog-area ${isClosing ? "dialog-area-hidden" : ""}`} ref={areaRef}>
                    <div className={`dialog ${isClosing ? "dialog-hidden" : ""}`} ref={ref} onAnimationEnd={handleAnimationEnd}>
                        {!disableClosing && <button className="dialog-close-btn" onClick={(e) => { e.stopPropagation(); closeInner(); }} aria-label="Close dialog"><Icon path={mdiClose} size={0.9} /></button>}
                        {children}
                    </div>
                </div>
            )}
        </DialogContext.Provider>
    );
};
