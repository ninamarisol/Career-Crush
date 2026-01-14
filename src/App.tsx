import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "@/context/AppContext";
import { AppSidebar } from "@/components/layout/AppSidebar";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import Applications from "./pages/Applications";
import ApplicationDetail from "./pages/ApplicationDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user } = useApp();
  const themeClass = user?.themeColor ? `theme-${user.themeColor}` : 'theme-bubblegum';

  if (!user?.onboardingComplete) {
    return (
      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <div className={themeClass}>
      <AppSidebar>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/applications/:id" element={<ApplicationDetail />} />
          <Route path="/contacts" element={<div className="text-center py-12"><h1 className="text-3xl font-black">Contacts 📇</h1><p className="text-muted-foreground mt-2">Coming soon...</p></div>} />
          <Route path="/goals" element={<div className="text-center py-12"><h1 className="text-3xl font-black">Goals 🎯</h1><p className="text-muted-foreground mt-2">Coming soon...</p></div>} />
          <Route path="/settings" element={<div className="text-center py-12"><h1 className="text-3xl font-black">Settings ⚙️</h1><p className="text-muted-foreground mt-2">Coming soon...</p></div>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppSidebar>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
