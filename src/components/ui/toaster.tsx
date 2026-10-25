"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      theme="light"
      position="bottom-center"
      toastOptions={{
        classNames: {
          toast:
            "font-sans border border-neutral-200 bg-white text-neutral-900 shadow-lg",
          title: "font-medium text-sm",
          description: "text-neutral-600 text-sm",
          success: "border-neutral-900",
          error: "border-red-600",
        },
      }}
      closeButton
    />
  );
}

export { toast } from "sonner";
