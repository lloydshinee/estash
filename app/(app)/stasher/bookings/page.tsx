import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import Link from "next/link";

export default async function StasherBookingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, stash_listings!inner(name, stasher_id), profiles!bookings_traveler_id_fkey(full_name)")
    .eq("stash_listings.stasher_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Booking Requests</h1>
        <p className="text-muted-foreground">Reservations at your locations</p>
      </div>
      {bookings && bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {booking.profiles?.full_name || "Guest"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {booking.stash_listings?.name} — ${booking.total_price} | {booking.status}
                </p>
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
