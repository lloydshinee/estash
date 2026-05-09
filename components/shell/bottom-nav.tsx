"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getNavItems, type UserRole } from "./nav-config";

interface BottomNavProps {
  role: UserRole;
}

export default function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname();
  const navItems = getNavItems(role);

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t bg-background/80 backdrop-blur-lg pb-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-0 px-2 h-full transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className="text-[10px] font-medium leading-tight truncate max-w-full">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
