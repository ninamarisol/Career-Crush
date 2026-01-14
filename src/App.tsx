import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AppProvider, useApp } from "@/context/AppContext";
import { ThemeProvider, useTheme } from "@/hooks/useTheme";
import { AppSidebar } from "@/components/layout/AppSidebar";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import Applications from "./pages/Applications";
import ApplicationDetail from "./pages/ApplicationDetail";
import Profile from "./pages/Profile";
import Goals from "./pages/Goals";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Component to sync profile theme to ThemeProvider
function ThemeSync() {
  const { profile } = useApp();
  const { syncFromProfile } = useTheme();

  useEffect(() => {
    if (profile?.theme_color) {
      syncFromProfile(profile.theme_color);
    }
  }, [profile?.theme_color, syncFromProfile]);

  return null;
}

function AppRoutes() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: appLoading } = useApp();

  // Show loading while checking auth state
  if (authLoading || (user && appLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-bold">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Not logged in - show auth page
  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Logged in but hasn't completed onboarding
  if (!profile?.onboarding_complete) {
    return (
      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <AppSidebar>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/applications/:id" element={<ApplicationDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/contacts" element={<div className="text-center py-12"><h1 className="text-3xl font-black">Contacts 📇</h1><p className="text-muted-foreground mt-2">Coming soon...</p></div>} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/settings" element={<Navigate to="/profile" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppSidebar>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppProvider>
            <ThemeSync />
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
