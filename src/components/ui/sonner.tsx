"use client";

import { Loader2, X } from "lucide-react";
import { Toaster as Sonner } from "sonner";

import type { ComponentProps, CSSProperties } from "react";

/** Keep in sync with `duration` and `--sonner-dismiss-duration` below (milliseconds). */
const TOAST_DURATION_MS = 2000;

type ToasterProps = ComponentProps<typeof Sonner>;

const enter =
  "animate-in fade-in zoom-in-[0.985] slide-in-from-right-4 duration-300 ease-out motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transform-none";
const leave =
  "[&[data-removed=true]]:animate-out [&[data-removed=true]]:fade-out [&[data-removed=true]]:slide-out-to-right-3 [&[data-removed=true]]:duration-200 motion-reduce:[&[data-removed=true]]:animate-none";

const Toaster = ({ duration, toastOptions, style, icons, ...props }: ToasterProps) => {
  const toastDuration = toastOptions?.duration ?? duration ?? TOAST_DURATION_MS;
  const dismissDurationCss = `${toastDuration}ms`;

  return (
    <Sonner
      duration={toastDuration}
      position="top-right"
      offset={{
        // Sit just below sticky header search / account strip (was ~12px — overlapped icons).
        top: "calc(env(safe-area-inset-top, 0px) + 5rem)",
        right: "max(0.75rem, env(safe-area-inset-right))",
      }}
      mobileOffset={{
        top: "calc(env(safe-area-inset-top, 0px) + 5rem)",
        right: "max(0.75rem, env(safe-area-inset-right))",
      }}
      closeButton
      richColors
      expand={false}
      gap={14}
      className="sonner-tailored toaster group"
      style={
        {
          ...style,
          ["--sonner-dismiss-duration"]: dismissDurationCss,
        } as CSSProperties
      }
      icons={{
        ...icons,
        close: icons?.close ?? <X className="size-[14px]" strokeWidth={2.25} aria-hidden />,
        loading: icons?.loading ?? (
          <Loader2
            className="size-[18px] shrink-0 animate-spin text-destructive"
            aria-hidden
            strokeWidth={2.5}
          />
        ),
      }}
      toastOptions={{
        ...toastOptions,
        closeButtonAriaLabel: toastOptions?.closeButtonAriaLabel ?? "Dismiss notification",
        classNames: {
          toast: `group toast relative overflow-hidden rounded-xl border px-5 py-4 shadow-[0_10px_40px_-10px_rgb(15_23_42/0.14)] backdrop-blur-sm ${enter} ${leave} md:slide-in-from-right-5 [&[data-visible=true]]:animate-in group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg dark:shadow-[0_14px_40px_-14px_rgb(0_0_0/0.55)]`,
          closeButton:
            "[&_svg]:size-[14px] [&_svg]:stroke-[2.35] hover:!brightness-[1.04] motion-reduce:transition-none motion-reduce:hover:!brightness-[1]",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          loader:
            "flex shrink-0 items-center justify-center text-destructive [&_svg]:text-destructive",
          loading: `text-destructive !border-destructive/35 !bg-destructive/8 [&_[data-description]]:!text-destructive/90 ${enter} ${leave}`,
          success:
            "!border-success/40 !shadow-[inset_0_0_1px_rgb(255_255_255/0.45)] [-webkit-backdrop-filter:blur(12px)] !bg-[oklch(0.98_0.025_155)] [!text-[oklch(0.32_0.11_154)]] [&_[data-description]]:!text-[oklch(0.4_0.09_154)] [&_[data-icon]_svg]:!text-[oklch(0.48_0.15_154)] [&_[data-icon]]:!text-[oklch(0.48_0.15_154)] dark:!bg-[oklch(0.24_0.05_154)] dark:!shadow-[inset_0_0_0_1px_oklch(0.55_0.12_150/0.25)] animate-in fade-in zoom-in-[0.985] slide-in-from-right-4 duration-300 motion-reduce:animate-none motion-reduce:opacity-100 dark:[&_[data-description]]:!text-[oklch(0.86_0.04_150)] dark:[&_[data-icon]_svg]:!text-[oklch(0.78_0.12_154)] dark:[&_[data-icon]]:!text-[oklch(0.78_0.12_154)]",
          error:
            "!border-destructive/35 !bg-destructive/8 animate-in fade-in zoom-in-[0.985] slide-in-from-right-4 duration-300 motion-reduce:animate-none motion-reduce:opacity-100",
          warning: `${enter} ${leave}`,
          info: `${enter} ${leave}`,
          ...toastOptions?.classNames,
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
