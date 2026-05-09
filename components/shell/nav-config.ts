import {
  Home,
  Search,
  Calendar,
  User,
  Store,
  ClipboardList,
  LogIn,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export type UserRole = "traveler" | "stasher" | "pending_stasher" | "admin" | null;

export function getNavItems(role: UserRole): NavItem[] {
  switch (role) {
    case "traveler":
      return [
        { label: "Home", href: "/traveler", icon: Home },
        { label: "Browse", href: "/browse", icon: Search },
        { label: "Bookings", href: "/traveler/bookings", icon: Calendar },
        { label: "Profile", href: "/traveler/profile", icon: User },
      ];
    case "stasher":
      return [
        { label: "Home", href: "/stasher", icon: Home },
        { label: "Listings", href: "/stasher/listings", icon: Store },
        { label: "Bookings", href: "/stasher/bookings", icon: Calendar },
        { label: "Profile", href: "/stasher/profile", icon: User },
      ];
    case "pending_stasher":
      return [
        { label: "Home", href: "/pending", icon: Home },
        { label: "Browse", href: "/browse", icon: Search },
        { label: "Profile", href: "/traveler/profile", icon: User },
      ];
    case "admin":
      return [
        { label: "Home", href: "/admin", icon: Home },
        { label: "Applications", href: "/admin/applications", icon: ClipboardList },
        { label: "Listings", href: "/admin/listings", icon: Store },
        { label: "Profile", href: "/admin/profile", icon: User },
      ];
    default:
      return [
        { label: "Browse", href: "/browse", icon: Search },
        { label: "Sign In", href: "/auth/login", icon: LogIn },
      ];
  }
}
