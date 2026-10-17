"use client";

import React from "react";

export interface SwitchProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Switch({
  id,
  checked,
  onChange,
  label,
  disabled = false,
}: SwitchProps) {
  const switchId = id || (label ? `switch-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

  return (
    <label
      htmlFor={switchId}
      className={`inline-flex items-center gap-3 cursor-pointer select-none min-h-[44px] ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <button
        id={switchId}
        role="switch"
        type="button"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-pill border-[2.5px] border-primary transition-colors duration-200 focus-visible:outline focus-visible:outline-3 focus-visible:outline-info focus-visible:outline-offset-[3px] ${
          checked ? "bg-leaf" : "bg-surface-sunken"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full border-2 border-primary bg-surface-raised transition-transform duration-200 ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      {label && (
        <span className="text-sm font-bold font-body text-primary">{label}</span>
      )}
    </label>
  );
}

