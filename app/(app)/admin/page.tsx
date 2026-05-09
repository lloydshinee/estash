import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/auth/login");
  }

  // Get pending applications
  const { data: pendingApplications } = await supabase
    .from("stasher_applications")
    .select(
      `
      *,
      profiles!stasher_applications_user_id_fkey (
        full_name
      )
    `,
    )
    .eq("status", "pending")
    .order("submitted_at", { ascending: true });

  // Get pending listings
  const { data: pendingListings } = await supabase
    .from("stash_listings")
    .select(
      `
      *,
      profiles!stash_listings_stasher_id_fkey (
        full_name
      )
    `,
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  // Get platform stats
  const { data: userStats } = await supabase.from("profiles").select("role");

  const { data: bookingStats } = await supabase
    .from("bookings")
    .select("status, total_price");

  const userCounts =
    userStats?.reduce(
      (acc, user) => {
        acc[user.role || "unknown"] = (acc[user.role || "unknown"] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ) || {};

  const totalRevenue =
    bookingStats?.reduce(
      (sum, booking) =>
        booking.status === "completed"
          ? sum + Number(booking.total_price)
          : sum,
      0,
    ) || 0;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage the Stash platform</p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(userCounts).reduce((a, b) => a + b, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {userCounts.traveler || 0} travelers, {userCounts.stasher || 0}{" "}
              stashers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingApplications?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Stasher applications awaiting review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Listings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingListings?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Storage locations awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From completed bookings
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Pending Applications */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Stasher Applications</CardTitle>
            <CardDescription>
              Review and approve new stasher applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingApplications && pendingApplications.length > 0 ? (
              <div className="space-y-4">
                {pendingApplications.slice(0, 5).map((application) => (
                  <div
                    key={application.id}
                    className="flex flex-col sm:flex-row items-start justify-between p-4 border rounded-lg gap-2"
                  >
                    <div>
                      <p className="font-medium">
                        {application.profiles?.full_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {application.business_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {application.address}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" asChild>
                        <Link href={`/admin/applications/${application.id}`}>
                          Review
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
                {pendingApplications.length > 5 && (
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/admin/applications">
                      View All Applications
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No pending applications.</p>
            )}
          </CardContent>
        </Card>

        {/* Pending Listings */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Storage Listings</CardTitle>
            <CardDescription>
              Review and approve new storage locations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingListings && pendingListings.length > 0 ? (
              <div className="space-y-4">
                {pendingListings.slice(0, 5).map((listing) => (
                  <div
                    key={listing.id}
                    className="flex flex-col sm:flex-row items-start justify-between p-4 border rounded-lg gap-2"
                  >
                    <div>
                      <p className="font-medium">{listing.name}</p>
                      <p className="text-sm text-muted-foreground">
                        by {listing.profiles?.full_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {listing.address}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" asChild>
                        <Link href={`/admin/listings/${listing.id}`}>
                          Review
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
                {pendingListings.length > 5 && (
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/admin/listings">View All Listings</Link>
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No pending listings.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
