import Link from "next/link";
import { Facebook, Instagram, Twitter, MessageCircle, Mail, Phone, MapPin } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-sky-200 bg-sky-100">
      <div className="mx-auto w-full max-w-7xl grid gap-10 px-6 py-12 text-sm text-sky-900 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand Section */}
        <div className="space-y-4">
          <p className="text-2xl font-extrabold tracking-tight text-primary">Wanshi</p>
          <p className="max-w-xs leading-relaxed text-sky-800 font-medium">
            Sri Lanka&apos;s lean shopping destination. High reliability, secure payments, and
            transparent tracking.
          </p>
        </div>

        {/* Quick Links Section */}
        <div className="space-y-5">
          <p className="font-bold uppercase tracking-wider text-sky-950">Support</p>
          <ul className="space-y-3">
            <li>
              <Link
                href="/dashboard/orders"
                className="hover:text-primary transition-colors font-medium"
              >
                Returns Policy
              </Link>
            </li>
            <li>
              <Link href="/products" className="hover:text-primary transition-colors font-medium">
                Become a Seller
              </Link>
            </li>
          </ul>
        </div>

        {/* Attractive Contact Section */}
        <div className="space-y-5">
          <p className="font-bold uppercase tracking-wider text-sky-950">Get in Touch</p>
          <ul className="space-y-4">
            <li className="flex items-center gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                <MapPin className="size-4 text-primary" />
              </div>
              <span className="font-medium">Jaffna, Sri Lanka</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                <Phone className="size-4 text-primary" />
              </div>
              <span className="font-medium">+94 77 123 4567</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                <Mail className="size-4 text-primary" />
              </div>
              <span className="font-medium">hello@wanshi.lk</span>
            </li>
          </ul>
        </div>

        {/* Social Section */}
        <div className="space-y-5">
          <p className="font-bold uppercase tracking-wider text-sky-950">Follow Wanshi</p>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://wa.me/94771234567"
              target="_blank"
              rel="noreferrer"
              className="flex size-10 items-center justify-center rounded-xl bg-white text-[#25D366] shadow-sm ring-1 ring-black/5 transition-all hover:scale-110 hover:shadow-md"
              aria-label="WhatsApp"
            >
              <MessageCircle className="size-5" />
            </a>
            <a
              href="#"
              className="flex size-10 items-center justify-center rounded-xl bg-white text-[#1877F2] shadow-sm ring-1 ring-black/5 transition-all hover:scale-110 hover:shadow-md"
              aria-label="Facebook"
            >
              <Facebook className="size-5" />
            </a>
            <a
              href="#"
              className="flex size-10 items-center justify-center rounded-xl bg-white text-[#E4405F] shadow-sm ring-1 ring-black/5 transition-all hover:scale-110 hover:shadow-md"
              aria-label="Instagram"
            >
              <Instagram className="size-5" />
            </a>
            <a
              href="#"
              className="flex size-10 items-center justify-center rounded-xl bg-white text-black shadow-sm ring-1 ring-black/5 transition-all hover:scale-110 hover:shadow-md"
              aria-label="X (Twitter)"
            >
              <Twitter className="size-5" />
            </a>
          </div>
          <p className="text-xs text-sky-700 font-medium leading-relaxed">
            Join our community for exclusive drops and limited time offers.
          </p>
        </div>
      </div>

      <div className="border-t border-sky-200/50 bg-sky-200/20 py-8 text-center px-4">
        <p className="text-xs font-semibold text-sky-900/40 uppercase tracking-[0.2em]">
          © {new Date().getFullYear()} Wanshi. Engineered for lean commerce.
        </p>
      </div>
    </footer>
  );
}
