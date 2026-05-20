"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { tryDemoSignIn } from "@/lib/mock/auth-session";

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const { role, user } = useAuth();

  useEffect(() => {
    if (user) {
      if (redirect) router.replace(redirect);
      else if (role === "admin") router.replace("/admin");
      else router.replace("/dashboard");
    }
  }, [user, role, router, redirect]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const result = tryDemoSignIn(email, password);
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Welcome back!");
    if (redirect) router.replace(redirect);
    else if (result.role === "admin") router.replace("/admin");
    else router.replace("/dashboard");
  };

  const fill = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
  };

  return (
    <main className="grid flex-1 place-items-center px-4 py-8">
      <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm sm:p-8">
        <Link href="/" className="block text-center text-2xl font-extrabold text-primary">
          Wanshi
        </Link>
        <h1 className="mt-4 text-center text-xl font-semibold">Sign in to your account</h1>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          New to Wanshi?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </p>
        <div className="mt-6 rounded-lg border bg-primary-soft p-3 text-xs">
          <p className="font-semibold text-foreground">Demo accounts</p>
          <ul className="mt-2 space-y-1">
            <li>
              <button
                type="button"
                onClick={() => fill("admin@wanshi.com", "admin123")}
                className="text-primary hover:underline"
              >
                admin@wanshi.com / admin123
              </button>{" "}
              (Admin)
            </li>
            <li>
              <button
                type="button"
                onClick={() => fill("user@wanshi.com", "user123")}
                className="text-primary hover:underline"
              >
                user@wanshi.com / user123
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => fill("priya@wanshi.com", "priya123")}
                className="text-primary hover:underline"
              >
                priya@wanshi.com / priya123
              </button>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <Suspense fallback={<div className="flex-1 grid place-items-center">Loading...</div>}>
        <LoginContent />
      </Suspense>
      <SiteFooter />
    </div>
  );
}
