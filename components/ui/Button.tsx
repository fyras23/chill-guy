"use client";

import React, { forwardRef } from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "ghost";
  size?: "default" | "sm" | "icon" | "lg";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = "",
      variant = "primary",
      size = "default",
      isLoading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseClasses =
      "inline-flex items-center justify-center font-bold font-body cursor-pointer select-none transition-all duration-150 focus-visible:outline focus-visible:outline-3 focus-visible:outline-info focus-visible:outline-offset-[3px] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0";

    // Size variants
    const sizeClasses = {
      default: "h-12 px-6 rounded-md text-base gap-2.5 min-w-[44px]",
      sm: "h-9 px-4 rounded-sm text-sm gap-2 min-w-[36px]",
      lg: "h-14 px-8 rounded-lg text-lg gap-3 min-w-[48px]",
      icon: "w-11 h-11 p-0 rounded-md min-w-[44px] min-h-[44px]",
    }[size];

    // Style variants with sticker shadows & borders
    const variantClasses = {
      primary:
        "bg-primary text-surface-raised border-[2.5px] border-primary shadow-sticker hover:not-disabled:-translate-x-px hover:not-disabled:-translate-y-px hover:not-disabled:shadow-[5px_5px_0_#1A2A86] active:not-disabled:translate-x-[3px] active:not-disabled:translate-y-[3px] active:not-disabled:shadow-sticker-pressed",
      secondary:
        "bg-surface-raised text-primary border-[2.5px] border-primary shadow-sticker hover:not-disabled:-translate-x-px hover:not-disabled:-translate-y-px hover:not-disabled:shadow-[5px_5px_0_#1A2A86] active:not-disabled:translate-x-[3px] active:not-disabled:translate-y-[3px] active:not-disabled:shadow-sticker-pressed",
      destructive:
        "bg-danger text-surface-raised border-[2.5px] border-primary shadow-sticker hover:not-disabled:-translate-x-px hover:not-disabled:-translate-y-px hover:not-disabled:shadow-[5px_5px_0_#1A2A86] active:not-disabled:translate-x-[3px] active:not-disabled:translate-y-[3px] active:not-disabled:shadow-sticker-pressed",
      ghost:
        "bg-transparent text-primary border-[2.5px] border-transparent hover:not-disabled:border-primary hover:not-disabled:bg-surface-raised hover:not-disabled:shadow-sticker active:not-disabled:translate-x-[2px] active:not-disabled:translate-y-[2px] active:not-disabled:shadow-sticker-pressed",
    }[variant];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
        {...props}
      >
        {isLoading && (
          <span
            className="w-4 h-4 rounded-full tie-dye-ring tie-dye-spin shrink-0 border border-primary"
            aria-hidden="true"
          />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

