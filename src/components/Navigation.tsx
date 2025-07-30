import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Route,
  CalendarCheck,
  FileText,
  Sun,
  Moon,
  LogOut,
  User,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hooks/use-theme";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface NavigationProps {
  onNavigate?: () => void;
}

const tabs = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { key: "roadmap", label: "Roadmap", icon: Route, path: "/roadmap" },
  { key: "tasks", label: "Daily Tasks", icon: CalendarCheck, path: "/tasks" },
  { key: "resume", label: "Resume Analyzer", icon: FileText, path: "/resume" },
];

const getGradient = (email: string) => {
  const colors = [
    "from-purple-500 to-pink-500",
    "from-blue-500 to-green-500",
    "from-orange-500 to-red-500",
    "from-amber-500 to-yellow-500",
    "from-teal-500 to-cyan-500",
  ];
  const hash = email
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

export const Navigation = ({ onNavigate }: NavigationProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleClick = (path: string) => {
    navigate(path);
    if (window.innerWidth < 768 && onNavigate) {
      onNavigate(); // Close sidebar on mobile
    }
  };

  const userInitial = user?.email?.charAt(0).toUpperCase() || "U";
  const gradient = user?.email
    ? getGradient(user.email)
    : "from-gray-500 to-gray-700";

  return (
    <aside className="w-64 bg-card border-l md:border-r min-h-screen p-4 flex flex-col space-y-6 z-[40] md:z-auto">
      {/* Navigation Tabs */}
      <div className="space-y-2">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;

          return (
            <button
              key={tab.key}
              onClick={() => handleClick(tab.path)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2 rounded-md transition text-left",
                isActive
                  ? "bg-primary text-white shadow"
                  : "hover:bg-muted text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
      {/* Theme + Auth Section - only visible on mobile */}
      <div className="space-y-3 border-t pt-4 md:hidden">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-md hover:bg-muted text-sm text-muted-foreground transition"
        >
          {theme === "dark" ? (
            <>
              <Sun className="w-5 h-5 text-yellow-400" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-5 h-5 text-gray-800" />
              <span>Dark Mode</span>
            </>
          )}
        </button>

        {/* Auth Section */}
        {isLoggedIn && user?.email ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="w-full flex items-center gap-3 px-4 py-2 rounded-md hover:bg-muted cursor-pointer">
                <Avatar className="h-8 w-8 border">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
                      user?.email || "user"
                    )}`}
                  />
                  <AvatarFallback
                    className={`text-sm font-bold text-white bg-gradient-to-br ${gradient}`}
                  >
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left text-sm truncate">
                  {user.email}
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem onClick={() => handleClick("/profile")}>
                <User className="w-4 h-4 mr-2" /> Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600">
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="default"
            size="sm"
            className="w-full"
            onClick={() => handleClick("/login")}
          >
            Login / Sign Up
          </Button>
        )}
      </div>
    </aside>
  );
};
