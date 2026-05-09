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
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ClipboardList,
  User,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Luggage,
  CheckCircle,
  Package,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import InspectionForm from "@/components/inspection-form";

export default async function StasherInspectionPage({
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

  if (!profile || profile.role !== "stasher") {
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
        stasher_id
      ),
      profiles!bookings_traveler_id_fkey (
        full_name,
        phone
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error || !booking) {
    notFound();
  }

  if (booking.stash_listings?.stasher_id !== user.id) {
    redirect("/stasher");
  }

  const { data: existingInspection } = await supabase
    .from("inspection_notes")
    .select("*")
    .eq("booking_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const traveler = booking.profiles;
  const listing = booking.stash_listings;

  if (!listing) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link href="/stasher">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Item Inspection</h1>
              <p className="text-muted-foreground">
                Document and inspect items for booking
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {existingInspection ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    Existing Inspection Notes
                  </CardTitle>
                  <CardDescription>
                    Inspection recorded on{" "}
                    {existingInspection.created_at
                      ? format(
                          new Date(existingInspection.created_at),
                          "PPP 'at' p",
                        )
                      : "N/A"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">
                      Item Description
                    </Label>
                    <p className="mt-1">{existingInspection.item_description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Item Count</Label>
                      <p className="mt-1 font-semibold">
                        {existingInspection.item_count || "Not specified"}
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">
                        Traveler Approved
                      </Label>
                      <div className="mt-1">
                        {existingInspection.traveler_approved ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approved
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Pending Approval</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {existingInspection.condition_notes && (
                    <div>
                      <Label className="text-sm font-medium">
                        Condition Notes
                      </Label>
                      <p className="mt-1 text-muted-foreground">
                        {existingInspection.condition_notes}
                      </p>
                    </div>
                  )}

                  {existingInspection.photos &&
                    existingInspection.photos.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium">Photos</Label>
                        <div className="mt-2 space-y-1">
                          {existingInspection.photos.map(
                            (photo: string, idx: number) => (
                              <a
                                key={idx}
                                href={photo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-blue-600 hover:text-blue-700 underline text-sm"
                              >
                                Inspection Photo {idx + 1}
                              </a>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    Create Inspection Notes
                  </CardTitle>
                  <CardDescription>
                    Document the traveler&apos;s items and their condition during
                    drop-off
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <InspectionForm bookingId={id} stasherId={user.id} travelerId={booking.traveler_id || undefined} />
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Booking Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Traveler</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{traveler?.full_name}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Location</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{listing.name}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Drop-off</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {format(new Date(booking.start_time), "MMM d, h:mm a")}
                    </span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Pick-up</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {format(new Date(booking.end_time), "MMM d, h:mm a")}
                    </span>
                  </div>
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

            <Card>
              <CardHeader>
                <CardTitle>Inspection Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Count all items carefully</p>
                <p>• Note any existing damage or wear</p>
                <p>• Take clear photos of items</p>
                <p>• Get traveler approval for accuracy</p>
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
