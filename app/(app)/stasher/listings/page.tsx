import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store, Plus } from "lucide-react";
import Link from "next/link";

export default async function StasherListingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: listings } = await supabase
    .from("stash_listings")
    .select("*")
    .eq("stasher_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Listings</h1>
          <p className="text-muted-foreground">Manage your storage locations</p>
        </div>
        <Button asChild>
          <Link href="/stasher">
            <Plus className="mr-2 h-4 w-4" />
            Add New
          </Link>
        </Button>
      </div>
      {listings && listings.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {listings.map((listing) => (
            <Card key={listing.id}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  {listing.name}
                </CardTitle>
                <CardDescription>{listing.address}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  ${listing.hourly_price}/hr | {listing.capacity_bags} bags | {listing.status}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No listings yet. Create your first storage location!
          </CardContent>
        </Card>
      )}
    </div>
  );
}
