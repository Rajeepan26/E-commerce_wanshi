"use client";

import { Loader2 } from "lucide-react";
import { Toaster as Sonner } from "sonner";

import type { ComponentProps } from "react";

type ToasterProps = ComponentProps<typeof Sonner>;

const enter =
  "animate-in fade-in zoom-in-[0.985] slide-in-from-right-4 duration-300 ease-out motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none";
const leave =
  "[&[data-removed=true]]:animate-out [&[data-removed=true]]:fade-out [&[data-removed=true]]:slide-out-to-right-3 [&[data-removed=true]]:duration-200 motion-reduce:[&[data-removed=true]]:animate-none";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="top-right"
      offset={{
        top: "max(0.75rem, env(safe-area-inset-top))",
        right: "max(0.75rem, env(safe-area-inset-right))",
      }}
      mobileOffset={{
        top: "max(0.75rem, env(safe-area-inset-top))",
        right: "max(0.75rem, env(safe-area-inset-right))",
      }}
      richColors
      expand={false}
      gap={14}
      className="toaster group"
      icons={{
        loading: (
          <Loader2
            className="size-[18px] shrink-0 animate-spin text-destructive"
            aria-hidden
            strokeWidth={2.5}
          />
        ),
      }}
      toastOptions={{
        classNames: {
          toast: `group toast ${enter} ${leave} md:slide-in-from-right-5 [&[data-visible=true]]:animate-in group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg`,
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          loader:
            "flex shrink-0 items-center justify-center text-destructive [&_svg]:text-destructive",
          loading: `text-destructive !border-destructive/35 !bg-destructive/8 [&_[data-description]]:!text-destructive/90 ${enter} ${leave}`,
          success:
            "!border-success/35 !bg-[oklch(0.98_0.02_156)] dark:!bg-success/15 animate-in fade-in zoom-in-[0.985] slide-in-from-right-4 duration-300 motion-reduce:animate-none motion-reduce:opacity-100",
          error:
            "!border-destructive/35 !bg-destructive/8 animate-in fade-in zoom-in-[0.985] slide-in-from-right-4 duration-300 motion-reduce:animate-none motion-reduce:opacity-100",
          warning: `${enter} ${leave}`,
          info: `${enter} ${leave}`,
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
