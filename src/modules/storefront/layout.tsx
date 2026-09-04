import { CompareFloatingBar } from "./components/compare-floating-bar";
import { CompareProvider } from "./lib/compare-context";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CompareProvider>
      <SiteHeader />
      <main className="min-w-0 flex-1 overflow-x-hidden">{children}</main>
      <SiteFooter />
      <CompareFloatingBar />
    </CompareProvider>
  );
}
