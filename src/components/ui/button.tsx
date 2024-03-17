import React from "react";
import { Link } from "react-router-dom";

interface ButtonProps {
  variant: "filled" | "tonal" | "text" | "outlined" | "accent" | "dark";
  acrylic?: boolean;
  icon?: React.ReactNode;
  href?: string;
  label?: string;
  children: React.ReactNode;
}

export const Button: React.FC<
  ButtonProps & React.HTMLAttributes<HTMLButtonElement | HTMLAnchorElement>
> = ({ href, variant, label, icon, children, acrylic, onClick }) => {
  if (href)
    return (
      <Link to={href} onClick={onClick}>
        <span
          className={`button-${variant} ${acrylic && "button-style-acrylic"}`}
          aria-label={label}
        >
          {/* {icon && <img src={`/icons/${icon}`} alt={label} />} */}
          {icon && icon}
          {children}
        </span>
      </Link>
    );

  return (
    <button
      onClick={onClick}
      className={`button-${variant} ${acrylic && "button-style-acrylic"}`}
      aria-label={label}
    >
      {/* {icon && <img src={`/icons/${icon}`} alt={label} />} */}
      {icon && icon}
      {children}
    </button>
  );
};
