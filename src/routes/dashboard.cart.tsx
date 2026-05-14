import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { inr } from "@/lib/format";
import { toast } from "sonner";
import { useRef, useState } from "react";
import { ADMIN_WHATSAPP, waLink } from "@/lib/whatsapp";
import { insertOrderFlexible } from "@/lib/orders-insert";
import { Trash2, ArrowLeft, Upload } from "lucide-react";

export const Route = createFileRoute("/dashboard/cart")({ component: CartPage });

/** Saved on bank-transfer orders for admin reference */
const WANSHI_BANK_SNAPSHOT = [
  "Bank name: Commercial Bank",
  "Account number: 8108042652",
  "Account holder: Wanshi pvt limit",
  "Branch: Jaffna",
].join("\n");

const WANSHI_BANK_ROWS: [string, string][] = [
  ["Bank name", "Commercial Bank"],
  ["Account number", "8108042652"],
  ["Account holder", "Wanshi pvt limit"],
  ["Branch", "Jaffna"],
];

const RECEIPT_MAX_BYTES = 524_288;

function CartPage() {
  const cart = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bank">("cod");
  const [uploadReceipt, setUploadReceipt] = useState("");
  const [receiptName, setReceiptName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const checkout = async () => {
    if (!user || cart.items.length === 0) return;
    if (paymentMethod === "bank" && !uploadReceipt.trim()) {
      toast.error("Please upload your payment receipt");
      return;
    }

    setBusy(true);
    const {
      data: order,
      error,
      usedLegacyPaymentFallback,
    } = await insertOrderFlexible(supabase, {
      userId: user.id,
      total: cart.total,
      paymentMethod,
      bankSnapshot: WANSHI_BANK_SNAPSHOT,
      receiptDataUrl: paymentMethod === "bank" ? uploadReceipt.trim() || null : null,
    });

    if (error || !order) {
      setBusy(false);
      toast.error(error?.message ?? "Could not place order");
      return;
    }

    if (usedLegacyPaymentFallback) {
      toast.info(
        "Order recorded. Apply the Supabase migration for payment columns (`payment_method`, `bank_details`, `receipt_url`) when your database is updated.",
      );
    }

    await supabase.from("order_items").insert(
      cart.items.map((i) => ({
        order_id: order.id,
        product_id: i.id,
        product_name: i.name,
        quantity: i.quantity,
        price_at_purchase: i.price,
      })),
    );

    const summary = `New Wanshi Order #${order.order_number}\n\n${cart.items.map((i) => `• ${i.name} x${i.quantity} — ${inr(i.price * i.quantity)}`).join("\n")}\n\nTotal: ${inr(cart.total)}\n\nPayment Method: ${paymentMethod === "cod" ? "Cash on Delivery" : "Bank Transfer"}`;
    cart.clear();
    setBusy(false);
    toast.success("Order placed successfully!");
    window.open(waLink(ADMIN_WHATSAPP, summary), "_blank");
    nav({ to: "/dashboard/orders" });
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
        <p className="text-muted-foreground mb-4">Your cart is empty.</p>
        <Button onClick={() => nav({ to: "/products" })} variant="default">
          <ArrowLeft className="mr-2 size-4" /> Continue Shopping
        </Button>
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
              <li key={i.id} className="flex flex-wrap items-center gap-4 p-4 sm:flex-nowrap">
                <img
                  src={i.image_url ?? "https://placehold.co/64"}
                  alt={i.name}
                  className="size-20 shrink-0 rounded-md border bg-secondary object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium leading-snug">{i.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {inr(i.price)} × {i.quantity}
                  </p>
                </div>
                <p className="text-sm font-semibold text-primary sm:w-24 sm:text-right">
                  {inr(i.price * i.quantity)}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    onClick={() => cart.setQty(i.id, i.quantity - 1)}
                  >
                    −
                  </Button>
                  <span className="w-8 text-center text-sm">{i.quantity}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
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
            <Button variant="outline" type="button" onClick={() => nav({ to: "/products" })}>
              <ArrowLeft className="mr-2 size-4" /> Continue shopping
            </Button>
          </div>
        </section>

        <section className="rounded-lg border bg-card p-4 shadow-sm">
          <h2 className="font-semibold">Payment method</h2>
          <p className="mt-1 text-sm text-muted-foreground">Cash on delivery or bank transfer.</p>

          <div className="mt-4 space-y-2">
            <label
              className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition hover:bg-accent"
              onClick={() => setPaymentMethod("cod")}
            >
              <input
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
              onClick={() => setPaymentMethod("bank")}
            >
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "bank"}
                onChange={() => setPaymentMethod("bank")}
                className="mt-1"
              />
              <div>
                <p className="font-medium">Bank transfer</p>
                <p className="text-sm text-muted-foreground">
                  Transfer using the bank details shown below, then upload your receipt image.
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
                    <dt className="font-medium text-muted-foreground sm:w-[8.5rem] shrink-0">
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
          <div className="flex items-baseline justify-between text-lg font-semibold">
            <span>Total</span>
            <span className="text-xl text-primary">{inr(cart.total)}</span>
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
