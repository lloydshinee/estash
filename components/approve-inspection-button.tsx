"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { createNotificationFromClient } from "@/lib/notifications";
import { CheckCircle, Loader2 } from "lucide-react";

interface ApproveInspectionButtonProps {
  inspectionId: string;
  bookingId: string;
  stasherId?: string;
}

export function ApproveInspectionButton({
  inspectionId,
  bookingId,
  stasherId,
}: ApproveInspectionButtonProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from("inspection_notes")
        .update({
          traveler_approved: true,
          approved_at: new Date().toISOString(),
        })
        .eq("id", inspectionId);

      if (updateError) throw updateError;

      if (stasherId) {
        await createNotificationFromClient({
          userId: stasherId,
          type: "inspection_approved",
          title: "Inspection Approved",
          message: "The traveler has approved the inspection notes for this booking.",
          data: {
            booking_id: bookingId,
          },
        });
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to approve inspection");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleApprove}
        disabled={isLoading}
        className="w-full bg-green-600 hover:bg-green-700"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Approving...
          </>
        ) : (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Approve Inspection
          </>
        )}
      </Button>
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
