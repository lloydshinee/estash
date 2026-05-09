"use client";

import Sidebar from "./sidebar";
import BottomNav from "./bottom-nav";
import MobileHeader from "./mobile-header";
import { useNotifications } from "@/hooks/use-notifications";
import { type UserRole } from "./nav-config";

interface AppShellClientProps {
  children: React.ReactNode;
  role: UserRole;
  userEmail?: string;
  userName?: string;
  userId?: string;
}

export default function AppShellClient({
  children,
  role,
  userEmail,
  userName,
  userId,
}: AppShellClientProps) {
  const notificationProps = useNotifications(userId);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        role={role}
        userEmail={userEmail}
        userName={userName}
        userId={userId}
        notificationProps={notificationProps}
      />
      <MobileHeader userId={userId} notificationProps={notificationProps} />
      <main className="md:ml-60 pt-14 md:pt-0 pb-16 md:pb-0 min-h-screen">
        {children}
      </main>
      <BottomNav role={role} />
    </div>
  );
}
