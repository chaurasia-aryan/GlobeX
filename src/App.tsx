import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DemoPersonaSwitcher from "@/components/layout/DemoPersonaSwitcher";
import PageTransition from "@/components/layout/PageTransition";

import LandingPage from "@/pages/LandingPage";
import TradeIntentWizardPage from "@/pages/TradeIntentWizardPage";
import MarketplacePage from "@/pages/MarketplacePage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import MarketIntelligencePage from "@/pages/MarketIntelligencePage";
import TradeAnalysisPage from "@/pages/TradeAnalysisPage";
import TradeWorkspacePage from "@/pages/TradeWorkspacePage";
import DashboardPage from "@/pages/DashboardPage";
import CounterpartyDetailPage from "@/pages/CounterpartyDetailPage";
import DocumentVerificationPage from "@/pages/DocumentVerificationPage";
import EscrowPage from "@/pages/EscrowPage";
import ShipmentsPage from "@/pages/ShipmentsPage";
import DisputesPage from "@/pages/DisputesPage";
import BlockchainLedgerPage from "@/pages/BlockchainLedgerPage";
import AuthPage from "@/pages/AuthPage";
import AdminSystemPage from "@/pages/AdminSystemPage";
import NotFound from "@/pages/NotFound";

import ShaderBackground from "@/components/layout/ShaderBackground";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Primary User Intent & Flow */}
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/get-started" element={<PageTransition><TradeIntentWizardPage /></PageTransition>} />
        <Route path="/trade-intent" element={<PageTransition><TradeIntentWizardPage /></PageTransition>} />
        <Route path="/onboarding" element={<PageTransition><TradeIntentWizardPage /></PageTransition>} />
        <Route path="/role-select" element={<PageTransition><TradeIntentWizardPage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><AuthPage /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><TradeIntentWizardPage /></PageTransition>} />

        {/* Core Commercial Pages */}
        <Route path="/dashboard" element={<PageTransition><DashboardPage /></PageTransition>} />
        <Route path="/marketplace" element={<PageTransition><MarketplacePage /></PageTransition>} />
        <Route path="/marketplace/:id" element={<PageTransition><ProductDetailPage /></PageTransition>} />
        <Route path="/market-intelligence" element={<PageTransition><MarketIntelligencePage /></PageTransition>} />
        <Route path="/trade-analysis" element={<PageTransition><TradeAnalysisPage /></PageTransition>} />
        <Route path="/trades/:id" element={<PageTransition><TradeWorkspacePage /></PageTransition>} />
        <Route path="/counterparties/:id" element={<PageTransition><CounterpartyDetailPage /></PageTransition>} />
        <Route path="/documents" element={<PageTransition><DocumentVerificationPage /></PageTransition>} />
        <Route path="/escrow" element={<PageTransition><EscrowPage /></PageTransition>} />
        <Route path="/shipments" element={<PageTransition><ShipmentsPage /></PageTransition>} />
        <Route path="/disputes" element={<PageTransition><DisputesPage /></PageTransition>} />
        <Route path="/arbitrator" element={<PageTransition><DisputesPage /></PageTransition>} />
        <Route path="/blockchain" element={<PageTransition><BlockchainLedgerPage /></PageTransition>} />
        <Route path="/admin" element={<PageTransition><AdminSystemPage /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const SmoothScrollProvider = ({ children }: { children: React.ReactNode }) => {
  useSmoothScroll();
  return <>{children}</>;
};

import ErrorBoundary from "@/components/layout/ErrorBoundary";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SmoothScrollProvider>
          <div className="flex flex-col min-h-screen text-on-background selection:bg-primary-fixed-dim selection:text-on-primary">
            <ShaderBackground />
            <Navbar />
            <main className="flex-1 relative z-0">
              <ErrorBoundary>
                <AnimatedRoutes />
              </ErrorBoundary>
            </main>
          </div>
        </SmoothScrollProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
