import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsappFab } from "@/components/whatsapp-fab";

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      <SiteFooter />
      <WhatsappFab />
    </div>
  );
}
