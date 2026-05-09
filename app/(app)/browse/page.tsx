import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import Link from "next/link";
import BrowseListingsWithMap from "@/components/browse-listings-with-map";

interface SearchParams {
  location?: string;
  priceRange?: string;
  capacity?: string;
  sortBy?: string;
}

export default async function BrowseListings({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const supabase = await createClient();

  // Await searchParams as it's now a Promise in Next.js 15+
  const params = await searchParams;

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
  if (params.location) {
    query = query.ilike("address", `%${params.location}%`);
  }

  if (params.priceRange && params.priceRange !== "any") {
    const [min, max] = params.priceRange.split("-").map(Number);
    if (max) {
      query = query.gte("hourly_price", min).lte("hourly_price", max);
    } else {
      query = query.gte("hourly_price", min);
    }
  }

  if (params.capacity && params.capacity !== "any") {
    query = query.gte("capacity_bags", parseInt(params.capacity));
  }

  // Apply sorting
  switch (params.sortBy) {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Find Storage</h1>
              <p className="text-muted-foreground">
                {listingsWithRatings.length} storage locations available
              </p>
            </div>
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Location Search */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Location
                  </label>
                  <form method="GET">
                    <div className="flex gap-2">
                      <Input
                        name="location"
                        placeholder="Enter city or address"
                        defaultValue={params.location}
                        className="flex-1"
                      />
                      <Button type="submit" size="sm">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                    {/* Hidden inputs to preserve other filters */}
                    {params.priceRange && (
                      <input
                        type="hidden"
                        name="priceRange"
                        value={params.priceRange}
                      />
                    )}
                    {params.capacity && (
                      <input
                        type="hidden"
                        name="capacity"
                        value={params.capacity}
                      />
                    )}
                    {params.sortBy && (
                      <input
                        type="hidden"
                        name="sortBy"
                        value={params.sortBy}
                      />
                    )}
                  </form>
                </div>

                {/* Price Range */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Price per Hour
                  </label>
                  <form method="GET">
                    <Select name="priceRange" defaultValue={params.priceRange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any price" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any price</SelectItem>
                        <SelectItem value="0-5">$0 - $5</SelectItem>
                        <SelectItem value="5-10">$5 - $10</SelectItem>
                        <SelectItem value="10-15">$10 - $15</SelectItem>
                        <SelectItem value="15">$15+</SelectItem>
                      </SelectContent>
                    </Select>
                    {/* Hidden inputs */}
                    {params.location && (
                      <input
                        type="hidden"
                        name="location"
                        value={params.location}
                      />
                    )}
                    {params.capacity && (
                      <input
                        type="hidden"
                        name="capacity"
                        value={params.capacity}
                      />
                    )}
                    {params.sortBy && (
                      <input
                        type="hidden"
                        name="sortBy"
                        value={params.sortBy}
                      />
                    )}
                    <Button
                      type="submit"
                      className="w-full mt-2"
                      variant="outline"
                      size="sm"
                    >
                      Apply
                    </Button>
                  </form>
                </div>

                {/* Capacity */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Minimum Capacity
                  </label>
                  <form method="GET">
                    <Select name="capacity" defaultValue={params.capacity}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any capacity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any capacity</SelectItem>
                        <SelectItem value="5">5+ bags</SelectItem>
                        <SelectItem value="10">10+ bags</SelectItem>
                        <SelectItem value="20">20+ bags</SelectItem>
                        <SelectItem value="50">50+ bags</SelectItem>
                      </SelectContent>
                    </Select>
                    {/* Hidden inputs */}
                    {params.location && (
                      <input
                        type="hidden"
                        name="location"
                        value={params.location}
                      />
                    )}
                    {params.priceRange && (
                      <input
                        type="hidden"
                        name="priceRange"
                        value={params.priceRange}
                      />
                    )}
                    {params.sortBy && (
                      <input
                        type="hidden"
                        name="sortBy"
                        value={params.sortBy}
                      />
                    )}
                    <Button
                      type="submit"
                      className="w-full mt-2"
                      variant="outline"
                      size="sm"
                    >
                      Apply
                    </Button>
                  </form>
                </div>

                {/* Clear Filters */}
                {(params.location || params.priceRange || params.capacity) && (
                  <Link href="/browse">
                    <Button variant="ghost" className="w-full">
                      Clear All Filters
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Listings with Map */}
          <div className="lg:col-span-3">
            <BrowseListingsWithMap listings={listingsWithRatings} />
          </div>
        </div>
      </div>
    </div>
  );
}
