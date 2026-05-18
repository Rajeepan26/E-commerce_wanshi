"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

export default function NotificationsPage() {
  const { user } = useAuth();

  const { data: notifications } = useQuery({
    queryKey: ["demo-notifications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return [];
      return [] as Array<{
        id: string;
        title: string;
        message: string;
        created_at: string;
      }>;
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Notifications</h1>
      <p className="text-sm text-muted-foreground">
        Demo storefront — notifications would appear here when connected to a backend.
      </p>
      {notifications && notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="rounded-lg border bg-card p-4 transition-all hover:bg-muted/30"
            >
              <p className="font-medium">{n.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {new Date(n.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          <p>No notifications yet</p>
        </div>
      )}
    </div>
  );
}
