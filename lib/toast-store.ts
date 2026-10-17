import { create } from "zustand";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastState {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, "id">) => string;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
    return id;
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

export const toast = {
  success: (message: string, title?: string) =>
    useToastStore.getState().addToast({ message, title, type: "success", duration: 5000 }),
  error: (message: string, title?: string) =>
    useToastStore.getState().addToast({ message, title, type: "error", duration: 8000 }),
  info: (message: string, title?: string) =>
    useToastStore.getState().addToast({ message, title, type: "info", duration: 5000 }),
  warning: (message: string, title?: string) =>
    useToastStore.getState().addToast({ message, title, type: "warning", duration: 6000 }),
};

