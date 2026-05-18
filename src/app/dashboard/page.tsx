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
import {
  ArrowRight,
  LayoutDashboard,
  Package,
  ReceiptIndianRupee,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/lib/cart";
import { inr } from "@/lib/format";
import { listOrders } from "@/lib/mock/orders-store";

const MONTH_KEYS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"] as const;

const chartAccent = "#6366f1";
const palette = [
  "oklch(0.51 0.22 277)",
  "oklch(0.62 0.18 155)",
  "oklch(0.72 0.15 76)",
  "oklch(0.58 0.2 27)",
];

const spendTrendConfig = {
  amount: {
    label: "Spend trend",
    color: chartAccent,
  },
} satisfies ChartConfig;

const categoryConfig = {
  value: {
    label: "Category share",
    color: chartAccent,
  },
} satisfies ChartConfig;

/** Demo blend: real local orders inflated into a fuller visual for marketing-style overview. */
function buildSparklineTotals(orderTotal: number) {
  const base = MONTH_KEYS.map((m, i) => ({
    month: m,
    amount: Math.round(
      8000 + i * 1200 + (i % 3) * 900 + (orderTotal > 0 ? orderTotal / 8 + i * 450 : 0),
    ),
  }));
  const max = Math.max(...base.map((b) => b.amount), 1);
  const scale = Math.min(1.25, 28000 / max + 0.85);
  return base.map((b) => ({ ...b, amount: Math.round(b.amount * scale) }));
}

const dummyCategorySpend = [
  { name: "Fashion", value: 34 },
  { name: "Electronics", value: 28 },
  { name: "Home", value: 22 },
  { name: "Other", value: 16 },
];

function buildMonthlyOrders(realCount: number) {
  const seed = MONTH_KEYS.map((m, i) => ({
    month: m,
    orders: Math.max(1, Math.round(2 + i * 1.5 + (realCount > 3 ? realCount / 4 : realCount))),
  }));
  const maxVal = Math.max(...seed.map((s) => s.orders), 1);
  const target = Math.max(realCount || 8, Math.round(maxVal * 0.9));
  return seed.map((s, i) => ({
    ...s,
    orders: Math.min(Math.max(s.orders + (i % 2), 3), Math.max(target + i, 8)),
  }));
}

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const { count: cartItems } = useCart();

  const { data } = useQuery({
    queryKey: ["customer-overview-stats", user?.id],
    queryFn: () => {
      const uid = user?.id ?? "guest";
      const orders = listOrders(uid);
      const orderTotal = orders.reduce((s, o) => s + Number(o.total_amount ?? 0), 0);
      const delivered = orders.filter((o) => o.status?.toLowerCase() === "delivered").length;
      const pending = orders.filter((o) => o.status === "Pending").length;
      return {
        orders: orders.length,
        orderTotal,
        delivered,
        pending,
        loyaltyPoints: mockLoyalty(orders.length, orderTotal),
      };
    },
    enabled: Boolean(user?.id),
  });

  const spendSeries = useMemo(
    () => buildSparklineTotals(data?.orderTotal ?? 0),
    [data?.orderTotal],
  );
  const orderBars = useMemo(() => buildMonthlyOrders(data?.orders ?? 0), [data?.orders]);

  const statCards = useMemo(() => {
    const spend = data?.orderTotal ?? 0;
    const orders = data?.orders ?? 0;
    return [
      { label: "Lifetime spend", value: inr(spend), icon: ReceiptIndianRupee },
      {
        label: "Orders placed",
        value: orders.toString(),
        icon: ShoppingBag,
      },
      {
        label: "Est. loyalty points",
        value: `${data?.loyaltyPoints ?? 120}`,
        icon: Sparkles,
      },
      {
        label: "Cart · items saved",
        value: cartItems.toString(),
        icon: Package,
      },
    ];
  }, [cartItems, data?.loyaltyPoints, data?.orderTotal, data?.orders]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-primary">
            <LayoutDashboard className="size-4" aria-hidden />
            Your dashboard
          </p>
          <h1 className="mt-1 text-xl font-bold sm:text-2xl">Overview</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Personalized snapshot featuring trends and insights — blends your local demo orders with
            sample analytics for a storefront-style dashboard.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/orders">View orders</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/products">
              Continue shopping <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((c) => (
          <div
            key={c.label}
            className="rounded-lg border bg-card p-4 transition-all duration-300 hover:border-primary hover:shadow-lg"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">{c.label}</p>
              <c.icon className="size-5 shrink-0 text-primary" aria-hidden />
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-xl border bg-card p-5 shadow-sm lg:col-span-3">
          <h2 className="text-base font-semibold">Spending trend</h2>
          <p className="mt-1 text-xs text-muted-foreground">Rolling six‑month simulated curve</p>
          <ChartContainer config={spendTrendConfig} className="mt-6 aspect-[16/8]">
            <AreaChart data={spendSeries}>
              <CartesianGrid strokeDasharray="3 4" strokeOpacity={0.35} vertical={false} />
              <XAxis tickLine={false} axisLine={false} dataKey="month" />
              <YAxis hide />
              <ChartTooltip content={<ChartTooltipContent />} />
              <defs>
                <linearGradient id="spendGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartAccent} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={chartAccent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="amount"
                stroke={chartAccent}
                strokeWidth={2}
                fill="url(#spendGlow)"
              />
            </AreaChart>
          </ChartContainer>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm lg:col-span-2">
          <h2 className="text-base font-semibold">Category curiosity</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Typical mix · demo split for visuals only
          </p>
          <ChartContainer config={categoryConfig} className="mx-auto mt-6 aspect-square max-h-64">
            <PieChart>
              <Pie
                data={dummyCategorySpend}
                dataKey="value"
                nameKey="name"
                innerRadius={48}
                outerRadius={92}
                paddingAngle={2}
              >
                {dummyCategorySpend.map((_, i) => (
                  <Cell key={i} fill={palette[i % palette.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            </PieChart>
          </ChartContainer>
          <div className="mt-6 grid gap-3 text-xs">
            <div className="flex justify-between border-b pb-3">
              <span className="text-muted-foreground">Delivered journeys</span>
              <strong>{data?.delivered ?? mockFallbackDelivered(orderBars)} stops</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipments prepping</span>
              <strong>{data?.pending ?? 2}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="text-base font-semibold">Order rhythm</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Weekly-style cadence simulated from demo data
        </p>
        <ChartContainer
          config={{ orders: { label: "Orders", color: chartAccent } } satisfies ChartConfig}
          className="mt-8 aspect-video"
        >
          <BarChart data={orderBars} barGap={6}>
            <CartesianGrid strokeDasharray="3 4" strokeOpacity={0.35} vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} width={36} hide />
            <ChartTooltip content={<ChartTooltipContent />} cursor={{ radius: 4 }} />
            <Bar dataKey="orders" fill={chartAccent} radius={[10, 10, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </div>

      <section className="rounded-xl border bg-primary-soft/35 p-5 text-center text-sm text-muted-foreground sm:text-left">
        <p>
          Tune your profile anytime so checkout stays smooth — WhatsApp-ready phone and accurate
          address mean faster COD confirmations during live operations.
        </p>
      </section>
    </div>
  );
}

function mockLoyalty(orderCount: number, spend: number): number {
  return Math.round(120 + spend / 550 + orderCount * 45);
}

function mockFallbackDelivered(orderBars: Array<{ orders: number }>): number {
  return orderBars.reduce((s, row) => s + Math.max(1, Math.floor(row.orders * 0.55)), 0);
}
