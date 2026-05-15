"use client";

import { useState, useEffect } from "react";
import { Bell, Loader2, X } from "lucide-react";

export interface Notification {
  id: string;
  message: string;
  type: "success" | "info" | "warning" | "error";
}

let notificationId = 0;
const listeners: Set<(notifications: Notification[]) => void> = new Set();
let currentNotifications: Notification[] = [];

export function showNotification(
  message: string,
  type: "success" | "info" | "warning" | "error" = "info",
) {
  const id = String(notificationId++);
  const notification: Notification = { id, message, type };
  currentNotifications = [...currentNotifications, notification];

  listeners.forEach((listener) => listener(currentNotifications));

  setTimeout(() => {
    removeNotification(id);
  }, 4000);
}

export function removeNotification(id: string) {
  currentNotifications = currentNotifications.filter((n) => n.id !== id);
  listeners.forEach((listener) => listener(currentNotifications));
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    listeners.add(setNotifications);
    return () => {
      listeners.delete(setNotifications);
    };
  }, []);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed z-[999999998] max-w-sm space-y-2 pl-2"
      style={{
        top: "max(0.75rem, env(safe-area-inset-top))",
        right: "max(0.75rem, env(safe-area-inset-right))",
      }}
    >
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`pointer-events-auto flex animate-in items-start gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm duration-300 fade-in slide-in-from-right-4 motion-reduce:animate-none motion-reduce:opacity-100 ${
            notification.type === "success"
              ? "border-success/35 bg-success/10 text-success dark:bg-success/15"
              : notification.type === "error"
                ? "border-destructive/35 bg-destructive/8 text-destructive"
                : notification.type === "warning"
                  ? "border-yellow-500/35 bg-yellow-500/10 text-yellow-700 dark:text-yellow-500"
                  : "border-primary/25 bg-primary-soft/60 text-primary"
          }`}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {notification.type === "error" ? (
                <Loader2
                  className="size-4 shrink-0 animate-spin text-destructive"
                  aria-hidden
                  strokeWidth={2.5}
                />
              ) : (
                <Bell className="size-4 shrink-0 text-current" aria-hidden />
              )}
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => removeNotification(notification.id)}
            className="rounded-sm text-muted-foreground transition hover:text-foreground"
          >
            <X className="size-4" />
            <span className="sr-only">Dismiss</span>
          </button>
        </div>
      ))}
    </div>
  );
}
