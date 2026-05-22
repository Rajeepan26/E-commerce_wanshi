"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { ADMIN_NAV, isAdminNavActive } from "@/lib/admin-nav";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function AdminSidebar() {
  const path = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const allItems = ADMIN_NAV; // Include all items including Frontend

  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem("wanshi.auth");
    localStorage.removeItem("wanshi.user");
    router.push("/login");
  };

  return (
    <Sidebar className="top-[61px] sm:top-[69px] h-[calc(100vh-61px)] sm:h-[calc(100vh-69px)] border-r border-border/40 bg-gradient-to-b from-background to-muted/20">
      {/* Logo/Branding Header - Hidden */}
      <SidebarHeader className="hidden" />

      {/* Main Navigation */}
      <SidebarContent>
        <SidebarGroup className="py-2">
          {/* Admin Panel Header with User Info */}
          <div className="mb-4 px-3 pb-4 border-b border-border/30 pt-4">
            <SidebarGroupLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70 mb-4">
              Admin Panel
            </SidebarGroupLabel>

            {/* Admin User Info */}
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 bg-gradient-to-br from-primary to-blue-600">
                <AvatarFallback className="text-xs font-bold text-white">
                  {user?.app_metadata?.full_name?.charAt(0) || "A"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">Admin</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email || "admin@wanshi.com"}
                </p>
              </div>
            </div>
          </div>

          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {allItems.map((item) => {
                const isActive = isAdminNavActive(path || "", item);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        "group relative h-10 rounded-lg px-4 py-2 transition-all duration-300 font-medium text-sm",
                        "hover:translate-x-1",
                        isActive
                          ? "bg-gradient-to-r from-primary/20 to-blue-500/10 text-primary shadow-md shadow-primary/20"
                          : "text-foreground/70 hover:text-foreground hover:bg-muted/60",
                      )}
                    >
                      <Link href={item.href} className="flex items-center gap-3 w-full">
                        <div
                          className={cn(
                            "h-5 w-5 transition-all duration-300 flex items-center justify-center",
                            isActive
                              ? "text-primary scale-110"
                              : "text-muted-foreground group-hover:text-primary group-hover:scale-110",
                          )}
                        >
                          <item.icon className="h-5 w-5" aria-hidden />
                        </div>
                        <span className="flex-1 transition-all duration-300">{item.label}</span>
                        {isActive && (
                          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Logout Button */}
      <SidebarFooter className="border-t border-border/30 bg-gradient-to-t from-muted/30 to-transparent p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <Button
              onClick={handleLogout}
              className={cn(
                "w-full h-10 rounded-lg gap-2 font-semibold text-sm",
                "bg-gradient-to-r from-red-500/80 to-red-600 hover:from-red-600 hover:to-red-700",
                "text-white shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/40",
                "transition-all duration-300 hover:scale-105 active:scale-95",
              )}
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
