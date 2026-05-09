import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function PendingStasherPage() {
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

  // Get user's application
  const { data: application } = await supabase
    .from("stasher_applications")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Application Under Review</h1>
        <p className="text-muted-foreground mt-2">
          Thank you for applying to become a Stasher! We're reviewing your application.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Application Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Application Status
              <Badge variant={
                application?.status === 'pending' ? 'secondary' :
                application?.status === 'approved' ? 'default' : 'destructive'
              }>
                {application?.status || 'Not Submitted'}
              </Badge>
            </CardTitle>
            <CardDescription>
              Current status of your stasher application
            </CardDescription>
          </CardHeader>
          <CardContent>
            {application ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Business Name</h3>
                  <p className="text-muted-foreground">{application.business_name}</p>
                </div>
                <div>
                  <h3 className="font-medium">Address</h3>
                  <p className="text-muted-foreground">{application.address}</p>
                </div>
                <div>
                  <h3 className="font-medium">Description</h3>
                  <p className="text-muted-foreground">{application.description}</p>
                </div>
                <div>
                  <h3 className="font-medium">Submitted</h3>
                  <p className="text-muted-foreground">
                    {new Date(application.submitted_at || '').toLocaleDateString()}
                  </p>
                </div>
                {application.admin_notes && (
                  <div>
                    <h3 className="font-medium">Admin Notes</h3>
                    <p className="text-muted-foreground">{application.admin_notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  You haven't submitted a stasher application yet.
                </p>
                <Button asChild>
                  <Link href="/apply">Submit Application</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* What's Next */}
        <Card>
          <CardHeader>
            <CardTitle>What happens next?</CardTitle>
            <CardDescription>
              Here's what to expect during the review process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div>
                  <h4 className="font-medium">Application Review</h4>
                  <p className="text-sm text-muted-foreground">
                    Our team reviews your application and verifies your information.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div>
                  <h4 className="font-medium">Background Check</h4>
                  <p className="text-sm text-muted-foreground">
                    We conduct a background check to ensure safety and security.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div>
                  <h4 className="font-medium">Approval & Setup</h4>
                  <p className="text-sm text-muted-foreground">
                    Once approved, you can start creating storage listings and accepting bookings.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>
              Have questions about your application?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              If you have any questions about the application process or need to update your information,
              please don't hesitate to contact our support team.
            </p>
            <Button variant="outline" asChild>
              <Link href="mailto:support@stash.com">Contact Support</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
