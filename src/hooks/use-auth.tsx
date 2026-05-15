"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { DemoAuthUser, DemoRole } from "@/lib/mock/types-shared";
import { loadPersistedSession, persistSession, readRole } from "@/lib/mock/auth-session";

type AuthCtx = {
  user: DemoAuthUser | null;
  role: DemoRole;
  loading: boolean;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  user: null,
  role: null,
  loading: true,
  signOut: async () => {},
});

export type { DemoRole };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoAuthUser | null>(null);
  const [role, setRole] = useState<DemoRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sync = () => {
      const stored = loadPersistedSession();
      setUser(stored);
      setRole(stored?.id ? readRole(stored.id) : null);
      setLoading(false);
    };
    sync();
    if (typeof window === "undefined") return undefined;
    const onAuth = () => sync();
    window.addEventListener("wanshi:auth", onAuth);
    window.addEventListener("storage", onAuth);
    return () => {
      window.removeEventListener("wanshi:auth", onAuth);
      window.removeEventListener("storage", onAuth);
    };
  }, []);

  return (
    <Ctx.Provider
      value={{
        user,
        role,
        loading,
        signOut: async () => {
          persistSession(null);
          setUser(null);
          setRole(null);
        },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
