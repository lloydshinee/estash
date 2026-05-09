"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createNotificationFromClient } from "@/lib/notifications";
import { ClipboardList, Loader2, Plus, X } from "lucide-react";

interface InspectionFormProps {
  bookingId: string;
  stasherId: string;
  travelerId?: string;
}

export default function InspectionForm({
  bookingId,
  stasherId,
  travelerId,
}: InspectionFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [itemDescription, setItemDescription] = useState("");
  const [itemCount, setItemCount] = useState("");
  const [conditionNotes, setConditionNotes] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");

  const addPhotoUrl = () => {
    if (newPhotoUrl.trim() && photoUrls.length < 5) {
      setPhotoUrls([...photoUrls, newPhotoUrl.trim()]);
      setNewPhotoUrl("");
    }
  };

  const removePhotoUrl = (index: number) => {
    setPhotoUrls(photoUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!itemDescription.trim()) {
      setError("Please describe the items being stored");
      setIsLoading(false);
      return;
    }

    try {
      const { error: insertError } = await supabase
        .from("inspection_notes")
        .insert({
          booking_id: bookingId,
          stasher_id: stasherId,
          item_description: itemDescription.trim(),
          item_count: itemCount ? parseInt(itemCount) : null,
          condition_notes: conditionNotes.trim() || null,
          photos: photoUrls.length > 0 ? photoUrls : null,
        });

      if (insertError) throw insertError;

      if (travelerId) {
        await createNotificationFromClient({
          userId: travelerId,
          type: "inspection_added",
          title: "Inspection Notes Added",
          message: "Your host has documented the items for your booking. Please review and approve.",
          data: {
            booking_id: bookingId,
          },
        });
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to create inspection notes");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="itemDescription">Items Description *</Label>
        <Textarea
          id="itemDescription"
          placeholder='e.g., "2 large suitcases (black), 1 backpack (blue), 1 duffel bag"'
          value={itemDescription}
          onChange={(e) => setItemDescription(e.target.value)}
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="itemCount">Number of Items</Label>
          <Input
            id="itemCount"
            type="number"
            min="0"
            placeholder="e.g., 4"
            value={itemCount}
            onChange={(e) => setItemCount(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="conditionNotes">Condition Notes</Label>
        <Textarea
          id="conditionNotes"
          placeholder='e.g., "Black suitcase has minor scuff on corner. Backpack zipper works fine."'
          value={conditionNotes}
          onChange={(e) => setConditionNotes(e.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Photos (optional, max 5)</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Paste photo URL..."
            value={newPhotoUrl}
            onChange={(e) => setNewPhotoUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addPhotoUrl();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={addPhotoUrl}
            disabled={!newPhotoUrl.trim() || photoUrls.length >= 5}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {photoUrls.length > 0 && (
          <div className="space-y-1 mt-2">
            {photoUrls.map((url, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded"
              >
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline truncate flex-1"
                >
                  Photo {index + 1}
                </a>
                <button
                  type="button"
                  onClick={() => removePhotoUrl(index)}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          {photoUrls.length}/5 photos added
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <ClipboardList className="mr-2 h-4 w-4" />
            Save Inspection Notes
          </>
        )}
      </Button>
    </form>
  );
}
