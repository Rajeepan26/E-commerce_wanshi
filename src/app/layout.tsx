import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000",
  ),
  title: {
    default: "Wanshi — Sri Lanka's lean shopping destination",
    template: "%s — Wanshi",
  },
  description: "Shop trending products at unbeatable prices in Sri Lanka on Wanshi.",
  authors: [{ name: "Wanshi" }],
  openGraph: {
    title: "Wanshi — Sri Lanka's lean shopping destination",
    description: "Shop trending products at unbeatable prices in Sri Lanka on Wanshi.",
    type: "website",
  },
  twitter: {
    card: "summary",
    site: "@Wanshi",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
