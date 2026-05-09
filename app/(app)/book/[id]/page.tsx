import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Shield, Clock, Luggage, ArrowLeft, User, Calendar, DollarSign } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import BookingForm from "@/components/booking-form";

export default async function BookingPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  // Only travelers can book
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "traveler") {
    redirect("/auth/login");
  }

  // Get listing details
  const { data: listing, error } = await supabase
    .from("stash_listings")
    .select(`
      *,
      profiles!stash_listings_stasher_id_fkey (
        full_name
      ),
      bookings (
        reviews (
          rating,
          comment,
          created_at,
          profiles!reviews_traveler_id_fkey (
            full_name
          )
        )
      )
    `)
    .eq("id", params.id)
    .eq("status", "approved")
    .single();

  if (error || !listing) {
    notFound();
  }

  // Calculate average rating
  const allReviews = listing.bookings?.flatMap((booking: any) => booking.reviews || []) || [];
  const avgRating = allReviews.length > 0 
    ? allReviews.reduce((sum: number, review: any) => sum + review.rating, 0) / allReviews.length 
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link href={`/listings/${listing.id}`}>
              <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                <ArrowLeft className="h-4 w-4" />
                Back to Listing
              </button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Book Storage</h1>
              <p className="text-muted-foreground">Reserve your luggage storage at {listing.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <BookingForm listing={listing} />
          </div>

          {/* Listing Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">{listing.name}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {listing.address}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Host */}
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm">Hosted by {listing.profiles?.full_name}</span>
                </div>

                {/* Pricing */}
                <div className="flex items-center justify-between">
                  <span className="text-sm">Hourly Rate</span>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-medium">${listing.hourly_price}</span>
                  </div>
                </div>

                {/* Capacity */}
                <div className="flex items-center justify-between">
                  <span className="text-sm">Capacity</span>
                  <div className="flex items-center gap-1">
                    <Luggage className="h-4 w-4" />
                    <span className="font-medium">{listing.capacity_bags} bags</span>
                  </div>
                </div>

                {/* Rating */}
                {allReviews.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">
                        {Math.round(avgRating * 10) / 10} ({allReviews.length})
                      </span>
                    </div>
                  </div>
                )}

                {/* Security Features */}
                {listing.security_features && listing.security_features.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Security Features
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {listing.security_features.slice(0, 3).map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {listing.security_features.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{listing.security_features.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Pay in cash when you drop off</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
