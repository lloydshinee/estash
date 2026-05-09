import { createClient } from "@/lib/supabase/server";
import AppShellClient from "@/components/shell/app-shell-client";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: "traveler" | "stasher" | "pending_stasher" | "admin" | null = null;
  let userName: string | undefined;
  let userEmail: string | undefined;
  let userId: string | undefined;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", user.id)
      .single();

    role = profile?.role as "traveler" | "stasher" | "pending_stasher" | "admin" | null;
    userName = profile?.full_name || undefined;
    userEmail = user.email;
    userId = user.id;
  }

  return (
    <AppShellClient role={role} userEmail={userEmail} userName={userName} userId={userId}>
      {children}
    </AppShellClient>
  );
}
