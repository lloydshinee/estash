import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  User,
  Building2,
  MapPin,
  DollarSign,
  Luggage,
  Shield,
  Star,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import AdminListingActions from "@/components/admin-listing-actions";

export default async function AdminListingReview({
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

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/auth/login");
  }

  // Get listing details
  const { data: listing, error } = await supabase
    .from("stash_listings")
    .select(
      `
      *,
      profiles!stash_listings_stasher_id_fkey (
        full_name,
        phone,
        created_at
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error || !listing) {
    notFound();
  }

  const stasher = listing.profiles;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Storage Listing Review</h1>
              <p className="text-muted-foreground">
                Review and approve listing: {listing.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Listing Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Listing Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Listing Status</span>
                  <Badge
                    variant={
                      listing.status === "pending"
                        ? "secondary"
                        : listing.status === "approved"
                          ? "default"
                          : "destructive"
                    }
                    className={
                      listing.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : listing.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : ""
                    }
                  >
                    {listing.status
                      ? listing.status.charAt(0).toUpperCase() +
                        listing.status.slice(1)
                      : "Unknown"}
                  </Badge>
                </CardTitle>
                <CardDescription>Listing ID: {listing.id}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground mb-1">
                      <Calendar className="h-4 w-4" />
                      Created
                    </div>
                    <div className="font-medium">
                      {listing.created_at
                        ? format(new Date(listing.created_at), "PPP 'at' p")
                        : "N/A"}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground mb-1">
                      <Calendar className="h-4 w-4" />
                      Updated
                    </div>
                    <div className="font-medium">
                      {listing.updated_at
                        ? format(new Date(listing.updated_at), "PPP 'at' p")
                        : "N/A"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stasher Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Stasher Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Host Name</Label>
                  <p className="text-lg font-semibold">{stasher?.full_name}</p>
                </div>

                {stasher?.phone && (
                  <div>
                    <Label className="text-sm font-medium">Phone Number</Label>
                    <p className="text-muted-foreground">{stasher.phone}</p>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium">Member Since</Label>
                  <p className="text-muted-foreground">
                    {stasher?.created_at
                      ? format(new Date(stasher.created_at), "PPP")
                      : "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Listing Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Listing Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Storage Name</Label>
                  <p className="text-lg font-semibold">{listing.name}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Address</Label>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <span>{listing.address}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Hourly Price</Label>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-lg font-semibold">
                        ${listing.hourly_price}
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Capacity</Label>
                    <div className="flex items-center gap-1">
                      <Luggage className="h-4 w-4 text-muted-foreground" />
                      <span className="text-lg font-semibold">
                        {listing.capacity_bags} bags
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm leading-relaxed">
                      {listing.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features & Amenities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Features & Amenities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Security Features */}
                {listing.security_features &&
                  listing.security_features.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        Security Features
                      </Label>
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
                    <Label className="text-sm font-medium mb-2 block">
                      Amenities
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {listing.amenities.map((amenity, index) => (
                        <Badge key={index} variant="outline">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Photos */}
                {listing.photos && listing.photos.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Photos
                    </Label>
                    <div className="space-y-2">
                      {listing.photos.map((photo, index) => (
                        <a
                          key={index}
                          href={photo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-blue-600 hover:text-blue-700 underline text-sm"
                        >
                          Photo {index + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Location Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Latitude</Label>
                    <p className="font-mono text-sm">{listing.latitude}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Longitude</Label>
                    <p className="font-mono text-sm">{listing.longitude}</p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-1">
                    Location Verification
                  </h4>
                  <p className="text-sm text-blue-700">
                    Verify that the coordinates match the provided address and
                    that the location is accessible for luggage drop-off and
                    pickup.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions Sidebar */}
          <div className="lg:col-span-1">
            <AdminListingActions listing={listing} currentAdminId={user.id} />
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
