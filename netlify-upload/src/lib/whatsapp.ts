export const ADMIN_WHATSAPP = "919876543210";

export function waLink(phone: string, message: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}
