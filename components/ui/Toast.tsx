"use client";

import React, { useEffect, useRef, useState } from "react";
import { useToastStore, type ToastMessage } from "@/lib/toast-store";
import { AlertCircle, Info, X } from "lucide-react";

function ToastItem({ toast }: { toast: ToastMessage }) {
  const removeToast = useToastStore((s) => s.removeToast);
  const [isPaused, setIsPaused] = useState(false);
  const remainingTimeRef = useRef(toast.duration ?? 5000);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      removeToast(toast.id);
    }, remainingTimeRef.current);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPaused, toast.id, removeToast]);

  const handleMouseEnter = () => {
    setIsPaused(true);
    if (startTimeRef.current !== null) {
      const elapsed = Date.now() - startTimeRef.current;
      remainingTimeRef.current = Math.max(500, remainingTimeRef.current - elapsed);
    }
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  const isError = toast.type === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live="polite"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="pointer-events-auto flex items-start gap-3 w-80 max-w-[calc(100vw-32px)] p-4 bg-surface-raised border-[2.5px] border-primary rounded-wobble shadow-sticker transition-transform hover:-translate-y-0.5"
    >
      <div className="shrink-0 mt-0.5">
        {toast.type === "success" && (
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-leaf text-surface-raised" aria-hidden="true">
            <span className="w-2.5 h-2.5 rounded-full bg-surface-raised" />
          </span>
        )}
        {toast.type === "error" && (
          <AlertCircle className="w-5 h-5 text-danger" strokeWidth={2.5} aria-hidden="true" />
        )}
        {toast.type === "warning" && (
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-warning text-primary" aria-hidden="true">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
          </span>
        )}
        {toast.type === "info" && (
          <Info className="w-5 h-5 text-info" strokeWidth={2.5} aria-hidden="true" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        {toast.title && (
          <h4 className="text-sm font-bold text-primary font-body leading-tight mb-1">
            {toast.title}
          </h4>
        )}
        <p className="text-sm text-primary font-body leading-snug break-words">
          {toast.message}
        </p>
      </div>

      <button
        type="button"
        onClick={() => removeToast(toast.id)}
        aria-label="Dismiss notification"
        className="shrink-0 p-1 -mr-1 -mt-1 text-primary hover:text-danger rounded-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-info"
      >
        <X className="w-4 h-4" strokeWidth={2.5} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-label="Notifications"
      className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

