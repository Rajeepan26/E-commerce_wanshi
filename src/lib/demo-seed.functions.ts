import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const DEMO = [
  { email: "admin@wanshi.com", password: "admin123", full_name: "Wanshi Admin", role: "admin" as const },
  { email: "user@wanshi.com", password: "user123", full_name: "Demo User", role: "customer" as const },
  { email: "priya@wanshi.com", password: "priya123", full_name: "Priya Sharma", role: "customer" as const },
];

export const seedDemoUsers = createServerFn({ method: "POST" }).handler(async () => {
  const created: Record<string, string> = {};
  for (const u of DEMO) {
    const { data: list } = await supabaseAdmin.auth.admin.listUsers();
    let existing = list.users.find((x) => x.email === u.email);
    if (!existing) {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { full_name: u.full_name },
      });
      if (error) throw error;
      existing = data.user!;
    }
    created[u.email] = existing.id;
    if (u.role === "admin") {
      await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: existing.id, role: "admin" }, { onConflict: "user_id,role" });
    }
  }

  // Seed sample orders if not present
  const userId = created["user@wanshi.com"];
  const priyaId = created["priya@wanshi.com"];

  const { data: existingOrders } = await supabaseAdmin
    .from("orders")
    .select("id")
    .in("user_id", [userId, priyaId]);

  if ((existingOrders?.length ?? 0) === 0) {
    const { data: products } = await supabaseAdmin
      .from("products")
      .select("id,name,price")
      .limit(6);
    const p = products ?? [];
    if (p.length >= 3) {
      const insertOrder = async (
        uid: string,
        status: "Delivered" | "In-Transit" | "Pending",
        items: typeof p,
      ) => {
        const total = items.reduce((s, it) => s + Number(it.price), 0);
        const { data: order, error } = await supabaseAdmin
          .from("orders")
          .insert({
            user_id: uid,
            total_amount: total,
            status,
            shipping_address: "123 Demo Street, Bengaluru, KA 560001",
            shipping_phone: "+91 9876500000",
          })
          .select()
          .single();
        if (error) throw error;
        await supabaseAdmin.from("order_items").insert(
          items.map((it) => ({
            order_id: order.id,
            product_id: it.id,
            product_name: it.name,
            quantity: 1,
            price_at_purchase: it.price,
          })),
        );
        return order;
      };

      await insertOrder(userId, "Delivered", p.slice(0, 2));
      const transitOrder = await insertOrder(priyaId, "In-Transit", p.slice(2, 3));
      await insertOrder(userId, "Pending", p.slice(3, 6));

      const { data: partner } = await supabaseAdmin
        .from("delivery_partners")
        .select("id")
        .eq("name", "Blue Dart")
        .single();
      if (partner && transitOrder) {
        await supabaseAdmin.from("shipments").insert({
          order_id: transitOrder.id,
          partner_id: partner.id,
          tracking_number: "BL-493821",
          dispatch_time: new Date().toISOString(),
          estimated_delivery: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
          notes: "Out for delivery soon",
        });
      }
    }
  }

  return { ok: true };
});