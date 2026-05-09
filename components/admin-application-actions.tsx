"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createNotificationFromClient } from "@/lib/notifications";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  MessageSquare,
  Clock
} from "lucide-react";

interface AdminApplicationActionsProps {
  application: any;
  currentAdminId: string;
}

export default function AdminApplicationActions({ 
  application, 
  currentAdminId 
}: AdminApplicationActionsProps) {
  const router = useRouter();
  const supabase = createClient();
  
  const [isLoading, setIsLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState(application.admin_notes || "");
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Update application status
      const { error: applicationError } = await supabase
        .from("stasher_applications")
        .update({
          status: "approved",
          reviewed_at: new Date().toISOString(),
          reviewed_by: currentAdminId,
          admin_notes: adminNotes || "Application approved. All requirements met."
        })
        .eq("id", application.id);

      if (applicationError) throw applicationError;

      // Update user role to stasher
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          role: "stasher",
          updated_at: new Date().toISOString()
        })
        .eq("id", application.user_id);

      if (profileError) throw profileError;

      // Notify the applicant
      await createNotificationFromClient({
        userId: application.user_id,
        type: "application_approved",
        title: "Application Approved",
        message: `Your stasher application "${application.business_name}" has been approved. You can now create storage listings.`,
        data: {
          application_id: application.id,
          actor_id: currentAdminId,
        },
      });

      // Refresh the page to show updated status
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to approve application");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!adminNotes.trim()) {
      setError("Please provide a reason for rejection in the admin notes");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Update application status
      const { error: applicationError } = await supabase
        .from("stasher_applications")
        .update({
          status: "rejected",
          reviewed_at: new Date().toISOString(),
          reviewed_by: currentAdminId,
          admin_notes: adminNotes
        })
        .eq("id", application.id);

      if (applicationError) throw applicationError;

      // Notify the applicant
      await createNotificationFromClient({
        userId: application.user_id,
        type: "application_rejected",
        title: "Application Rejected",
        message: `Your stasher application "${application.business_name}" has been rejected. Reason: ${adminNotes}`,
        data: {
          application_id: application.id,
          actor_id: currentAdminId,
        },
      });

      // Refresh the page to show updated status
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to reject application");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateNotes = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from("stasher_applications")
        .update({
          admin_notes: adminNotes
        })
        .eq("id", application.id);

      if (error) throw error;

      // Refresh the page to show updated notes
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to update notes");
    } finally {
      setIsLoading(false);
    }
  };

  const isPending = application.status === 'pending';
  const isApproved = application.status === 'approved';
  const isRejected = application.status === 'rejected';

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isPending && <Clock className="h-5 w-5 text-orange-500" />}
            {isApproved && <CheckCircle className="h-5 w-5 text-green-500" />}
            {isRejected && <XCircle className="h-5 w-5 text-red-500" />}
            Application Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isPending && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-orange-800">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Pending Review</span>
              </div>
              <p className="text-sm text-orange-700 mt-1">
                This application is waiting for admin approval.
              </p>
            </div>
          )}
          
          {isApproved && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">Approved</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                User has been promoted to stasher role.
              </p>
            </div>
          )}
          
          {isRejected && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800">
                <XCircle className="h-4 w-4" />
                <span className="font-medium">Rejected</span>
              </div>
              <p className="text-sm text-red-700 mt-1">
                Application has been rejected.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Admin Notes
          </CardTitle>
          <CardDescription>
            Add notes about this application for internal reference
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="adminNotes">Notes</Label>
            <Textarea
              id="adminNotes"
              placeholder="Add your review notes here..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={4}
            />
          </div>
          
          <Button 
            onClick={handleUpdateNotes}
            variant="outline"
            disabled={isLoading}
            className="w-full"
          >
            Update Notes
          </Button>
        </CardContent>
      </Card>

      {/* Actions */}
      {isPending && (
        <Card>
          <CardHeader>
            <CardTitle>Review Actions</CardTitle>
            <CardDescription>
              Approve or reject this stasher application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleApprove}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {isLoading ? "Processing..." : "Approve Application"}
            </Button>
            
            <Button
              onClick={handleReject}
              disabled={isLoading || !adminNotes.trim()}
              variant="destructive"
              className="w-full"
            >
              <XCircle className="mr-2 h-4 w-4" />
              {isLoading ? "Processing..." : "Reject Application"}
            </Button>
            
            {!adminNotes.trim() && (
              <p className="text-xs text-muted-foreground">
                Add admin notes before rejecting
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Review Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Review Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span>Verify business information is complete and accurate</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span>Check that the address is valid and accessible</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span>Ensure the description is professional and detailed</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span>Review any provided verification documents</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
