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
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ApproveInspectionButton } from "@/components/approve-inspection-button";

export default async function TravelerInspectionPage({
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
        address
      ),
      profiles!bookings_traveler_id_fkey (
        full_name
      )
    `,
    )
    .eq("id", id)
    .eq("traveler_id", user.id)
    .single();

  if (error || !booking) {
    notFound();
  }

  const { data: inspection } = await supabase
    .from("inspection_notes")
    .select(
      `
      *,
      profiles!inspection_notes_stasher_id_fkey (
        full_name
      )
    `,
    )
    .eq("booking_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const listing = booking.stash_listings;

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
              <h1 className="text-2xl sm:text-3xl font-bold">Item Inspection</h1>
              <p className="text-muted-foreground">
                Review and approve the inspection of your items
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {!inspection ? (
          <Card>
            <CardContent className="text-center py-12">
              <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No Inspection Yet
              </h3>
              <p className="text-muted-foreground">
                The host has not created an inspection report yet. This will
                appear after you drop off your items.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    Inspection Report
                  </CardTitle>
                  <CardDescription>
                    Recorded by {inspection.profiles?.full_name || "Host"} on{" "}
                    {inspection.created_at
                      ? format(new Date(inspection.created_at), "PPP 'at' p")
                      : "N/A"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">
                      Items Description
                    </Label>
                    <p className="mt-1 text-lg">
                      {inspection.item_description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">
                        Item Count
                      </Label>
                      <p className="mt-1 font-semibold text-lg">
                        {inspection.item_count || "Not specified"}
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <div className="mt-1">
                        {inspection.traveler_approved ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approved by You
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Awaiting Your Approval
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {inspection.condition_notes && (
                    <div>
                      <Label className="text-sm font-medium">
                        Condition Notes
                      </Label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                        <p className="text-muted-foreground">
                          {inspection.condition_notes}
                        </p>
                      </div>
                    </div>
                  )}

                  {inspection.photos &&
                    inspection.photos.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium">Photos</Label>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          {inspection.photos.map(
                            (photo: string, idx: number) => (
                              <a
                                key={idx}
                                href={photo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block p-2 border rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <div className="text-blue-600 hover:text-blue-700 underline text-sm truncate">
                                  Inspection Photo {idx + 1}
                                </div>
                              </a>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>
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
                    <Label className="text-sm font-medium">Location</Label>
                    <p className="mt-1 font-medium">{listing?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {listing?.address}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Drop-off</Label>
                    <p className="text-sm">
                      {format(new Date(booking.start_time), "MMM d, h:mm a")}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Pick-up</Label>
                    <p className="text-sm">
                      {format(new Date(booking.end_time), "MMM d, h:mm a")}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm">{booking.total_hours}h</span>
                    <span className="font-medium">
                      ${booking.total_price}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {!inspection.traveler_approved && (
                <Card>
                  <CardHeader>
                    <CardTitle>Approve Inspection</CardTitle>
                    <CardDescription>
                      Confirm that the inspection notes accurately reflect your
                      items
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                      By approving, you confirm that the items listed and their
                      described condition are accurate.
                    </div>
                    <ApproveInspectionButton
                      inspectionId={inspection.id}
                      bookingId={id}
                      stasherId={inspection.stasher_id || undefined}
                    />
                  </CardContent>
                </Card>
              )}

              {inspection.traveler_approved && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Inspection Approved
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      You have approved this inspection report. Your items are
                      now officially documented.
                    </p>
                    {inspection.approved_at && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Approved on{" "}
                        {format(
                          new Date(inspection.approved_at),
                          "PPP 'at' p",
                        )}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
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
