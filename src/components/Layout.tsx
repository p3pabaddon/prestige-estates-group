import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import PageTransition from "./PageTransition";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PageTransition>
        <main>{children}</main>
      </PageTransition>
      <Footer />
    </div>
  );
};

export default Layout;
