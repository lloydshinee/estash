"use client";

import Link from "next/link";
import { Luggage, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import NotificationBell from "@/components/notification-bell";
import type { Notification } from "@/lib/notifications";

interface NotificationProps {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  hasMore: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  loadMore: () => void;
}

interface MobileHeaderProps {
  userId?: string;
  notificationProps: NotificationProps;
}

export default function MobileHeader({ userId, notificationProps }: MobileHeaderProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="md:hidden fixed top-0 inset-x-0 z-30 border-b bg-background/80 backdrop-blur-lg">
      <div className="flex items-center justify-between h-14 px-4">
        <Link href="/" className="flex items-center gap-2">
          <Luggage className="h-6 w-6 text-blue-600" />
          <span className="text-base font-bold">Stash</span>
        </Link>
        <div className="flex items-center gap-1">
          {userId && <NotificationBell {...notificationProps} />}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
      </div>
    </header>
  );
}
