import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SignUpForm } from "@/components/sign-up-form";

function getRedirectPath(role: string | null): string {
  switch (role) {
    case "admin": return "/admin";
    case "stasher": return "/stasher";
    case "pending_stasher": return "/pending";
    default: return "/traveler";
  }
}

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    redirect(getRedirectPath(profile?.role ?? null));
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignUpForm />
      </div>
    </div>
  );
}
