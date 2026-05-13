import { ADMIN_WHATSAPP, waLink } from "@/lib/whatsapp";
import { MessageCircle } from "lucide-react";

export function WhatsappFab() {
  return (
    <a
      href={waLink(ADMIN_WHATSAPP, "Hi, I need help with my order")}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-50 grid size-14 place-items-center rounded-full bg-success text-success-foreground shadow-lg transition hover:scale-105"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="size-7" />
    </a>
  );
}