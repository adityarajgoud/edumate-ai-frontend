import { createContext, useContext, useEffect, useState } from "react";

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (n: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markAllAsRead: () => void;
  hasUnread: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error(
      "useNotifications must be used within NotificationProvider"
    );
  return ctx;
};

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("notifications");
      const parsed = JSON.parse(stored || "[]");

      if (Array.isArray(parsed)) {
        setNotifications(parsed);
        setHasUnread(parsed.some((n) => !n.read));
      } else {
        //  * console.warn(
        ("⚠️ Notifications data in localStorage is invalid. Resetting.");
        // );
        localStorage.setItem("notifications", "[]");
      }
    } catch (err) {
      console.error("Failed to parse notifications from localStorage:", err);
      localStorage.setItem("notifications", "[]");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
    setHasUnread(notifications.some((n) => !n.read));
  }, [notifications]);

  const addNotification = ({
    title,
    message,
  }: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setHasUnread(false);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAllAsRead,
        hasUnread,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
