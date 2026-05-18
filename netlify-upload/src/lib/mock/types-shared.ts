/** Shared app types (no database — demo frontend only). */
export type DemoRole = "admin" | "customer" | null;

export type DemoAuthUser = {
  id: string;
  email?: string;
  app_metadata?: { full_name?: string };
};
