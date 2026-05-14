import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-sky-200 bg-sky-100">
      <div className="container mx-auto grid gap-6 px-4 py-8 text-sm text-sky-900 sm:grid-cols-4">
        <div>
          <p className="text-lg font-extrabold text-primary">Wanshi</p>
          <p className="mt-1 text-sky-800">India's lean shopping destination.</p>
        </div>
        <div>
          <p className="mb-2 font-semibold text-sky-950">Help</p>
          <p>About</p>
          <p>Contact</p>
          <p>Returns Policy</p>
        </div>
        <div>
          <p className="mb-2 font-semibold text-sky-950">Sell</p>
          <p>Become a Seller</p>
        </div>
        <div>
          <p className="mb-2 font-semibold text-sky-950">Connect</p>
          <p>WhatsApp · Instagram · X</p>
          <Link to="/" className="mt-2 inline-block text-primary hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
      <div className="border-t border-sky-200 bg-sky-200/60 py-3 text-center text-xs text-sky-900">
        © {new Date().getFullYear()} Wanshi. All rights reserved.
      </div>
    </footer>
  );
}