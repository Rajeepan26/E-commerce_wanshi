"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { Coins, LayoutDashboard, Package, ShoppingBag, Users } from "lucide-react";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { inr } from "@/lib/format";
import { getCatalogCounts } from "@/lib/mock/catalog-store";
import { aggregateOrderStats, listOrders } from "@/lib/mock/orders-store";
import type { OrderStatus, StoredOrder } from "@/lib/mock/types";

const ACCENT = "#6366f1";
const PALETTE = [
  "oklch(0.51 0.22 277)",
  "oklch(0.62 0.18 155)",
  "oklch(0.72 0.15 76)",
  "oklch(0.55 0.16 258)",
  "oklch(0.58 0.2 27)",
];

function demoCustomersEstimate(): number {
  if (typeof window === "undefined") return 3;
  try {
    const profiles = JSON.parse(window.localStorage.getItem("wanshi.demo_profiles") ?? "{}") as
      | Record<string, unknown>
      | undefined;
    return Math.max(3, profiles ? Object.keys(profiles).length : 3);
  } catch {
    return 3;
  }
}

function rollingMonthSlots(): { key: string; label: string }[] {
  const out: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString("en-IN", { month: "short" }),
    });
  }
  return out;
}

function monthKeyFromDate(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}`;
}

function buildAdminCharts(orders: StoredOrder[]) {
  const slots = rollingMonthSlots();
  const revenueByKey = new Map<string, number>();
  const countByKey = new Map<string, number>();

  for (const o of orders) {
    const d = new Date(o.created_at);
    if (Number.isNaN(d.getTime())) continue;
    const k = monthKeyFromDate(d);
    const amt = Number(o.total_amount ?? 0);
    revenueByKey.set(k, (revenueByKey.get(k) ?? 0) + amt);
    countByKey.set(k, (countByKey.get(k) ?? 0) + 1);
  }

  const revenueSeries = slots.map((s) => ({
    month: s.label,
    revenue: revenueByKey.get(s.key) ?? 0,
  }));

  const orderVolume = slots.map((s) => ({
    month: s.label,
    orders: countByKey.get(s.key) ?? 0,
  }));

  const statusOrder: OrderStatus[] = [
    "Pending",
    "Accepted",
    "In-Transit",
    "Delivered",
    "Cancelled",
  ];
  const statusCounts: Record<OrderStatus, number> = {
    Pending: 0,
    Accepted: 0,
    "In-Transit": 0,
    Delivered: 0,
    Cancelled: 0,
  };
  for (const o of orders) {
    statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1;
  }
  const statusPie = statusOrder
    .map((name) => ({ name, value: statusCounts[name] }))
    .filter((x) => x.value > 0);

  let cod = 0;
  let bank = 0;
  for (const o of orders) {
    if (o.payment_method === "bank") bank++;
    else cod++;
  }
  const paymentPie = [
    { name: "Cash on delivery", value: cod },
    { name: "Bank transfer", value: bank },
  ].filter((x) => x.value > 0);

  const hasAnyRevenue = revenueSeries.some((r) => r.revenue > 0);
  const hasVolume = orderVolume.some((r) => r.orders > 0);

  return {
    revenueSeries,
    orderVolume,
    statusPie,
    paymentPie,
    hasAnyRevenue,
    hasVolume,
  };
}

/** Soft illustrative curve when there is no history yet (clearly optional — admin still sees real KPI cards). */
function padRevenueIfEmpty(
  series: Array<{ month: string; revenue: number }>,
  totalRevenue: number,
): Array<{ month: string; revenue: number }> {
  if (series.some((s) => s.revenue > 0)) return series;
  const base = Math.max(Math.round(totalRevenue / 4), 3200);
  return series.map((s, i) => ({
    ...s,
    revenue: Math.round(base * (0.55 + (i / Math.max(series.length - 1, 1)) * 0.95) + i * 400),
  }));
}

function padOrdersIfEmpty(
  series: Array<{ month: string; orders: number }>,
  orderCount: number,
): Array<{ month: string; orders: number }> {
  if (series.some((s) => s.orders > 0)) return series;
  const base = Math.max(Math.ceil(orderCount / 2), 4);
  return series.map((s, i) => ({
    ...s,
    orders: Math.max(2, Math.round(base * (0.5 + (i % 4) * 0.15) + i)),
  }));
}

export default function AdminOverviewPage() {
  const { data } = useQuery({
    queryKey: ["admin-demo-stats"],
    queryFn: async () => {
      const catalog = getCatalogCounts();
      const orders = aggregateOrderStats();
      const allOrders = listOrders();
      const charts = buildAdminCharts(allOrders);
      return {
        products: catalog.products,
        orders: orders.count,
        revenue: orders.revenue,
        customers: demoCustomersEstimate(),
        charts,
      };
    },
  });

  const cards = [
    { label: "Total Revenue", value: inr(data?.revenue ?? 0), icon: Coins },
    { label: "Orders", value: data?.orders ?? 0, icon: ShoppingBag },
    { label: "Products", value: data?.products ?? 0, icon: Package },
    { label: "Customers", value: data?.customers ?? 0, icon: Users },
  ];

  const revenueDisplay = useMemo(() => {
    const raw = data?.charts?.revenueSeries ?? [];
    const total = data?.revenue ?? 0;
    if (!raw.length) return [];
    return padRevenueIfEmpty(raw, total);
  }, [data?.charts?.revenueSeries, data?.revenue]);

  const volumeDisplay = useMemo(() => {
    const raw = data?.charts?.orderVolume ?? [];
    const count = data?.orders ?? 0;
    if (!raw.length) return [];
    return padOrdersIfEmpty(raw, count);
  }, [data?.charts?.orderVolume, data?.orders]);

  const charts = data?.charts;
  const showRevenuePlaceholder = charts && !charts.hasAnyRevenue && (data?.revenue ?? 0) === 0;
  const showVolumePlaceholder = charts && !charts.hasVolume && (data?.orders ?? 0) === 0;

  const statusSlices = charts?.statusPie?.length
    ? charts.statusPie
    : [{ name: "No orders", value: 1 }];

  const paymentSlices =
    charts?.paymentPie?.length && (data?.orders ?? 0) > 0
      ? charts.paymentPie
      : [{ name: "No payment data", value: 1 }];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-primary">
            <LayoutDashboard className="size-4 shrink-0" aria-hidden />
            Admin dashboard
          </p>
          <h1 className="mt-1 text-xl font-bold sm:text-2xl">Admin overview</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            KPIs and charts from your browser-stored catalog and demo orders. Open{" "}
            <span className="font-medium text-foreground">Orders</span> to update statuses and watch
            the breakdown refresh.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/orders">Orders</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/products">Products</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-lg border bg-card p-4 transition-all duration-300 hover:border-primary hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{c.label}</p>
              <c.icon className="size-5 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-xl border bg-card p-5 shadow-sm lg:col-span-3">
          <h2 className="text-base font-semibold">Revenue trend</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Last six months ·{" "}
            {showRevenuePlaceholder
              ? "illustrative curve until orders carry dates in this period"
              : "from stored order totals"}
          </p>
          <ChartContainer
            config={{ revenue: { label: "Revenue", color: ACCENT } } satisfies ChartConfig}
            className="mt-6 aspect-[16/8]"
          >
            <AreaChart data={revenueDisplay}>
              <CartesianGrid strokeDasharray="3 4" strokeOpacity={0.35} vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis hide />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => <span className="font-mono">{inr(Number(value))}</span>}
                  />
                }
              />
              <defs>
                <linearGradient id="adminRevGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ACCENT} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={ACCENT}
                strokeWidth={2}
                fill="url(#adminRevGlow)"
              />
            </AreaChart>
          </ChartContainer>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm lg:col-span-2">
          <h2 className="text-base font-semibold">Order status</h2>
          <p className="mt-1 text-xs text-muted-foreground">Share of orders by workflow state</p>
          <ChartContainer
            config={{ value: { label: "Orders", color: ACCENT } } satisfies ChartConfig}
            className="mx-auto mt-4 aspect-square max-h-64"
          >
            <PieChart>
              <Pie
                data={statusSlices}
                dataKey="value"
                nameKey="name"
                innerRadius={52}
                outerRadius={88}
                paddingAngle={2}
              >
                {statusSlices.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            </PieChart>
          </ChartContainer>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-xl border bg-card p-5 shadow-sm lg:col-span-3">
          <h2 className="text-base font-semibold">Order volume</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {showVolumePlaceholder
              ? "Sample cadence — real counts appear once orders land in these months"
              : "Orders placed per month"}
          </p>
          <ChartContainer
            config={{ orders: { label: "Orders", color: ACCENT } } satisfies ChartConfig}
            className="mt-8 aspect-video"
          >
            <BarChart data={volumeDisplay} barGap={6}>
              <CartesianGrid strokeDasharray="3 4" strokeOpacity={0.35} vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} width={32} hide />
              <ChartTooltip content={<ChartTooltipContent />} cursor={{ radius: 4 }} />
              <Bar dataKey="orders" fill={ACCENT} radius={[10, 10, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm lg:col-span-2">
          <h2 className="text-base font-semibold">Payment mix</h2>
          <p className="mt-1 text-xs text-muted-foreground">COD vs bank transfer (demo checkout)</p>
          <ChartContainer
            config={{ value: { label: "Orders", color: ACCENT } } satisfies ChartConfig}
            className="mx-auto mt-6 aspect-square max-h-64"
          >
            <PieChart>
              <Pie
                data={paymentSlices}
                dataKey="value"
                nameKey="name"
                innerRadius={48}
                outerRadius={86}
                paddingAngle={2}
              >
                {paymentSlices.map((_, i) => (
                  <Cell key={i} fill={PALETTE[(i + 1) % PALETTE.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            </PieChart>
          </ChartContainer>
        </div>
      </div>

      <div className="rounded-xl border bg-primary-soft/40 p-5 text-sm text-muted-foreground">
        <p>
          Use the sidebar for <span className="font-medium text-foreground">Products</span>,{" "}
          <span className="font-medium text-foreground">Categories</span>,{" "}
          <span className="font-medium text-foreground">Orders</span>, offers, and ads — or open{" "}
          <Link href="/" className="font-medium text-primary underline-offset-4 hover:underline">
            Frontend
          </Link>{" "}
          to preview the shop.
        </p>
      </div>
    </div>
  );
}
