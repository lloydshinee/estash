import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Star,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Luggage,
  User,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import ReviewForm from "@/components/review-form";

export default async function NewReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "traveler") {
    redirect("/auth/login");
  }

  const { data: booking, error } = await supabase
    .from("bookings")
    .select(
      `
      *,
      stash_listings!bookings_stash_id_fkey (
        name,
        address,
        stasher_id,
        profiles!stash_listings_stasher_id_fkey (
          full_name
        )
      )
    `,
    )
    .eq("id", id)
    .eq("traveler_id", user.id)
    .single();

  if (error || !booking) {
    notFound();
  }

  if (booking.status !== "completed") {
    redirect("/traveler");
  }

  const { data: existingReview } = await supabase
    .from("reviews")
    .select("*")
    .eq("booking_id", id)
    .single();

  const listing = booking.stash_listings;
  const stasher = listing?.profiles;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link href="/traveler">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Leave a Review</h1>
              <p className="text-muted-foreground">
                Share your experience at {listing?.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {existingReview ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Your Review
                  </CardTitle>
                  <CardDescription>
                    You have already reviewed this booking
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-6 w-6 ${
                          star <= existingReview.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  {existingReview.comment && (
                    <p className="text-muted-foreground">
                      {existingReview.comment}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Posted on{" "}
                    {existingReview.created_at
                      ? format(
                          new Date(existingReview.created_at),
                          "PPP",
                        )
                      : "N/A"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Rate Your Experience
                  </CardTitle>
                  <CardDescription>
                    How was your storage experience at {listing?.name}?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ReviewForm
                    bookingId={id}
                    travelerId={user.id}
                    stasherId={listing?.stasher_id || ""}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Location</Label>
                  <p className="mt-1 font-medium">{listing?.name}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3" />
                    {listing?.address}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Host</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{stasher?.full_name}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Drop-off</Label>
                  <p className="text-sm mt-1">
                    {format(new Date(booking.start_time), "MMM d, h:mm a")}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Pick-up</Label>
                  <p className="text-sm mt-1">
                    {format(new Date(booking.end_time), "MMM d, h:mm a")}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{booking.total_hours}h</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      ${booking.total_price}
                    </span>
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

function Label({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}
