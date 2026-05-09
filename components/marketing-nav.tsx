"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Luggage, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function MarketingNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <nav className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <Luggage className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold">Stash</span>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/browse"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Browse Storage
            </Link>
            <Link
              href="/how-it-works"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              How it Works
            </Link>
            <Button asChild size="sm" variant="outline">
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/auth/sign-up">Sign up</Link>
            </Button>
            <ThemeSwitcher />
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="md:hidden p-2 -mr-2 text-muted-foreground hover:text-foreground"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-50 bg-background">
          <div className="flex flex-col px-4 py-4 space-y-3">
            <div className="flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-muted-foreground hover:text-foreground"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <Link
              href="/browse"
              className="block py-3 text-lg font-medium hover:text-foreground transition-colors"
            >
              Browse Storage
            </Link>
            <Link
              href="/how-it-works"
              className="block py-3 text-lg font-medium hover:text-foreground transition-colors"
            >
              How it Works
            </Link>
            <div className="pt-4 border-t flex flex-col gap-3">
              <Button asChild variant="outline" className="w-full justify-center">
                <Link href="/auth/login">Sign in</Link>
              </Button>
              <Button asChild className="w-full justify-center">
                <Link href="/auth/sign-up">Sign up</Link>
              </Button>
              <div className="flex justify-center pt-2">
                <ThemeSwitcher />
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
