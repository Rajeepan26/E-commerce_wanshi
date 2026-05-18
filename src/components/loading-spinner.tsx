import React from "react";

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
}

export function LoadingSpinner({
  message = "Loading...",
  className = "py-12",
}: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center space-y-4 w-full ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Animated Ambient Glow */}
        <div className="absolute size-12 rounded-full bg-primary/10 blur-xl animate-pulse" />
        {/* Outer Rotating Premium Spinner Ring */}
        <div className="size-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      </div>
      {message && (
        <p className="text-xs font-semibold text-muted-foreground/80 tracking-widest uppercase animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}
