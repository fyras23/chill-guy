"use client";

import React, { forwardRef } from "react";

export interface SliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  ariaValueText?: string;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      value,
      min = 0,
      max = 100,
      step = 1,
      onChange,
      ariaValueText,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const percentage = max > min ? Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100)) : 0;

    return (
      <div className={`relative flex items-center h-8 w-full select-none ${className}`}>
        {/* Track Container */}
        <div className="relative w-full h-5 bg-surface-sunken border-[2.5px] border-primary rounded-pill overflow-hidden">
          {/* Fill with Secondary lava color and Tertiary highlight */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-secondary transition-[width] duration-75"
            style={{ width: `${percentage}%` }}
          >
            {/* Tertiary highlight stripe along top */}
            <div className="w-full h-1 bg-tertiary/70" />
          </div>
        </div>

        {/* Thumb Blob: 28px round blob with outline */}
        <div
          className="absolute top-1/2 -translate-y-1/2 pointer-events-none transition-[left] duration-75"
          style={{
            left: `calc(${percentage}% - ${percentage * 0.28}px)`,
          }}
        >
          <div className="w-7 h-7 rounded-full bg-surface-raised border-[2.5px] border-primary shadow-[2px_2px_0_#1A2A86]" />
        </div>

        {/* Invisible native range input for accessibility and full keyboard/touch interaction */}
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          aria-valuetext={ariaValueText}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-3 focus-visible:outline-info"
          {...props}
        />
      </div>
    );
  }
);

Slider.displayName = "Slider";

