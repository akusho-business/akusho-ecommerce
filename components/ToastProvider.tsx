// components/ToastProvider.tsx
"use client";

import { Toaster } from "sonner";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: "akusho-toast",
          title: "akusho-toast-title",
          description: "akusho-toast-description",
          actionButton: "akusho-toast-action",
          cancelButton: "akusho-toast-cancel",
          closeButton: "akusho-toast-close",
        },
      }}
      gap={8}
      offset={80}
      duration={3000}
    />
  );
}