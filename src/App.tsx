import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index.tsx";
import Properties from "./pages/Properties.tsx";
import PropertyDetails from "./pages/PropertyDetails.tsx";
import About from "./pages/About.tsx";
import Projects from "./pages/Projects.tsx";
import Services from "./pages/Services.tsx";
import Blog from "./pages/Blog.tsx";
import BlogDetail from "./pages/BlogDetail.tsx";
import FAQ from "./pages/FAQ.tsx";
import Contact from "./pages/Contact.tsx";
import Lifestyle from "./pages/Lifestyle.tsx";
import Sold from "./pages/Sold.tsx";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./pages/Auth.tsx";
import Dashboard from "./pages/admin/Dashboard.tsx";
import AdminProperties from "./pages/admin/AdminProperties.tsx";
import AdminCustomers from "./pages/admin/AdminCustomers.tsx";
import CustomerDetail from "./pages/admin/CustomerDetail.tsx";
import AdminReminders from "./pages/admin/AdminReminders.tsx";
import AdminContactRequests from "./pages/admin/AdminContactRequests.tsx";
import AdminTeam from "./pages/admin/AdminTeam.tsx";
import RequireAuth from "./components/admin/RequireAuth.tsx";
import ScrollToTop from "./components/ScrollToTop.tsx";
import { AuthProvider } from "@/hooks/useAuth";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/ilanlar" element={<Properties />} />
        <Route path="/property-details" element={<PropertyDetails />} />
        <Route path="/property-details/:id" element={<PropertyDetails />} />
        <Route path="/ilan/:id" element={<PropertyDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/services" element={<Services />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/lifestyle" element={<Lifestyle />} />
        <Route path="/sold" element={<Sold />} />
        <Route path="/giris" element={<Auth />} />
        <Route path="/admin" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/admin/formlar" element={<RequireAuth><AdminContactRequests /></RequireAuth>} />
        <Route path="/admin/talepler" element={<RequireAuth><AdminContactRequests /></RequireAuth>} />
        <Route path="/admin/ilanlar" element={<RequireAuth><AdminProperties /></RequireAuth>} />
        <Route path="/admin/musteriler" element={<RequireAuth><AdminCustomers /></RequireAuth>} />
        <Route path="/admin/musteriler/:id" element={<RequireAuth><CustomerDetail /></RequireAuth>} />
        <Route path="/admin/hatirlatmalar" element={<RequireAuth><AdminReminders /></RequireAuth>} />
        <Route path="/admin/personel" element={<RequireAuth><AdminTeam /></RequireAuth>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <AuthProvider>
              <AnimatedRoutes />
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
