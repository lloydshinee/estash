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
  User,
  Building2,
  MapPin,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default async function AdminApplicationsPage({
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
    .from("stasher_applications")
    .select(
      `
      *,
      profiles!stasher_applications_user_id_fkey (
        full_name,
        phone
      )
    `,
    )
    .order("submitted_at", { ascending: false });

  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data: applications } = await query;

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
              <h1 className="text-2xl sm:text-3xl font-bold">Stasher Applications</h1>
              <p className="text-muted-foreground">
                Review and manage all stasher applications
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Link href="/admin/applications">
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">All</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {applications?.length || 0}
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/applications?status=pending">
            <Card className="hover:border-orange-500 transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  Pending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {applications?.filter((a) => a.status === "pending").length ||
                    0}
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/applications?status=approved">
            <Card className="hover:border-green-500 transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Approved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {applications?.filter((a) => a.status === "approved")
                    .length || 0}
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/applications?status=rejected">
            <Card className="hover:border-red-500 transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  Rejected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {applications?.filter((a) => a.status === "rejected")
                    .length || 0}
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
                  ? "/admin/applications"
                  : `/admin/applications?status=${tab}`
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

        {/* Applications List */}
        {applications && applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((application) => (
              <Card key={application.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {application.profiles?.full_name || "Unknown"}
                          </h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {application.business_name || "No business name"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate">
                            {application.address || "No address"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {application.submitted_at
                              ? format(
                                  new Date(application.submitted_at),
                                  "MMM d, yyyy",
                                )
                              : "N/A"}
                          </span>
                        </div>
                        <div>
                          <Badge
                            variant={
                              application.status === "approved"
                                ? "default"
                                : application.status === "rejected"
                                  ? "destructive"
                                  : "secondary"
                            }
                            className={
                              application.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : application.status === "rejected"
                                  ? "bg-red-100 text-red-800"
                                  : ""
                            }
                          >
                            {application.status
                              ? application.status.charAt(0).toUpperCase() +
                                application.status.slice(1)
                              : "Unknown"}
                          </Badge>
                        </div>
                      </div>

                      {application.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {application.description}
                        </p>
                      )}
                    </div>

                    <div className="sm:ml-4">
                      <Button asChild size="sm">
                        <Link
                          href={`/admin/applications/${application.id}`}
                        >
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
                No applications found
              </h3>
              <p className="text-muted-foreground">
                {statusFilter !== "all"
                  ? `No ${statusFilter} applications to display.`
                  : "No applications have been submitted yet."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
