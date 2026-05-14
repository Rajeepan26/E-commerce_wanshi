import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";

export interface Notification {
  id: string;
  message: string;
  type: "success" | "info" | "warning" | "error";
}

let notificationId = 0;
const listeners: Set<(notifications: Notification[]) => void> = new Set();
let currentNotifications: Notification[] = [];

export function showNotification(message: string, type: "success" | "info" | "warning" | "error" = "info") {
  const id = String(notificationId++);
  const notification: Notification = { id, message, type };
  currentNotifications = [...currentNotifications, notification];
  
  listeners.forEach(listener => listener(currentNotifications));
  
  setTimeout(() => {
    removeNotification(id);
  }, 4000);
}

export function removeNotification(id: string) {
  currentNotifications = currentNotifications.filter(n => n.id !== id);
  listeners.forEach(listener => listener(currentNotifications));
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    listeners.add(setNotifications);
    return () => listeners.delete(setNotifications);
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`flex items-start gap-3 p-4 rounded-lg border backdrop-blur-sm animate-in slide-in-from-top-2 duration-300 ${
            notification.type === "success" ? "bg-success/20 border-success/50 text-success" :
            notification.type === "error" ? "bg-destructive/20 border-destructive/50 text-destructive" :
            notification.type === "warning" ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-600" :
            "bg-purple-500/20 border-purple-500/50 text-purple-600"
          }`}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Bell className="size-4 animate-pulse" />
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
