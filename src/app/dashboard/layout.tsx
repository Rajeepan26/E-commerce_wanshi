"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { SiteHeader } from "@/components/site-header";
import { WhatsappFab } from "@/components/whatsapp-fab";
import { SiteFooter } from "@/components/site-footer";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const path = usePathname();
  const isCartRoute = path?.startsWith("/dashboard/cart") ?? false;

  useEffect(() => {
    if (!loading && !user && !isCartRoute) router.replace("/login");
  }, [user, loading, router, isCartRoute]);

  if (loading) return <div className="p-8">Loading…</div>;

  if (!user && isCartRoute) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="container mx-auto min-w-0 flex-1 px-4 py-6">{children}</main>
        <SiteFooter />
        <WhatsappFab />
      </div>
    );
  }

  if (!user) return <div className="p-8">Loading…</div>;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="container mx-auto min-w-0 flex-1 px-4 py-6 md:py-8">{children}</main>
      <SiteFooter />
      <WhatsappFab />
    </div>
  );
}
