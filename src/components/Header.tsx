import { Brain, Menu, Sun, Moon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useNotifications } from "@/context/NotificationContext";
import { useAuth } from "@/context/AuthContext";
import { NotificationDropdown } from "@/components/header/NotificationDropdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onLogoClick?: () => void;
  onMenuClick?: () => void;
}

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

export const Header = ({ onLogoClick, onMenuClick }: HeaderProps) => {
  const { hasUnread } = useNotifications();
  const { isLoggedIn, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const userInitial = user?.email?.charAt(0).toUpperCase() || "U";
  const gradient = user?.email
    ? getGradient(user.email)
    : "from-gray-500 to-gray-700";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" onClick={onLogoClick} className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            EduMate AI
          </h1>
        </Link>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Notification */}
          <div className="relative">
            <NotificationDropdown />
            {hasUnread && (
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 animate-ping" />
            )}
          </div>

          {/* Theme Toggle (desktop only) */}
          <button
            onClick={toggleTheme}
            className="hidden md:inline-flex rounded-md p-2 transition hover:bg-muted"
            title="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-gray-800" />
            )}
          </button>

          {/* Auth Button (desktop only) */}
          {isLoggedIn && user?.email ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="hidden md:flex h-8 w-8 cursor-pointer border">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
                      user.email
                    )}`}
                  />
                  <AvatarFallback
                    className={`text-sm font-bold text-white bg-gradient-to-br ${gradient}`}
                  >
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-3 py-2 text-sm text-muted-foreground truncate max-w-[11rem]">
                  {user.email}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={logout}
                  className="text-red-600 cursor-pointer"
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="default"
              size="sm"
              className="hidden md:inline-flex"
              onClick={() => navigate("/login")}
            >
              Login / Sign Up
            </Button>
          )}

          {/* Hamburger (mobile only) */}
          <button
            className="md:hidden text-muted-foreground"
            onClick={onMenuClick}
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
