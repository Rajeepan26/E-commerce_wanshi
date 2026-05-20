"use client";

import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type HeaderNotification = {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
};

type HeaderNotificationPopoverProps = {
  notifications: HeaderNotification[];
  unreadCount: number;
  badgeLabel: string;
  emptyHint: string;
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
  triggerClassName?: string;
  contentClassName?: string;
  iconClassName?: string;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
};

export function HeaderNotificationPopover({
  notifications,
  unreadCount,
  badgeLabel,
  emptyHint,
  onMarkAllRead,
  onMarkRead,
  triggerClassName,
  contentClassName,
  iconClassName,
  side,
  sideOffset,
}: HeaderNotificationPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "relative shrink-0 rounded-xl",
            triggerClassName?.includes("size-11") && "[&_svg]:size-5",
            triggerClassName,
          )}
          aria-label="Notifications"
        >
          <span
            className={cn(
              "grid shrink-0 place-items-center",
              triggerClassName?.includes("size-11")
                ? "size-5 [&_svg]:size-5"
                : "size-4 [&_svg]:size-4",
              iconClassName,
            )}
          >
            <Bell strokeWidth={2.25} aria-hidden />
          </span>
          {unreadCount > 0 && (
            <span
              className={cn(
                "absolute grid place-items-center rounded-full bg-destructive font-bold text-destructive-foreground shadow-sm",
                triggerClassName?.includes("size-11")
                  ? "right-0.5 top-0.5 min-w-[18px] px-1 py-px text-[10px] leading-none ring-2 ring-background"
                  : "-right-0.5 -top-0.5 size-4 text-[8px]",
              )}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side={side}
        sideOffset={sideOffset}
        className={cn(
          "w-80 p-0 sm:w-96 rounded-2xl shadow-xl border-border/80 overflow-hidden",
          contentClassName,
        )}
      >
        <div className="border-b p-4 bg-muted/20">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <Bell className="size-4 text-primary shrink-0" /> Notifications
              </h3>
              {unreadCount > 0 && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  You have {unreadCount} unread message{unreadCount > 1 ? "s" : ""}
                </p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMarkAllRead}
                  className="text-[10px] text-primary hover:text-primary-hover font-semibold px-2 py-1 h-auto rounded-md bg-primary-soft/45 hover:bg-primary-soft"
                >
                  Mark all read
                </Button>
              )}
              <span className="text-[10px] bg-primary-soft text-primary font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                {badgeLabel}
              </span>
            </div>
          </div>
        </div>
        <div className="max-h-[min(280px,50dvh)] overflow-y-auto p-4 space-y-3">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "rounded-xl border p-3 text-left transition-all relative group flex flex-col gap-1.5",
                  n.read
                    ? "bg-card border-border/60 hover:bg-muted/30"
                    : "bg-primary-soft/10 border-primary/20 hover:bg-primary-soft/15",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {!n.read && <span className="size-2 shrink-0 rounded-full bg-primary" />}
                    <p
                      className={cn(
                        "text-xs font-bold",
                        n.read ? "text-foreground" : "text-primary",
                      )}
                    >
                      {n.title}
                    </p>
                  </div>
                  {!n.read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onMarkRead(n.id)}
                      className="size-6 shrink-0 rounded-lg opacity-80 hover:opacity-100 hover:bg-primary-soft"
                      title="Mark as read"
                    >
                      <Check className="size-3 text-primary" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed pr-2">{n.message}</p>
                <p className="text-[10px] text-muted-foreground/80">
                  {new Date(n.created_at).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground text-xs space-y-1">
              <p className="font-medium text-foreground">All caught up! 🎉</p>
              <p>{emptyHint}</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
