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
  FileText,
  Calendar,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import AdminApplicationActions from "@/components/admin-application-actions";

export default async function AdminApplicationReview({
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

  // Get application details
  const { data: application, error } = await supabase
    .from("stasher_applications")
    .select(
      `
      *,
      profiles!stasher_applications_user_id_fkey (
        full_name,
        phone,
        created_at
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error || !application) {
    notFound();
  }

  const applicant = application.profiles;

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
              <h1 className="text-2xl sm:text-3xl font-bold">Stasher Application Review</h1>
              <p className="text-muted-foreground">
                Review and approve application from{" "}
                {applicant?.full_name || "Unknown"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Application Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Application Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Application Status</span>
                  <Badge
                    variant={
                      application.status === "pending"
                        ? "secondary"
                        : application.status === "approved"
                          ? "default"
                          : "destructive"
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
                </CardTitle>
                <CardDescription>
                  Application ID: {application.id}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground mb-1">
                      <Calendar className="h-4 w-4" />
                      Submitted
                    </div>
                    <div className="font-medium">
                      {application.submitted_at
                        ? format(
                            new Date(application.submitted_at),
                            "PPP 'at' p",
                          )
                        : "N/A"}
                    </div>
                  </div>

                  {application.reviewed_at && (
                    <div>
                      <div className="flex items-center gap-1 text-muted-foreground mb-1">
                        <CheckCircle className="h-4 w-4" />
                        Reviewed
                      </div>
                      <div className="font-medium">
                        {format(
                          new Date(application.reviewed_at),
                          "PPP 'at' p",
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {application.admin_notes && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-1">
                      Admin Notes
                    </h4>
                    <p className="text-sm text-blue-700">
                      {application.admin_notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Applicant Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Applicant Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Full Name</Label>
                  <p className="text-lg font-semibold">
                    {applicant?.full_name}
                  </p>
                </div>

                {applicant?.phone && (
                  <div>
                    <Label className="text-sm font-medium">Phone Number</Label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{applicant.phone}</span>
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium">Account Created</Label>
                  <p className="text-muted-foreground">
                    {applicant?.created_at
                      ? format(new Date(applicant.created_at), "PPP")
                      : "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Business Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Business Name</Label>
                  <p className="text-lg font-semibold">
                    {application.business_name}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">
                    Storage Location Address
                  </Label>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <span>{application.address}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm leading-relaxed">
                      {application.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Verification Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Verification Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">ID Photo</Label>
                  {application.id_photo_url ? (
                    <div className="mt-2">
                      <a
                        href={application.id_photo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 underline"
                      >
                        View ID Photo
                      </a>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No ID photo provided
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium">Space Photos</Label>
                  {application.space_photos &&
                  application.space_photos.length > 0 ? (
                    <div className="mt-2 space-y-2">
                      {application.space_photos.map((photo, index) => (
                        <a
                          key={index}
                          href={photo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-blue-600 hover:text-blue-700 underline text-sm"
                        >
                          Space Photo {index + 1}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No space photos provided
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions Sidebar */}
          <div className="lg:col-span-1">
            <AdminApplicationActions
              application={application}
              currentAdminId={user.id}
            />
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
