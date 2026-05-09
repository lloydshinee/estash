import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Users, Shield } from "lucide-react";
import Link from "next/link";

type SearchParams = {
  location?: string;
  priceRange?: string;
  capacity?: string;
  sortBy?: string;
};

export async function ListingsContent({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient();

  // Build query based on search parameters
  let query = supabase
    .from("stash_listings")
    .select(
      `
      *,
      profiles!stash_listings_stasher_id_fkey (
        full_name
      ),
      bookings (
        reviews (
          rating
        )
      )
    `,
    )
    .eq("status", "approved");

  // Apply filters
  if (searchParams.location) {
    query = query.ilike("address", `%${searchParams.location}%`);
  }

  if (searchParams.priceRange) {
    const [min, max] = searchParams.priceRange.split("-").map(Number);
    if (max) {
      query = query.gte("hourly_price", min).lte("hourly_price", max);
    } else {
      query = query.gte("hourly_price", min);
    }
  }

  if (searchParams.capacity) {
    query = query.gte("capacity_bags", parseInt(searchParams.capacity));
  }

  // Apply sorting
  switch (searchParams.sortBy) {
    case "price-low":
      query = query.order("hourly_price", { ascending: true });
      break;
    case "price-high":
      query = query.order("hourly_price", { ascending: false });
      break;
    case "capacity":
      query = query.order("capacity_bags", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data: listings, error } = await query;

  if (error) {
    console.error("Error fetching listings:", error);
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Error loading listings. Please try again.</p>
      </div>
    );
  }

  // Calculate average ratings
  const listingsWithRatings =
    listings?.map((listing) => {
      // Flatten reviews from all bookings for this listing
      const allReviews =
        listing.bookings?.flatMap((booking: any) => booking.reviews || []) ||
        [];
      const avgRating =
        allReviews.length > 0
          ? allReviews.reduce(
              (sum: number, review: any) => sum + review.rating,
              0,
            ) / allReviews.length
          : 0;
      return {
        ...listing,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: allReviews.length,
      };
    }) || [];

  if (listingsWithRatings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No listings found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {listingsWithRatings.map((listing) => (
        <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100">
            {listing.photos && listing.photos.length > 0 ? (
              <img
                src={listing.photos[0]}
                alt={listing.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Shield className="h-12 w-12 text-blue-400" />
              </div>
            )}
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="bg-white/90">
                ${listing.hourly_price}/hr
              </Badge>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-lg line-clamp-1">{listing.name}</h3>
              {listing.avgRating > 0 && (
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{listing.avgRating}</span>
                  <span className="text-muted-foreground">({listing.reviewCount})</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{listing.address}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
              <Users className="h-4 w-4" />
              <span>Up to {listing.capacity_bags} bags</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                by {listing.profiles?.full_name || "Host"}
              </div>
              <Button asChild size="sm">
                <Link href={`/listings/${listing.id}`}>View Details</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
