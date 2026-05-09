"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Luggage, LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { getNavItems, type UserRole } from "./nav-config";
import { LogoutButton } from "@/components/logout-button";
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

interface SidebarProps {
  role: UserRole;
  userEmail?: string;
  userName?: string;
  userId?: string;
  notificationProps: NotificationProps;
}

export default function Sidebar({ role, userEmail, userName, userId, notificationProps }: SidebarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const navItems = getNavItems(role);

  return (
    <aside className="hidden md:flex md:flex-col md:w-60 md:fixed md:inset-y-0 md:z-30 border-r bg-background">
      <div className="flex items-center gap-2 h-16 px-6 border-b shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <Luggage className="h-7 w-7 text-blue-600" />
          <span className="text-lg font-bold">Stash</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4 space-y-3">
        {userName && (
          <div className="px-3">
            <p className="text-sm font-medium truncate">{userName}</p>
            {userEmail && (
              <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
            )}
          </div>
        )}
        <div className="flex items-center gap-2">
          <NotificationBell {...notificationProps} />
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
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}
