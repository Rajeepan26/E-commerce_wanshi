import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="top-center"
      offset="5.25rem"
      richColors
      expand={false}
      gap={14}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast animate-in fade-in zoom-in-[0.985] slide-in-from-top-3 duration-300 ease-out md:animate-in md:fade-in md:slide-in-from-top-4 [&[data-visible=true]]:animate-in [&[data-removed=true]]:animate-out [&[data-removed=true]]:fade-out [&[data-removed=true]]:slide-out-to-top-2 [&[data-removed=true]]:duration-200 group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success:
            "!border-success/35 !bg-[oklch(0.98_0.02_156)] dark:!bg-success/15 slide-in-from-top-3 animate-in fade-in zoom-in-[0.985] duration-300",
          error:
            "!border-destructive/35 !bg-destructive/8 slide-in-from-top-3 animate-in fade-in zoom-in-[0.985] duration-300",
          warning: "slide-in-from-top-3 animate-in fade-in zoom-in-[0.985] duration-300",
          info: "slide-in-from-top-3 animate-in fade-in zoom-in-[0.985] duration-300",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
