import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingCart, User as UserIcon, LogOut, LayoutDashboard, Search } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const CATS = [
  { name: "Women", slug: "womens-clothing" },
  { name: "Men", slug: "mens-clothing" },
  { name: "Kids", slug: "kids-clothing" },
  { name: "Footwear", slug: "footwear" },
  { name: "Beauty", slug: "beauty" },
  { name: "Accessories", slug: "accessories" },
  { name: "Home", slug: "home-decor" },
  { name: "Kitchen", slug: "kitchen" },
  { name: "Electronics", slug: "electronics" },
];

export function SiteHeader() {
  const { user, role, signOut } = useAuth();
  const { count } = useCart();
  const nav = useNavigate();
  const [q, setQ] = useState("");

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container mx-auto flex items-center gap-3 px-4 py-3">
        <Link to="/" className="text-2xl font-extrabold tracking-tight text-primary">
          Wanshi
        </Link>
        <form
          className="hidden flex-1 sm:block"
          onSubmit={(e) => {
            e.preventDefault();
            nav({ to: "/products", search: { q } });
          }}
        >
          <div className="relative mx-auto max-w-2xl">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products, brands and more"
              className="pl-9"
            />
          </div>
        </form>
        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              {role === "admin" && (
                <Button asChild variant="ghost" size="sm">
                  <Link to="/admin">
                    <LayoutDashboard className="size-4" /> Admin
                  </Link>
                </Button>
              )}
              <Button asChild variant="ghost" size="sm">
                <Link to="/dashboard/profile">
                  <UserIcon className="size-4" /> Account
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                <LogOut className="size-4" />
              </Button>
            </>
          ) : (
            <Button asChild variant="ghost" size="sm">
              <Link to="/login">
                <UserIcon className="size-4" /> Login
              </Link>
            </Button>
          )}
          <Button asChild variant="outline" size="sm" className="relative">
            <Link to="/dashboard/cart">
              <ShoppingCart className="size-4" />
              <span className="hidden sm:inline">Cart</span>
              {count > 0 && (
                <span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {count}
                </span>
              )}
            </Link>
          </Button>
        </div>
      </div>
      <nav className="border-t bg-secondary/40">
        <div className="container mx-auto flex gap-1 overflow-x-auto px-2 py-2 text-sm">
          {CATS.map((c) => (
            <Link
              key={c.slug}
              to="/products"
              search={{ category: c.slug }}
              className="whitespace-nowrap rounded-full px-3 py-1.5 text-foreground/80 hover:bg-accent hover:text-accent-foreground"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}