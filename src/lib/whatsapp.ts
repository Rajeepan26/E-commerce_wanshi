export const ADMIN_WHATSAPP = "94754641052";

export function waLink(phone: string, message: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}
