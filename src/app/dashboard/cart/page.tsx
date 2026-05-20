"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { inr } from "@/lib/format";
import {
  appliedWeightFeeBracketLabel,
  DELIVERY_FLAT_INR,
  weightHandlingFeeInr,
} from "@/lib/shipping-pricing";
import { toast } from "sonner";
import { useRef, useState } from "react";
import { appendDemoOrder } from "@/lib/mock/orders-store";
import { cloneProduct } from "@/lib/mock/catalog-store";
import { Trash2, ArrowLeft, Upload, MessageCircle } from "lucide-react";
import { waLink, ADMIN_WHATSAPP } from "@/lib/whatsapp";
import type { StoredOrder } from "@/lib/mock/types";

const WANSHI_BANK_ROWS: [string, string][] = [
  ["Bank name", "Commercial Bank"],
  ["Account number", "8108042652"],
  ["Account holder", "Wanshi pvt limit"],
  ["Branch", "Jaffna"],
];

const RECEIPT_MAX_BYTES = 524_288;

export default function CartPage() {
  const cart = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bank">("cod");
  const [uploadReceipt, setUploadReceipt] = useState("");
  const [receiptName, setReceiptName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [lastOrder, setLastOrder] = useState<StoredOrder | null>(null);
  const [orderJustConfirmed, setOrderJustConfirmed] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const itemSubtotal = cart.total;
  const itemWeightKg = (id: string, weightKg?: number | null) =>
    Math.max(0, Number(weightKg ?? cloneProduct(id)?.weight_kg ?? 1) || 0);
  const totalWeightKg = cart.items.reduce(
    (sum, item) => sum + itemWeightKg(item.id, item.weight_kg) * item.quantity,
    0,
  );
  const weightFee = cart.items.length > 0 ? weightHandlingFeeInr(totalWeightKg) : 0;
  const deliveryFee = cart.items.length > 0 ? DELIVERY_FLAT_INR : 0;
  const grandTotal = itemSubtotal + weightFee + deliveryFee;
  const checkout = () => {
    if (!user || cart.items.length === 0) return;
    if (paymentMethod === "bank" && !uploadReceipt.trim()) {
      toast.error("Please upload your payment receipt");
      return;
    }

    setBusy(true);
    const order = appendDemoOrder({
      userId: user.id,
      total: grandTotal,
      paymentMethod,
      items: cart.items.map((i) => ({
        product_id: i.id,
        product_name: i.name,
        quantity: i.quantity,
        price_at_purchase: i.price,
      })),
    });
    setBusy(false);

    if (!order) {
      toast.error("Could not place order");
      return;
    }

    setLastOrder(order);
    setOrderJustConfirmed(true);
    cart.clear();
    toast.success("Order confirmed", {
      description: `Order #${order.order_number}. Shared link generated.`,
    });
  };

  const onReceiptFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image (JPG or PNG)");
      return;
    }
    if (file.size > RECEIPT_MAX_BYTES) {
      toast.error(
        `Image too large (${Math.ceil(file.size / 1024)} KB). Maximum ${RECEIPT_MAX_BYTES / 1024} KB.`,
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result;
      if (typeof data !== "string") return;
      setUploadReceipt(data);
      setReceiptName(file.name);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const clearReceipt = () => {
    setUploadReceipt("");
    setReceiptName(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  if (cart.items.length === 0)
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        {orderJustConfirmed ? (
          <div className="mb-6 rounded-lg border border-success/40 bg-[oklch(0.98_0.02_156)] px-4 py-3 dark:bg-[oklch(0.24_0.05_154)] dark:border-success/35">
            <p className="font-semibold text-[oklch(0.32_0.11_154)] dark:text-[oklch(0.86_0.04_150)]">
              Order confirmed
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Thank you. Your order #{lastOrder?.order_number} has been received.
            </p>
            <Button
              className="mt-4 w-full bg-[#25D366] text-white hover:bg-[#25D366]/90"
              asChild
            >
              <a
                href={waLink(
                  ADMIN_WHATSAPP,
                  `Hi! I just placed order #${lastOrder?.order_number} for total ${inr(Number(lastOrder?.total_amount))}. Please confirm my order!`,
                )}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle className="mr-2 size-4" /> Share Order to WhatsApp
              </a>
            </Button>
          </div>
        ) : (
          <p className="mb-6 text-muted-foreground">Your cart is empty.</p>
        )}
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button type="button" onClick={() => router.push("/products")} variant="outline">
            <ArrowLeft className="mr-2 size-4" /> Browse More
          </Button>
          {orderJustConfirmed && (
            <Button type="button" onClick={() => router.push("/dashboard/orders")}>
              View My Orders
            </Button>
          )}
        </div>
      </div>
    );

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_min(320px,100%)] xl:grid-cols-[minmax(0,1fr)_min(380px,100%)] xl:gap-10">
      <div className="space-y-8">
        <section className="rounded-lg border bg-card">
          <div className="border-b px-4 py-3">
            <h1 className="text-lg font-semibold">Cart items</h1>
            <p className="text-sm text-muted-foreground">Review items and choose payment below.</p>
          </div>
          <ul className="divide-y">
            {cart.items.map((i) => (
              <li
                key={i.id}
                className="grid grid-cols-[5rem_minmax(0,1fr)] gap-3 p-4 sm:grid-cols-[5rem_minmax(0,1fr)_auto] sm:items-center sm:gap-4"
              >
                <img
                  src={i.image_url ?? "https://placehold.co/64"}
                  alt={i.name}
                  className="row-span-2 size-20 rounded-md border bg-secondary object-cover sm:row-span-1"
                />
                <div className="flex min-w-0 items-start justify-between gap-3 sm:block">
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-semibold leading-snug sm:text-base">
                      {i.name}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {inr(i.price)} × {i.quantity}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {itemWeightKg(i.id, i.weight_kg).toFixed(2)} kg × {i.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-primary sm:hidden">
                    {inr(i.price * i.quantity)}
                  </p>
                </div>
                <p className="hidden text-sm font-semibold text-primary sm:block sm:w-24 sm:text-right">
                  {inr(i.price * i.quantity)}
                </p>
                <div className="col-start-2 flex items-center gap-2 sm:col-start-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    className="size-9 p-0"
                    onClick={() => cart.setQty(i.id, i.quantity - 1)}
                  >
                    −
                  </Button>
                  <span className="w-8 text-center text-sm tabular-nums">{i.quantity}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    className="size-9 p-0"
                    onClick={() => cart.setQty(i.id, i.quantity + 1)}
                  >
                    +
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    type="button"
                    aria-label="Remove"
                    onClick={() => cart.remove(i.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2 border-t p-4">
            <Button variant="outline" type="button" onClick={() => router.push("/products")}>
              <ArrowLeft className="mr-2 size-4" /> Continue shopping
            </Button>
          </div>
        </section>

        <section className="rounded-lg border bg-card p-4 shadow-sm">
          <h2 className="font-semibold">Payment method</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Frontend demo — orders are saved in your browser only.
          </p>

          <div className="mt-4 space-y-2">
            <label
              className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition hover:bg-accent"
              htmlFor="pay-cod"
            >
              <input
                id="pay-cod"
                type="radio"
                name="payment"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
                className="mt-1"
              />
              <div>
                <p className="font-medium">Cash on delivery</p>
                <p className="text-sm text-muted-foreground">Pay when order arrives.</p>
              </div>
            </label>

            <label
              className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition hover:bg-accent"
              htmlFor="pay-bank"
            >
              <input
                id="pay-bank"
                type="radio"
                name="payment"
                checked={paymentMethod === "bank"}
                onChange={() => setPaymentMethod("bank")}
                className="mt-1"
              />
              <div>
                <p className="font-medium">Bank transfer</p>
                <p className="text-sm text-muted-foreground">
                  Transfer using the bank details below, then upload a receipt image.
                </p>
              </div>
            </label>
          </div>

          {paymentMethod === "bank" && (
            <div className="mt-4 space-y-4 rounded-lg border bg-secondary/40 p-4">
              <p className="text-sm font-medium text-foreground">Transfer to</p>
              <dl className="space-y-2 text-sm">
                {WANSHI_BANK_ROWS.map(([k, v]) => (
                  <div key={k} className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
                    <dt className="shrink-0 font-medium text-muted-foreground sm:w-[8.5rem]">
                      {k}
                    </dt>
                    <dd className="break-all text-foreground">{v}</dd>
                  </div>
                ))}
              </dl>

              <Separator />

              <div className="space-y-3">
                <Label className="text-sm font-medium">Upload receipt</Label>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onReceiptFile}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => fileRef.current?.click()}
                  >
                    <Upload className="size-4" />
                    Choose file
                  </Button>
                  {uploadReceipt && (
                    <>
                      <span
                        className="max-w-[12rem] truncate text-xs text-muted-foreground"
                        title={receiptName ?? "Receipt"}
                      >
                        {receiptName ?? "Receipt uploaded"}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={clearReceipt}
                      >
                        Clear
                      </Button>
                    </>
                  )}
                </div>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  JPG or PNG, up to {RECEIPT_MAX_BYTES / 1024} KB.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <section className="rounded-lg border bg-card p-4 shadow-sm">
          <h2 className="font-semibold">Order summary</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {cart.items.map((i) => (
              <li key={`sum-${i.id}`} className="flex justify-between gap-4 text-muted-foreground">
                <span className="line-clamp-2 text-foreground">
                  {i.name} × {i.quantity}
                </span>
                <span className="shrink-0 font-medium">{inr(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <Separator className="my-4" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Items subtotal</span>
              <span className="font-medium">{inr(itemSubtotal)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">
                Weight fee ({totalWeightKg.toFixed(2)} kg,{" "}
                {appliedWeightFeeBracketLabel(totalWeightKg)})
              </span>
              <span className="font-medium">{inr(weightFee)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Delivery fee</span>
              <span className="font-medium">{inr(deliveryFee)}</span>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="flex items-baseline justify-between text-lg font-semibold">
            <span>Total</span>
            <span className="text-xl text-primary">{inr(grandTotal)}</span>
          </div>
        </section>

        <Button
          className="w-full"
          size="lg"
          type="button"
          onClick={checkout}
          disabled={busy || (paymentMethod === "bank" && !uploadReceipt.trim())}
        >
          {busy ? "Processing…" : "Place order"}
        </Button>
      </aside>
    </div>
  );
}
