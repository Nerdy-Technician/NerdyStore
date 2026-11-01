import { Icon } from "@mdi/react";
import { mdiMapMarkerQuestion } from "@mdi/js";

const NotFound = ({ path, onHome, onBrowse }) => (
    <div className="store-content not-found">
        <div className="store-results"><div className="no-results">
            <Icon path={mdiMapMarkerQuestion} />
            <h3>Page not found</h3>
            <p>We couldn't find <code>{path}</code>. It may have moved, or the link might be mistyped.</p>
            <div className="subcat-filters not-found-actions">
                <button className="subcat-pill active" onClick={onHome}>Go to the home page</button>
                <button className="subcat-pill" onClick={() => onBrowse("nexploy")}>Browse Nexploy apps</button>
                <button className="subcat-pill" onClick={() => onBrowse("nexterm")}>Browse Nexterm scripts</button>
            </div>
        </div></div>
    </div>
);

export default NotFound;
