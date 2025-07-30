// src/components/Layout.tsx
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Navigation } from "@/components/Navigation";
import { X } from "lucide-react";

export const Layout = () => {
  const location = useLocation();
  const isAuthPage = ["/login", "/signup"].includes(location.pathname);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header onMenuClick={() => setSidebarOpen(true)} />

      {!isAuthPage && (
        <div className="flex w-full max-h-[calc(100vh-64px)] overflow-hidden">
          {/* Mobile Overlay */}
          {sidebarOpen && !isDesktop && (
            <div
              className="fixed inset-0 z-40 bg-black bg-opacity-50"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          {(sidebarOpen || isDesktop) && (
            <div
              className={`
                fixed inset-y-0 right-0 w-64 transform border-l shadow-lg transition-transform duration-300 
                bg-white dark:bg-muted
                md:relative md:right-auto md:left-0 md:border-r md:translate-x-0 md:pointer-events-auto
                ${
                  sidebarOpen
                    ? "translate-x-0 z-50 pointer-events-auto"
                    : isDesktop
                    ? "md:translate-x-0 md:pointer-events-auto"
                    : "translate-x-full pointer-events-none"
                }
              `}
            >
              {/* Close button (mobile only) */}
              {!isDesktop && (
                <div className="flex justify-end p-4">
                  <button onClick={() => setSidebarOpen(false)}>
                    <X className="h-6 w-6" />
                  </button>
                </div>
              )}
              <Navigation onNavigate={() => setSidebarOpen(false)} />
            </div>
          )}

          {/* Main Content */}
          <main className="flex-1 w-full px-4 sm:px-6 md:px-8 py-6 overflow-y-auto">
            <div className="w-full max-w-screen-xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      )}

      {isAuthPage && (
        <main className="flex-1 flex justify-center items-center p-6">
          <Outlet />
        </main>
      )}
    </div>
  );
};
