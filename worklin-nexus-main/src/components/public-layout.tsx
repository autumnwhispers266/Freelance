import { type ReactNode } from "react";
import { TopNav } from "./top-nav";
import { Footer } from "./footer";

export function PublicLayout({ children, hideFooter = false }: { children: ReactNode; hideFooter?: boolean }) {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main>{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
}
