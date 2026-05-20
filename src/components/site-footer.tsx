import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-sky-200 bg-sky-100">
      <div className="mx-auto w-full max-w-7xl grid gap-8 px-4 sm:px-6 lg:px-8 py-8 text-sm text-sky-900 sm:grid-cols-2 sm:gap-10 lg:grid-cols-4 lg:gap-8">
        <div className="text-center sm:text-left">
          <p className="text-lg font-extrabold text-primary">Wanshi</p>
          <p className="mt-1 text-sky-800">Sri Lanka&apos;s lean shopping destination.</p>
        </div>
        <div className="text-center sm:text-left">
          <p className="mb-2 font-semibold text-sky-950">Help</p>
          <p>About</p>
          <p>Contact</p>
          <p>Returns Policy</p>
        </div>
        <div className="text-center sm:text-left">
          <p className="mb-2 font-semibold text-sky-950">Sell</p>
          <p>Become a Seller</p>
        </div>
        <div className="text-center sm:text-left">
          <p className="mb-2 font-semibold text-sky-950">Connect</p>
          <p>WhatsApp · Instagram · X</p>
          <Link href="/" className="mt-2 inline-block text-primary hover:underline">
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
