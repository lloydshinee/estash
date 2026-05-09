import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
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
  Search,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  DollarSign,
  Luggage,
  User,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
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

  if (!profile || profile.role !== "admin") {
    redirect("/auth/login");
  }

  const { status } = await searchParams;
  const statusFilter = status || "all";

  let query = supabase
    .from("stash_listings")
    .select(
      `
      *,
      profiles!stash_listings_stasher_id_fkey (
        full_name,
        phone
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data: listings } = await query;

  return (
    <div className="min-h-screen bg-background">
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
              <h1 className="text-2xl sm:text-3xl font-bold">Storage Listings</h1>
              <p className="text-muted-foreground">
                Review and manage all storage listings
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Link href="/admin/listings">
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">All</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {listings?.length || 0}
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/listings?status=pending">
            <Card className="hover:border-orange-500 transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  Pending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {listings?.filter((l) => l.status === "pending").length || 0}
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/listings?status=approved">
            <Card className="hover:border-green-500 transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Approved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {listings?.filter((l) => l.status === "approved").length ||
                    0}
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/listings?status=rejected">
            <Card className="hover:border-red-500 transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  Rejected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {listings?.filter((l) => l.status === "rejected").length || 0}
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {["all", "pending", "approved", "rejected"].map((tab) => (
            <Link
              key={tab}
              href={
                tab === "all"
                  ? "/admin/listings"
                  : `/admin/listings?status=${tab}`
              }
            >
              <Badge
                variant={statusFilter === tab ? "default" : "outline"}
                className="cursor-pointer capitalize px-4 py-2"
              >
                {tab}
              </Badge>
            </Link>
          ))}
        </div>

        {/* Listings Grid */}
        {listings && listings.length > 0 ? (
          <div className="space-y-4">
            {listings.map((listing) => (
              <Card key={listing.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {listing.name}
                          </h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {listing.profiles?.full_name || "Unknown host"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate">{listing.address}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <DollarSign className="h-4 w-4" />
                          <span>${listing.hourly_price}/hr</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Luggage className="h-4 w-4" />
                          <span>{listing.capacity_bags} bags</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {listing.created_at
                              ? format(
                                  new Date(listing.created_at),
                                  "MMM d, yyyy",
                                )
                              : "N/A"}
                          </span>
                        </div>
                      </div>

                      {listing.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {listing.description}
                        </p>
                      )}

                      <div className="flex gap-2">
                        <Badge
                          variant={
                            listing.status === "approved"
                              ? "default"
                              : listing.status === "rejected"
                                ? "destructive"
                                : "secondary"
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
                        {listing.security_features?.slice(0, 2).map(
                          (feature, i) => (
                            <Badge key={i} variant="outline">
                              {feature}
                            </Badge>
                          ),
                        )}
                        {(listing.security_features?.length || 0) > 2 && (
                          <Badge variant="outline">
                            +{listing.security_features!.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="sm:ml-4">
                      <Button asChild size="sm">
                        <Link href={`/admin/listings/${listing.id}`}>
                          Review
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No listings found
              </h3>
              <p className="text-muted-foreground">
                {statusFilter !== "all"
                  ? `No ${statusFilter} listings to display.`
                  : "No listings have been created yet."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
