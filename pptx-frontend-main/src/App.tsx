import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";

const queryClient = new QueryClient();

const checkAuth = async () => {
  try {
    const res = await fetch("/api/auth/me", { credentials: "include" });
    if (res.ok) {
      const data = await res.json();
      return data.authenticated ? data.user_id : null;
    }
  } catch (err) {
    console.error("Auth check failed:", err);
  }
  return null;
};

const App = () => {
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const handleCheckAuth = async () => {
    const userId = await checkAuth();
    setUser(userId);
    setLoading(false);
  };

  if (loading) {
    handleCheckAuth();
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted via-background to-muted">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const handleLogout = () => {
    setUser(null);
    window.location.href = "/api/slo";
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={user ? <Navigate to="/app" replace /> : <LoginPage projectTitle="PPTX Automation" />}
            />
            <Route
              path="/app"
              element={user ? <Index user={user} onLogout={handleLogout} /> : <Navigate to="/" replace />}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
