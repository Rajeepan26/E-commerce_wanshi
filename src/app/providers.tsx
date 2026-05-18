"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AuthProvider } from "@/hooks/use-auth";
import { ProductQuickViewProvider } from "@/components/product-quick-view";
import { Toaster } from "@/components/ui/sonner";
import { NotificationCenter } from "@/components/notification-center";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ProductQuickViewProvider>{children}</ProductQuickViewProvider>
        <Toaster />
        <NotificationCenter />
      </AuthProvider>
    </QueryClientProvider>
  );
}
