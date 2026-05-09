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
  Star,
  Search,
  Plus,
  ClipboardList,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default async function TravelerDashboard() {
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

  if (!profile || profile.role !== "traveler") {
    redirect("/auth/login");
  }

  // Get all bookings with detailed information
  const { data: bookings } = await supabase
    .from("bookings")
    .select(
      `
      *,
      stash_listings (
        name,
        address,
        hourly_price,
        capacity_bags,
        profiles!stash_listings_stasher_id_fkey (
          full_name,
          phone
        )
      )
    `,
    )
    .eq("traveler_id", user.id)
    .order("created_at", { ascending: false });

  // Separate bookings by status
  const activeBookings =
    bookings?.filter((b) =>
      ["pending", "confirmed", "active"].includes(b.status || ""),
    ) || [];
  const completedBookings =
    bookings?.filter((b) => ["completed"].includes(b.status || "")) || [];
  const cancelledBookings =
    bookings?.filter((b) => ["cancelled"].includes(b.status || "")) || [];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Welcome back, {profile.full_name}!
        </h1>
        <p className="text-muted-foreground">
          Find secure storage for your luggage
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-5 w-5" />
              Find Storage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/browse">
                <Plus className="mr-2 h-4 w-4" />
                Browse Locations
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Active Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBookings.length}</div>
            <p className="text-xs text-muted-foreground">
              Current reservations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedBookings.length}</div>
            <p className="text-xs text-muted-foreground">Past bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {completedBookings
                .reduce((sum, b) => sum + (b.total_price || 0), 0)
                .toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Bookings */}
      {activeBookings.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Active Bookings
            </CardTitle>
            <CardDescription>
              Your current and upcoming reservations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeBookings.map((booking) => (
                <div key={booking.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {booking.stash_listings?.name}
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {booking.stash_listings?.address}
                      </p>
                    </div>
                    <Badge
                      variant={
                        booking.status === "confirmed" ? "default" : "secondary"
                      }
                      className={
                        booking.status === "active"
                          ? "bg-green-100 text-green-800"
                          : ""
                      }
                    >
                      {booking.status
                        ? booking.status.charAt(0).toUpperCase() +
                          booking.status.slice(1)
                        : "Unknown"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="flex items-center gap-1 text-muted-foreground mb-1">
                        <Calendar className="h-4 w-4" />
                        Drop-off
                      </div>
                      <div className="font-medium">
                        {booking.start_time
                          ? format(new Date(booking.start_time), "MMM d, yyyy")
                          : "N/A"}
                      </div>
                      <div className="text-muted-foreground">
                        {booking.start_time
                          ? format(new Date(booking.start_time), "h:mm a")
                          : "N/A"}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 text-muted-foreground mb-1">
                        <Clock className="h-4 w-4" />
                        Pick-up
                      </div>
                      <div className="font-medium">
                        {booking.end_time
                          ? format(new Date(booking.end_time), "MMM d, yyyy")
                          : "N/A"}
                      </div>
                      <div className="text-muted-foreground">
                        {booking.end_time
                          ? format(new Date(booking.end_time), "h:mm a")
                          : "N/A"}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 text-muted-foreground mb-1">
                        <DollarSign className="h-4 w-4" />
                        Total
                      </div>
                      <div className="font-medium">${booking.total_price}</div>
                      <div className="text-muted-foreground">
                        {booking.total_hours}h
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 text-muted-foreground mb-1">
                        <Luggage className="h-4 w-4" />
                        Capacity
                      </div>
                      <div className="font-medium">
                        {booking.stash_listings?.capacity_bags} bags
                      </div>
                      <div className="text-muted-foreground">max</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <QrCode className="h-4 w-4" />
                      <span>QR: {booking.qr_code}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button asChild size="sm">
                        <Link href={`/booking-confirmation/${booking.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 pt-2 border-t text-sm">
                    <Link
                      href={`/traveler/bookings/${booking.id}/inspection`}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                    >
                      <ClipboardList className="h-3 w-3" />
                      Inspection
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Completed Bookings */}
      {completedBookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Recent Completed Bookings
            </CardTitle>
            <CardDescription>Your past storage experiences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedBookings.slice(0, 3).map((booking) => (
                <div
                  key={booking.id}
                  className="p-3 border rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {booking.stash_listings?.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {booking.start_time
                          ? format(new Date(booking.start_time), "MMM d, yyyy")
                          : "N/A"}{" "}
                        • {booking.total_hours}h
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${booking.total_price}</p>
                      <Badge variant="outline" className="text-xs">
                        Completed
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 pt-2 border-t text-sm">
                    <Link
                      href={`/traveler/reviews/new/${booking.id}`}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                    >
                      <MessageSquare className="h-3 w-3" />
                      Leave Review
                    </Link>
                    <Link
                      href={`/traveler/bookings/${booking.id}/inspection`}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                    >
                      <ClipboardList className="h-3 w-3" />
                      Inspection
                    </Link>
                  </div>
                </div>
              ))}
              {completedBookings.length > 3 && (
                <div className="text-center pt-2">
                  <Button variant="outline" size="sm">
                    View All ({completedBookings.length})
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Bookings State */}
      {bookings?.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Luggage className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
            <p className="text-muted-foreground mb-6">
              Start by finding secure storage for your luggage
            </p>
            <Button asChild>
              <Link href="/browse">
                <Search className="mr-2 h-4 w-4" />
                Find Storage Locations
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
