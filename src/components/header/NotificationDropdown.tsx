import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/context/NotificationContext";
import { formatDistanceToNow } from "date-fns";

export const NotificationDropdown = () => {
  const { notifications, markAllAsRead } = useNotifications();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="z-[100] w-80 max-h-96 overflow-auto">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          <button
            onClick={markAllAsRead}
            className="text-xs text-muted-foreground hover:underline"
          >
            Mark all as read
          </button>
        </DropdownMenuLabel>

        {notifications.length === 0 ? (
          <DropdownMenuItem disabled>No notifications</DropdownMenuItem>
        ) : (
          notifications.map((n) => (
            <DropdownMenuItem
              key={n.id}
              className={`flex flex-col items-start ${
                n.read ? "opacity-60" : ""
              }`}
            >
              <span className="font-semibold">{n.title}</span>
              <span className="text-sm text-muted-foreground">{n.message}</span>
              <span className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(n.timestamp), {
                  addSuffix: true,
                })}
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
