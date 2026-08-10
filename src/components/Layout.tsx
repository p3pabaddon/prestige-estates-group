import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import PageTransition from "./PageTransition";
import ScrollProgress from "./ScrollProgress";
import FloatingButtons from "./FloatingButtons";
import CookieConsent from "./CookieConsent";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-background">
      <ScrollProgress />
      <Header />
      <PageTransition>
        <main>{children}</main>
      </PageTransition>
      <Footer />
      <FloatingButtons />
      <CookieConsent />
    </div>
  );
};

export default Layout;
