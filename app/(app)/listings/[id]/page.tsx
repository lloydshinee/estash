import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Shield, Clock, Luggage, ArrowLeft, User } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ListingDetails({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  // Check if current user is a traveler (to show Book button)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isTraveler = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isTraveler = profile?.role === "traveler";
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
            <Link href="/browse">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Browse
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{listing.name}</h1>
              <p className="text-muted-foreground flex items-center gap-1">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="truncate">{listing.address}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Location</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {listing.description || "No description available."}
                </p>
              </CardContent>
            </Card>

            {/* Features & Amenities */}
            <Card>
              <CardHeader>
                <CardTitle>Features & Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Security Features */}
                  {listing.security_features && listing.security_features.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Security Features
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {listing.security_features.map((feature, index) => (
                          <Badge key={index} variant="secondary">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Amenities */}
                  {listing.amenities && listing.amenities.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Amenities</h4>
                      <div className="flex flex-wrap gap-2">
                        {listing.amenities.map((amenity, index) => (
                          <Badge key={index} variant="outline">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Reviews
                  {allReviews.length > 0 && (
                    <Badge variant="secondary">
                      {Math.round(avgRating * 10) / 10} ★ ({allReviews.length})
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {allReviews.length > 0 ? (
                  <div className="space-y-4">
                    {allReviews.slice(0, 5).map((review: any, index: number) => (
                      <div key={index} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span className="font-medium">
                              {review.profiles?.full_name || "Anonymous"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-muted-foreground text-sm">{review.comment}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                    {allReviews.length > 5 && (
                      <p className="text-sm text-muted-foreground text-center">
                        And {allReviews.length - 5} more reviews...
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No reviews yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>${listing.hourly_price}</span>
                  <span className="text-sm font-normal text-muted-foreground">per hour</span>
                </CardTitle>
                <CardDescription>
                  Hosted by {listing.profiles?.full_name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Capacity */}
                <div className="flex items-center justify-between">
                  <span className="text-sm">Capacity</span>
                  <div className="flex items-center gap-1">
                    <Luggage className="h-4 w-4" />
                    <span className="font-medium">{listing.capacity_bags} bags</span>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-center justify-between">
                  <span className="text-sm">Booking</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">Hourly</span>
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

                {isTraveler && (
                  <div className="pt-4 border-t">
                    <Button className="w-full" size="lg" asChild>
                      <Link href={`/book/${listing.id}`}>
                        Book Now
                      </Link>
                    </Button>
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Pay in cash when you drop off your luggage
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
