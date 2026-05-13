import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { seedDemoUsers } from "@/lib/demo-seed.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  const { role, user } = useAuth();
  const seed = useServerFn(seedDemoUsers);

  useEffect(() => {
    seed().catch(() => {});
  }, [seed]);

  useEffect(() => {
    if (user) {
      if (role === "admin") nav({ to: "/admin" });
      else nav({ to: "/dashboard/profile" });
    }
  }, [user, role, nav]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Welcome back!");
  };

  const fill = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
  };

  return (
    <div className="grid min-h-screen place-items-center bg-secondary/30 px-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-sm">
        <Link to="/" className="block text-center text-2xl font-extrabold text-primary">
          Wanshi
        </Link>
        <h1 className="mt-4 text-center text-xl font-semibold">Sign in to your account</h1>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          New to Wanshi?{" "}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </p>
        <div className="mt-6 rounded-lg border bg-primary-soft p-3 text-xs">
          <p className="font-semibold text-foreground">Demo accounts</p>
          <ul className="mt-2 space-y-1">
            <li>
              <button type="button" onClick={() => fill("admin@wanshi.com", "admin123")} className="text-primary hover:underline">
                admin@wanshi.com / admin123
              </button>{" "}
              (Admin)
            </li>
            <li>
              <button type="button" onClick={() => fill("user@wanshi.com", "user123")} className="text-primary hover:underline">
                user@wanshi.com / user123
              </button>
            </li>
            <li>
              <button type="button" onClick={() => fill("priya@wanshi.com", "priya123")} className="text-primary hover:underline">
                priya@wanshi.com / priya123
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}