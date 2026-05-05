import { memo } from "react";
import "./styles.sass";

export const Loader = memo(({ size = "medium" }) => (
    <div className={`loading-container loading-${size}`}>
        <div className="loading-content">
        </div>
    </div>
));
