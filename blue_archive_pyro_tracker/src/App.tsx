import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { ROUTE_PATHS } from "@/lib/index";
import { Layout } from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Logs from "@/pages/Logs";
import Events from "@/pages/Events";
import Budget from "@/pages/Budget";
import Settings from "@/pages/Settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <MotionConfig reducedMotion="user">
        <Toaster />
        <Sonner />
        <HashRouter>
          <Layout>
            <Routes>
              <Route path={ROUTE_PATHS.DASHBOARD} element={<Dashboard />} />
              <Route path={ROUTE_PATHS.LOGS} element={<Logs />} />
              <Route path={ROUTE_PATHS.EVENTS} element={<Events />} />
              <Route path={ROUTE_PATHS.BUDGET} element={<Budget />} />
              <Route path={ROUTE_PATHS.SETTINGS} element={<Settings />} />
            </Routes>
          </Layout>
        </HashRouter>
      </MotionConfig>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
