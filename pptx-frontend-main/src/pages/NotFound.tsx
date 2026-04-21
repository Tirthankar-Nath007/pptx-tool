import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted via-background to-muted p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-tvs-blue/5" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-tvs-green/5" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-2xl shadow-tvs-blue/10 border border-border/60 overflow-hidden">
          <div className="h-1.5 w-full" style={{ background: "var(--tvs-gradient)" }} />

          <div className="px-8 py-12 flex flex-col items-center gap-6">
            <h1 className="text-6xl font-bold text-tvs-blue">404</h1>
            <div className="text-center space-y-2">
              <p className="text-xl font-semibold text-foreground">Page Not Found</p>
              <p className="text-sm text-muted-foreground">
                The page you're looking for doesn't exist or has been moved.
              </p>
            </div>

            <a 
              href="/" 
              className="inline-flex items-center justify-center gap-2 bg-tvs-blue hover:bg-tvs-blue/90 text-primary-foreground font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-tvs-blue/20 hover:-translate-y-0.5"
            >
              Return to Home
            </a>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()} TVS Credit Service Ltd. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default NotFound;