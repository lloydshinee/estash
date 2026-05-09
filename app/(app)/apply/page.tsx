import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import StasherApplicationForm from "@/components/stasher-application-form";

export default async function ApplyPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/auth/login");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "pending_stasher") {
    redirect("/auth/login");
  }

  // Check if user already has an application
  const { data: existingApplication } = await supabase
    .from("stasher_applications")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (existingApplication) {
    redirect("/pending");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div>
            <h1 className="text-3xl font-bold">Become a Stasher</h1>
            <p className="text-muted-foreground mt-2">
              Join our network of trusted storage hosts and start earning money by providing secure luggage storage.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <StasherApplicationForm user={user} />
      </div>
    </div>
  );
}
