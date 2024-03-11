import React from "preact/compat"
import { Link } from "react-router-dom"

interface ButtonProps {
    variant: "filled" | "tonal" | "text" | "outlined"
    icon?: React.ReactNode
    href?: string
    label?: string
    children?: React.ReactNode
}

export const Button: React.FC<ButtonProps & React.HTMLAttributes<HTMLButtonElement | HTMLAnchorElement>> = ({ href, variant, label, icon, children }) => {


    if(href) return <Link to={href}>
        <span className={`button-${variant}`} aria-label={label}>
            {icon && <img src={`/icons/${icon}`} alt={icon} />}
            {children}
        </span>
    </Link>

    return <button class={`button-${variant}`} aria-label={label}>
        {icon && <img src={`/icons/${icon}`} alt={icon} />}
        {children}
    </button>
}