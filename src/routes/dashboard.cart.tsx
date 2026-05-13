import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { inr } from "@/lib/format";
import { toast } from "sonner";
import { useState } from "react";
import { ADMIN_WHATSAPP, waLink } from "@/lib/whatsapp";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/dashboard/cart")({ component: CartPage });

function CartPage() {
  const cart = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);

  const checkout = async () => {
    if (!user || cart.items.length === 0) return;
    setBusy(true);
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        total_amount: cart.total,
        status: "Pending",
        shipping_address: address,
        shipping_phone: phone,
      })
      .select()
      .single();
    if (error) {
      setBusy(false);
      toast.error(error.message);
      return;
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
    const summary = `New Wanshi Order #${order.order_number}\n\n${cart.items.map((i) => `• ${i.name} x${i.quantity} — ${inr(i.price * i.quantity)}`).join("\n")}\n\nTotal: ${inr(cart.total)}`;
    cart.clear();
    setBusy(false);
    toast.success("Order placed!");
    window.open(waLink(ADMIN_WHATSAPP, summary), "_blank");
    nav({ to: "/dashboard/orders" });
  };

  if (cart.items.length === 0)
    return <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">Your cart is empty.</div>;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card">
        {cart.items.map((i) => (
          <div key={i.id} className="flex items-center gap-4 border-b p-4 last:border-b-0">
            <img src={i.image_url ?? ""} alt={i.name} className="size-16 rounded object-cover" />
            <div className="flex-1">
              <p className="font-medium">{i.name}</p>
              <p className="text-sm text-primary">{inr(i.price)}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => cart.setQty(i.id, i.quantity - 1)}>-</Button>
              <span className="w-6 text-center">{i.quantity}</span>
              <Button size="sm" variant="outline" onClick={() => cart.setQty(i.id, i.quantity + 1)}>+</Button>
            </div>
            <Button size="icon" variant="ghost" onClick={() => cart.remove(i.id)}><Trash2 className="size-4" /></Button>
          </div>
        ))}
      </div>
      <div className="rounded-lg border bg-card p-4">
        <div className="mb-3 flex justify-between text-lg font-semibold">
          <span>Total</span><span className="text-primary">{inr(cart.total)}</span>
        </div>
        <div className="space-y-3">
          <Input placeholder="Shipping address" value={address} onChange={(e) => setAddress(e.target.value)} />
          <Input placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Button className="w-full" onClick={checkout} disabled={busy || !address || !phone}>
            {busy ? "Placing order…" : "Proceed to Checkout"}
          </Button>
        </div>
      </div>
    </div>
  );
}