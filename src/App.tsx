import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SpoilerProvider } from "./contexts/SpoilerContext";
import Analytics from "./components/Analytics";

// Lazy load pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const Statistics = lazy(() => import("./pages/Statistics"));
const Teams = lazy(() => import("./pages/Teams"));
const TeamDetail = lazy(() => import("./pages/TeamDetail"));
const PlayerProfile = lazy(() => import("./pages/PlayerProfile"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SpoilerProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Analytics />
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/statistics" element={<Statistics />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/teams/:teamAbbr" element={<TeamDetail />} />
              <Route path="/player/:playerId" element={<PlayerProfile />} />
              {/* Swedish pages: slugs come from src/i18n/routes.json */}
              <Route path="/sv" element={<Index />} />
              <Route path="/sv/statistik" element={<Statistics />} />
              <Route path="/sv/lag" element={<Teams />} />
              <Route path="/sv/lag/:teamAbbr" element={<TeamDetail />} />
              <Route path="/sv/spelare/:playerId" element={<PlayerProfile />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </SpoilerProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
