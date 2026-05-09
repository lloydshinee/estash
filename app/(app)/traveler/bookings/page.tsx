import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function TravelerBookingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, stash_listings(name)")
    .eq("traveler_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Bookings</h1>
        <p className="text-muted-foreground">View all your reservations</p>
      </div>
      {bookings && bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {booking.stash_listings?.name || "Storage"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Status: {booking.status} | Total: ${booking.total_price}
                </p>
                <Button asChild variant="link" className="px-0 h-auto mt-2">
                  <Link href={`/booking-confirmation/${booking.id}`}>
                    View Details
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No bookings yet
          </CardContent>
        </Card>
      )}
    </div>
  );
}
