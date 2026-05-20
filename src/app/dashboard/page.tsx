"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  CalendarRange,
  Clock,
  Headphones,
  Heart,
  LayoutGrid,
  Package,
  Search,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/lib/cart";
import { inr } from "@/lib/format";
import { listOrders } from "@/lib/mock/orders-store";
import { waLink, ADMIN_WHATSAPP } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/mock/types";

function statusTone(status: OrderStatus): string {
  switch (status) {
    case "Delivered":
      return "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200";
    case "Cancelled":
      return "bg-muted text-muted-foreground";
    case "Pending":
      return "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200";
    case "Accepted":
      return "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200";
    case "In-Transit":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function initialsFromName(name: string, email?: string): string {
  const t = name.trim();
  if (t) {
    const parts = t.split(/\s+/).filter(Boolean);
    if (parts.length >= 2)
      return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
    return (parts[0] ?? "U").slice(0, 2).toUpperCase();
  }
  const pre = email?.split("@")[0] ?? "?";
  return pre.slice(0, 2).toUpperCase();
}

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const { count: cartCount } = useCart();

  const { data } = useQuery({
    queryKey: ["customer-dashboard-overview", user?.id],
    queryFn: () => {
      const uid = user?.id ?? "";
      const orders = listOrders(uid);
      const activePipeline = orders.filter((o) =>
        ["Pending", "Accepted", "In-Transit"].includes(o.status),
      );
      const awaiting = orders.filter((o) => o.status === "Pending");
      const sorted = [...orders].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      return {
        orders: sorted,
        total: orders.length,
        activePipeline: activePipeline.length,
        awaiting: awaiting.length,
      };
    },
    enabled: Boolean(user?.id),
  });

  const displayName =
    user?.app_metadata?.full_name?.trim() ||
    user?.email?.split("@")[0]?.replace(/\./g, " ") ||
    "there";

  const initials = initialsFromName(user?.app_metadata?.full_name ?? "", user?.email ?? undefined);

  const stats = useMemo(() => {
    const total = data?.total ?? 0;
    return [
      {
        label: "Total orders",
        value: String(total),
        icon: Package,
        iconWrap: "bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-300",
        href: "/dashboard/orders",
      },
      {
        label: "Cart items",
        value: String(cartCount),
        icon: Heart,
        iconWrap: "bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-300",
        href: "/dashboard/cart",
      },
      {
        label: "Active orders",
        value: String(data?.activePipeline ?? 0),
        icon: ShoppingBag,
        iconWrap: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300",
        href: "/dashboard/orders",
      },
      {
        label: "Pending delivery",
        value: String(data?.awaiting ?? 0),
        icon: Clock,
        iconWrap: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200",
        href: "/dashboard/track",
      },
    ];
  }, [cartCount, data?.activePipeline, data?.awaiting, data?.total]);

  const supportHref = waLink(
    ADMIN_WHATSAPP,
    `Hi Wanshi — I'm ${displayName}, I need help with my order.`,
  );

  const quickActions = [
    {
      title: "Browse catalog",
      desc: "Explore products and daily deals",
      href: "/products",
      icon: LayoutGrid,
      accent: "text-sky-600 bg-sky-50 dark:bg-sky-950 dark:text-sky-200",
    },
    {
      title: "View cart",
      desc: "Review items before checkout",
      href: "/dashboard/cart",
      icon: Heart,
      accent: "text-rose-600 bg-rose-50 dark:bg-rose-950 dark:text-rose-200",
    },
    {
      title: "Contact support",
      desc: "Chat with us on WhatsApp",
      href: supportHref,
      icon: Headphones,
      accent: "text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-200",
      external: true,
    },
    {
      title: "Track orders",
      desc: "Check status and tracking",
      href: "/dashboard/track",
      icon: Package,
      accent: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-200",
    },
    {
      title: "Shop spotlight",
      desc: "Jump to search with one tap",
      href: "/products",
      icon: Search,
      accent: "text-violet-600 bg-violet-50 dark:bg-violet-950 dark:text-violet-200",
    },
  ];

  if (!user) return null;

  const recent = data?.orders.slice(0, 3) ?? [];

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-4">
          <div
            className="grid size-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-lg font-bold text-primary ring-2 ring-primary/20"
            aria-hidden
          >
            {initials}
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">User dashboard</p>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Welcome back, {displayName}!
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Here&apos;s what&apos;s happening with your account today.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/orders">Order history</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/products">Continue shopping</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="flex items-center gap-4 rounded-2xl border bg-card p-4 shadow-sm transition hover:border-primary/25 hover:shadow-md"
          >
            <div className={cn("grid size-11 shrink-0 place-items-center rounded-xl", s.iconWrap)}>
              <s.icon className="size-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold tracking-tight text-foreground">{s.value}</p>
            </div>
          </Link>
        ))}
      </section>

      <div className="flex flex-col gap-8">
        <section className="w-full">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="size-5 text-primary" aria-hidden />
            <h2 className="text-lg font-bold text-foreground">Quick actions</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {quickActions.map((a) => (
              <Link
                key={a.title}
                href={a.href}
                {...(a.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="group flex flex-col gap-2 rounded-2xl border bg-card p-4 text-left shadow-sm transition hover:border-primary/30 hover:shadow-md h-full justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-xl transition group-hover:scale-105",
                      a.accent,
                    )}
                  >
                    <a.icon className="size-5" aria-hidden />
                  </div>
                  <p className="font-semibold text-foreground text-sm line-clamp-1">{a.title}</p>
                </div>
                <p className="text-xs text-muted-foreground leading-normal line-clamp-2">
                  {a.desc}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="w-full">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CalendarRange className="size-5 text-primary" aria-hidden />
              <h2 className="text-lg font-bold text-foreground">Recent orders</h2>
            </div>
            <Button variant="ghost" size="sm" className="text-primary" asChild>
              <Link href="/dashboard/orders">View all</Link>
            </Button>
          </div>

          {recent.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-card/50 p-8 text-center text-sm text-muted-foreground">
              No orders yet — start shopping to see receipts and tracking here.
              <div className="mt-4">
                <Button asChild size="sm">
                  <Link href="/products">Browse products</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recent.map((o) => (
                <article
                  key={o.id}
                  className="rounded-2xl border bg-card p-5 shadow-sm transition hover:border-primary/20 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 border-b pb-3 mb-3">
                      <div>
                        <p className="font-semibold text-foreground text-sm sm:text-base">
                          Order #{String(o.order_number).padStart(4, "0")}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(o.created_at).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize",
                          statusTone(o.status),
                        )}
                      >
                        {o.status}
                      </span>
                    </div>
                    <div className="grid gap-2 text-xs mb-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total:</span>
                        <span className="font-bold text-foreground">
                          {inr(Number(o.total_amount ?? 0))}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Items:</span>
                        <span className="font-medium text-foreground">
                          {o.order_items.length} SKU
                        </span>
                      </div>
                    </div>
                    <p className="line-clamp-2 text-[11px] text-muted-foreground leading-relaxed italic bg-muted/20 p-2 rounded-xl mb-4">
                      {o.order_items.map((i) => i.product_name).join(" · ")}
                    </p>
                  </div>
                  <div className="flex gap-2 border-t pt-3">
                    <Button variant="outline" size="sm" className="w-full text-xs" asChild>
                      <Link href="/dashboard/orders">Details</Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs text-primary bg-primary-soft/10 hover:bg-primary-soft/20"
                      asChild
                    >
                      <Link href="/dashboard/track">Track</Link>
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
