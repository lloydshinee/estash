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
  Clock,
  MapPin,
  DollarSign,
  Luggage
} from "lucide-react";

interface AdminListingActionsProps {
  listing: any;
  currentAdminId: string;
}

export default function AdminListingActions({ 
  listing, 
  currentAdminId 
}: AdminListingActionsProps) {
  const router = useRouter();
  const supabase = createClient();
  
  const [isLoading, setIsLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Update listing status
      const { error: listingError } = await supabase
        .from("stash_listings")
        .update({
          status: "approved",
          updated_at: new Date().toISOString()
        })
        .eq("id", listing.id);

      if (listingError) throw listingError;

      // Notify the stasher
      await createNotificationFromClient({
        userId: listing.stasher_id,
        type: "listing_approved",
        title: "Listing Approved",
        message: `Your storage listing "${listing.name}" has been approved and is now live.`,
        data: {
          listing_id: listing.id,
          actor_id: currentAdminId,
        },
      });

      // Refresh the page to show updated status
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to approve listing");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!adminNotes.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Update listing status
      const { error: listingError } = await supabase
        .from("stash_listings")
        .update({
          status: "rejected",
          updated_at: new Date().toISOString()
        })
        .eq("id", listing.id);

      if (listingError) throw listingError;

      // Notify the stasher
      await createNotificationFromClient({
        userId: listing.stasher_id,
        type: "listing_rejected",
        title: "Listing Rejected",
        message: `Your storage listing "${listing.name}" has been rejected. Reason: ${adminNotes}`,
        data: {
          listing_id: listing.id,
          actor_id: currentAdminId,
        },
      });

      // Refresh the page to show updated status
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to reject listing");
    } finally {
      setIsLoading(false);
    }
  };

  const isPending = listing.status === 'pending';
  const isApproved = listing.status === 'approved';
  const isRejected = listing.status === 'rejected';

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isPending && <Clock className="h-5 w-5 text-orange-500" />}
            {isApproved && <CheckCircle className="h-5 w-5 text-green-500" />}
            {isRejected && <XCircle className="h-5 w-5 text-red-500" />}
            Listing Status
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
                This listing is waiting for admin approval.
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
                Listing is live and visible to travelers.
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
                Listing has been rejected and is not visible.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Listing Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Hourly Rate</span>
            </div>
            <span className="font-medium">${listing.hourly_price}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Luggage className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Capacity</span>
            </div>
            <span className="font-medium">{listing.capacity_bags} bags</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Location</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {listing.latitude?.toFixed(4)}, {listing.longitude?.toFixed(4)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Rejection Notes */}
      {isPending && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Rejection Notes
            </CardTitle>
            <CardDescription>
              Add notes if rejecting this listing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminNotes">Reason for Rejection</Label>
              <Textarea
                id="adminNotes"
                placeholder="Explain why this listing cannot be approved..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {isPending && (
        <Card>
          <CardHeader>
            <CardTitle>Review Actions</CardTitle>
            <CardDescription>
              Approve or reject this storage listing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleApprove}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {isLoading ? "Processing..." : "Approve Listing"}
            </Button>
            
            <Button
              onClick={handleReject}
              disabled={isLoading || !adminNotes.trim()}
              variant="destructive"
              className="w-full"
            >
              <XCircle className="mr-2 h-4 w-4" />
              {isLoading ? "Processing..." : "Reject Listing"}
            </Button>
            
            {!adminNotes.trim() && (
              <p className="text-xs text-muted-foreground">
                Add rejection notes before rejecting
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
              <span>Verify the address is valid and accessible</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span>Check that pricing is reasonable for the area</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span>Ensure description is clear and professional</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span>Verify security features are appropriate</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span>Check coordinates match the provided address</span>
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
