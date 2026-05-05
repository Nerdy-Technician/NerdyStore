import "./styles.sass";
import Icon from "@mdi/react";

export const IconInput = ({ type, placeholder, icon, value, setValue, disabled }) => (
    <div className="input-container">
        <Icon path={icon} className="input-icon" />
        <input type={type} className="input" placeholder={placeholder} value={value} onChange={(e) => setValue(e.target.value)} disabled={disabled} />
    </div>
);
