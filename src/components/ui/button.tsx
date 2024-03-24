import React from "react";
import { Link } from "react-router-dom";

interface ButtonProps {
  variant: "filled" | "tonal" | "text" | "outlined" | "accent" | "dark";
  acrylic?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  href?: string;
  label?: string;
  children: React.ReactNode;
}

export const Button: React.FC<
  ButtonProps & React.HTMLAttributes<HTMLButtonElement | HTMLAnchorElement>
> = ({ href, variant, label, icon, children, acrylic, disabled, onClick }) => {
  if (href)
    return (
      <Link
        to={href}
        onClick={(e) => {
          if (disabled) e.preventDefault();
          else onClick && onClick(e);
        }}
      >
        <span
          className={`button-${variant} ${acrylic && "button-style-acrylic"} ${
            disabled && "button-disabled"
          }`}
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
      onClick={(e) => {
        if (disabled) e.preventDefault();
        else onClick && onClick(e);
      }}
      className={`button-${variant} ${acrylic && "button-style-acrylic"} ${
        disabled && "button-disabled"
      }`}
      aria-label={label}
    >
      {/* {icon && <img src={`/icons/${icon}`} alt={label} />} */}
      {icon && icon}
      {children}
    </button>
  );
};
