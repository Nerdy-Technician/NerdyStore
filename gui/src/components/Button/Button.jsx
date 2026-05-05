import "./styles.sass";
import Icon from "@mdi/react";

export const Button = ({ onClick, text, icon, disabled, type, buttonType }) => (
    <button className={"btn" + (type ? " type-" + type : "")} onClick={onClick} disabled={disabled} type={buttonType}>
        {icon && <Icon path={icon} />}<span>{text}</span>
    </button>
);
