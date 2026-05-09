"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createNotificationFromClient } from "@/lib/notifications";
import { Star, Loader2, Send } from "lucide-react";

interface ReviewFormProps {
  bookingId: string;
  travelerId: string;
  stasherId: string;
}

export default function ReviewForm({
  bookingId,
  travelerId,
  stasherId,
}: ReviewFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (rating === 0) {
      setError("Please select a rating");
      setIsLoading(false);
      return;
    }

    try {
      const { error: insertError } = await supabase
        .from("reviews")
        .insert({
          booking_id: bookingId,
          traveler_id: travelerId,
          stasher_id: stasherId,
          rating,
          comment: comment.trim() || null,
        });

      if (insertError) throw insertError;

      await createNotificationFromClient({
        userId: stasherId,
        type: "review_received",
        title: "New Review Received",
        message: `You received a ${rating}-star review from a traveler.`,
        data: {
          booking_id: bookingId,
          actor_id: travelerId,
        },
      });

      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to submit review");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <Label>Rating</Label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-colors"
            >
              <Star
                className={`h-8 w-8 ${
                  star <= (hoveredRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300 hover:text-yellow-200"
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-muted-foreground">
            {rating > 0
              ? ["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]
              : "Select a rating"}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment">Review (optional)</Label>
        <Textarea
          id="comment"
          placeholder="Tell others about your experience... Was the location clean? Was the host friendly? How was the overall service?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <Button type="submit" disabled={isLoading || rating === 0} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Submit Review
          </>
        )}
      </Button>
    </form>
  );
}
