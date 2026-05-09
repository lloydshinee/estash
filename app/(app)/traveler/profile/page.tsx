import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile-form";

export default async function TravelerProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <ProfileForm
      user={{ email: user.email, id: user.id }}
      profile={{
        full_name: profile?.full_name ?? null,
        phone: profile?.phone ?? null,
        role: profile?.role ?? null,
      }}
    />
  );
}
