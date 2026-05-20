"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bike, Truck } from "lucide-react";

interface LogisticsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (method: "local" | "regional") => void;
}

export function LogisticsDialog({ open, onOpenChange, onSelect }: LogisticsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Delivery Method</DialogTitle>
          <DialogDescription>
            Choose how this order should be fulfilled. This will update the order status to Accepted.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <button
            onClick={() => onSelect("local")}
            className="flex flex-col items-center gap-3 rounded-xl border-2 border-transparent bg-secondary/50 p-6 transition-all hover:border-primary hover:bg-white hover:shadow-md group"
          >
            <div className="rounded-full bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <Bike className="size-6" />
            </div>
            <div className="text-center">
              <p className="font-bold">Local Delivery</p>
              <p className="text-xs text-muted-foreground mt-1">3rd Party Dedicated (Bike/Flash)</p>
            </div>
          </button>

          <button
            onClick={() => onSelect("regional")}
            className="flex flex-col items-center gap-3 rounded-xl border-2 border-transparent bg-secondary/50 p-6 transition-all hover:border-primary hover:bg-white hover:shadow-md group"
          >
            <div className="rounded-full bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <Truck className="size-6" />
            </div>
            <div className="text-center">
              <p className="font-bold">Regional Parcel</p>
              <p className="text-xs text-muted-foreground mt-1">Standard Courier Service</p>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
