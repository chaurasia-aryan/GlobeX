import React, { Suspense, lazy, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { WorkspaceProvider } from "@/context/WorkspaceContext";
import { ThemeProvider } from "@/context/ThemeContext";
import ErrorBoundary from "@/components/layout/ErrorBoundary";
import PageTransition from "@/components/layout/PageTransition";

// Eager load LandingPage for instant first paint
import LandingPage from "@/pages/LandingPage";

// Route-based code splitting for ultra-fast load times across Cloudflare & Vercel
const OnboardingPage = lazy(() => import("@/pages/OnboardingPage"));
const TradeIntentWizardPage = lazy(() => import("@/pages/TradeIntentWizardPage"));
const MarketplacePage = lazy(() => import("@/pages/MarketplacePage"));
const MyListingsPage = lazy(() => import("@/pages/MyListingsPage"));
const ProductDetailPage = lazy(() => import("@/pages/ProductDetailPage"));
const MarketIntelligencePage = lazy(() => import("@/pages/MarketIntelligencePage"));
const TradeAnalysisPage = lazy(() => import("@/pages/TradeAnalysisPage"));
const TradeWorkspacePage = lazy(() => import("@/pages/TradeWorkspacePage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const CounterpartyDetailPage = lazy(() => import("@/pages/CounterpartyDetailPage"));
const DocumentVerificationPage = lazy(() => import("@/pages/DocumentVerificationPage"));
const EscrowPage = lazy(() => import("@/pages/EscrowPage"));
const ShipmentsPage = lazy(() => import("@/pages/ShipmentsPage"));
const DisputesPage = lazy(() => import("@/pages/DisputesPage"));
const BlockchainLedgerPage = lazy(() => import("@/pages/BlockchainLedgerPage"));
const AuthPage = lazy(() => import("@/pages/AuthPage"));
const AdminSystemPage = lazy(() => import("@/pages/AdminSystemPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient();

// Smooth instant scroll reset on route changes
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Ultra-light, non-jarring fallback loader
const RouteFallback: React.FC = () => (
  <div className="min-h-[calc(100vh-3.5rem)] w-full flex items-center justify-center bg-[#070A0E] text-slate-400">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center animate-pulse text-emerald-400">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
      </div>
      <span className="text-xs font-mono tracking-wider text-slate-500 uppercase">
        Loading workspace...
      </span>
    </div>
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <Suspense fallback={<RouteFallback />}>
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          {/* Primary User Intent & Flow */}
          <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
          <Route path="/onboarding" element={<PageTransition><OnboardingPage /></PageTransition>} />
          <Route path="/role-select" element={<PageTransition><OnboardingPage /></PageTransition>} />
          <Route path="/login" element={<PageTransition><AuthPage /></PageTransition>} />
          <Route path="/signup" element={<PageTransition><OnboardingPage /></PageTransition>} />
          <Route path="/get-started" element={<PageTransition><TradeIntentWizardPage /></PageTransition>} />
          <Route path="/trade-intent" element={<PageTransition><TradeIntentWizardPage /></PageTransition>} />
          <Route path="/trade-requests" element={<PageTransition><TradeIntentWizardPage /></PageTransition>} />

          {/* Core Commercial Pages */}
          <Route path="/dashboard" element={<PageTransition><DashboardPage /></PageTransition>} />
          <Route path="/marketplace" element={<PageTransition><MarketplacePage /></PageTransition>} />
          <Route path="/marketplace/:id" element={<PageTransition><ProductDetailPage /></PageTransition>} />
          <Route path="/my-listings" element={<PageTransition><MyListingsPage /></PageTransition>} />
          <Route path="/export-catalog" element={<PageTransition><MyListingsPage /></PageTransition>} />
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
    </Suspense>
  );
};

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ThemeProvider>
        <WorkspaceProvider>
          <BrowserRouter>
            <ScrollToTop />
            <div className="flex flex-col min-h-screen bg-[var(--surface-0)] text-[var(--text-primary)] selection:bg-emerald-500/20 selection:text-emerald-300 transition-colors duration-200">
              <main className="flex-1">
                <ErrorBoundary>
                  <AnimatedRoutes />
                </ErrorBoundary>
              </main>
            </div>
          </BrowserRouter>
        </WorkspaceProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
