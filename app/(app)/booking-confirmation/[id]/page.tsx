import { createClient } from "@/lib/supabase/server";
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
  CheckCircle,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Luggage,
  QrCode,
  User,
  Phone,
  MessageSquare,
  ArrowRight,
  ClipboardList,
  Star,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";

export default async function BookingConfirmation({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  // Get booking details with listing and stasher info
  const { data: booking, error } = await supabase
    .from("bookings")
    .select(
      `
      *,
      stash_listings!bookings_stash_id_fkey (
        name,
        address,
        hourly_price,
        capacity_bags,
        profiles!stash_listings_stasher_id_fkey (
          full_name,
          phone
        )
      ),
      profiles!bookings_traveler_id_fkey (
        full_name,
        phone
      )
    `,
    )
    .eq("id", params.id)
    .single();

  if (error || !booking) {
    notFound();
  }

  const listing = booking.stash_listings;
  const stasher = listing?.profiles;
  const traveler = booking.profiles;

  if (!listing || !stasher) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Success Header */}
      <div className="bg-green-50 border-b border-green-200">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-green-800 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-green-700">
            Your luggage storage has been reserved. Here are your booking
            details.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Booking Details
                </CardTitle>
                <CardDescription>Booking ID: {booking.id}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Drop-off</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {format(new Date(booking.start_time), "PPP 'at' p")}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Pick-up</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {format(new Date(booking.end_time), "PPP 'at' p")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Duration</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {booking.total_hours} hour
                        {booking.total_hours !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Total Cost</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">
                        ${booking.total_price}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Capacity</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Luggage className="h-4 w-4 text-muted-foreground" />
                    <span>Up to {listing.capacity_bags} bags</span>
                  </div>
                </div>

                {booking.special_instructions && (
                  <div>
                    <Label className="text-sm font-medium">
                      Special Instructions
                    </Label>
                    <div className="flex items-start gap-2 mt-1">
                      <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-sm">
                        {booking.special_instructions}
                      </span>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    Status:{" "}
                    {booking.status
                      ? booking.status.charAt(0).toUpperCase() +
                        booking.status.slice(1)
                      : "Pending"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Location Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Storage Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{listing.name}</h3>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {listing.address}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Host</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{stasher.full_name}</span>
                  </div>
                  {stasher.phone && (
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{stasher.phone}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle>What's Next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-1 rounded-full mt-0.5">
                      <span className="block w-2 h-2 bg-blue-600 rounded-full"></span>
                    </div>
                    <div>
                      <p className="font-medium">1. Arrive at the location</p>
                      <p className="text-sm text-muted-foreground">
                        Go to {listing.name} at your scheduled drop-off time
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-1 rounded-full mt-0.5">
                      <span className="block w-2 h-2 bg-blue-600 rounded-full"></span>
                    </div>
                    <div>
                      <p className="font-medium">2. Show your QR code</p>
                      <p className="text-sm text-muted-foreground">
                        Present the QR code below to your host
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-1 rounded-full mt-0.5">
                      <span className="block w-2 h-2 bg-blue-600 rounded-full"></span>
                    </div>
                    <div>
                      <p className="font-medium">3. Pay in cash</p>
                      <p className="text-sm text-muted-foreground">
                        Pay ${booking.total_price} to your host when dropping
                        off
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-1 rounded-full mt-0.5">
                      <span className="block w-2 h-2 bg-blue-600 rounded-full"></span>
                    </div>
                    <div>
                      <p className="font-medium">4. Return to pick up</p>
                      <p className="text-sm text-muted-foreground">
                        Come back at your scheduled pick-up time
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* QR Code & Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* QR Code */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Your QR Code
                </CardTitle>
                <CardDescription>
                  Show this to your host when dropping off
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                {/* Placeholder QR code - in production, generate actual QR code */}
                <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4">
                  <QrCode className="h-24 w-24 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">QR Code</p>
                </div>
                <p className="text-xs text-muted-foreground font-mono break-all">
                  {booking.qr_code}
                </p>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="/traveler">
                    View My Bookings
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <Button variant="outline" asChild className="w-full">
                  <Link href={`/traveler/bookings/${booking.id}/inspection`}>
                    <ClipboardList className="mr-2 h-4 w-4" />
                    View Inspection
                  </Link>
                </Button>

                {booking.status === "completed" && (
                  <Button variant="outline" asChild className="w-full">
                    <Link href={`/traveler/reviews/new/${booking.id}`}>
                      <Star className="mr-2 h-4 w-4" />
                      Leave a Review
                    </Link>
                  </Button>
                )}

                <Button variant="outline" asChild className="w-full">
                  <Link href="/browse">Book Another Storage</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Contact your host directly:
                </p>
                <div className="space-y-1">
                  <p className="font-medium">{stasher.full_name}</p>
                  {stasher.phone && (
                    <p className="text-sm text-muted-foreground">
                      {stasher.phone}
                    </p>
                  )}
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
