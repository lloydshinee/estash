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
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Luggage,
  QrCode,
  User,
  Phone,
  MessageSquare,
  Plus,
  Settings,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default async function StasherDashboard() {
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

  if (!profile || profile.role !== "stasher") {
    redirect("/auth/login");
  }

  // Get stasher's listings
  const { data: listings } = await supabase
    .from("stash_listings")
    .select("*")
    .eq("stasher_id", user.id)
    .order("created_at", { ascending: false });

  // Get all bookings for this stasher with detailed information
  const { data: bookings } = await supabase
    .from("bookings")
    .select(
      `
      *,
      stash_listings!inner (
        name,
        address,
        hourly_price,
        capacity_bags,
        stasher_id
      ),
      profiles!bookings_traveler_id_fkey (
        full_name,
        phone
      )
    `,
    )
    .eq("stash_listings.stasher_id", user.id)
    .order("created_at", { ascending: false });

  // Separate bookings by status for analytics
  const pendingBookings = bookings?.filter((b) => b.status === "pending") || [];
  const confirmedBookings =
    bookings?.filter((b) => b.status === "confirmed") || [];
  const activeBookings = bookings?.filter((b) => b.status === "active") || [];
  const completedBookings =
    bookings?.filter((b) => b.status === "completed") || [];

  // Calculate earnings
  const totalEarnings = completedBookings.reduce(
    (sum, b) => sum + (b.total_price || 0),
    0,
  );
  const thisMonthEarnings = completedBookings
    .filter(
      (b) =>
        b.created_at &&
        new Date(b.created_at).getMonth() === new Date().getMonth(),
    )
    .reduce((sum, b) => sum + (b.total_price || 0), 0);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome, {profile.full_name}!</h1>
        <p className="text-muted-foreground">
          Manage your storage locations and bookings
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Add New Location</CardTitle>
            <CardDescription>Create a new storage listing</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/stasher/listings/new">Add Location</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Listings Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Your Locations</CardTitle>
            <CardDescription>
              {listings?.length || 0} active listings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/stasher/listings">Manage Listings</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>
              Latest reservations at your locations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bookings && bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.slice(0, 3).map((booking) => (
                  <div
                    key={booking.id}
                    className="p-3 border rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">
                          {booking.profiles?.full_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {booking.stash_listings?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Status:{" "}
                          <span className="capitalize">{booking.status}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${booking.total_price}</p>
                        <p className="text-sm text-muted-foreground">
                          {booking.total_hours}h
                        </p>
                      </div>
                    </div>
                    {["confirmed", "active"].includes(booking.status || "") && (
                      <Link
                        href={`/stasher/bookings/${booking.id}/inspection`}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-2 pt-2 border-t"
                      >
                        <ClipboardList className="h-3 w-3" />
                        Inspection Notes
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No bookings yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Listings Grid */}
      {listings && listings.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Your Storage Locations</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <Card key={listing.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{listing.name}</CardTitle>
                  <CardDescription>{listing.address}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        ${listing.hourly_price}/hour
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Capacity: {listing.capacity_bags} bags
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          listing.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {listing.status}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
