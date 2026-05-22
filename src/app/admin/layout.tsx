"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { SiteHeader } from "@/components/site-header";
import { WhatsappFab } from "@/components/whatsapp-fab";
import { LoadingSpinner } from "@/components/loading-spinner";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (role !== "admin") router.replace("/dashboard");
  }, [user, role, loading, router]);

  if (loading || !user || role !== "admin") {
    return <LoadingSpinner message="Verifying Admin Access..." className="py-24" />;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full flex-col">
        <SiteHeader />
        <div className="flex flex-1 overflow-hidden min-h-0 relative">
          <AdminSidebar />
          <main className="flex flex-1 flex-col overflow-hidden bg-gradient-to-br from-background via-background to-muted/30">
            <div className="flex-1 overflow-auto">
              <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-10">
                {/* Header Section */}
                <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-1 w-1 rounded-full bg-gradient-to-r from-primary to-blue-600 shadow-lg shadow-primary/50" />
                      <h1 className="bg-gradient-to-r from-primary via-blue-600 to-primary bg-clip-text text-4xl font-black text-transparent tracking-tight">
                        Admin Console
                      </h1>
                    </div>
                    <p className="text-base text-muted-foreground font-medium">
                      Manage products, users, categories, orders, discount offers, and
                      advertisements.
                    </p>
                  </div>
                  <div className="mt-6 h-1 w-24 bg-gradient-to-r from-primary/60 via-blue-500/40 to-transparent rounded-full" />
                </div>

                {/* Content Section */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                  {children}
                </div>
              </div>
            </div>
          </main>
        </div>
        <WhatsappFab />
      </div>
    </SidebarProvider>
  );
}
