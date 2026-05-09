"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { createNotificationFromClient } from "@/lib/notifications";
import {
  CalendarIcon,
  Clock,
  DollarSign,
  Luggage,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import {
  format,
  addHours,
  isAfter,
  isBefore,
  startOfDay,
  endOfDay,
} from "date-fns";
import { cn } from "@/lib/utils";

interface BookingFormProps {
  listing: any;
}

export default function BookingForm({ listing }: BookingFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [selectedDate, setSelectedDate] = useState<Date>();
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isTraveler, setIsTraveler] = useState(false);

  // Pricing calculation
  const [totalHours, setTotalHours] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  // Get current user and check role
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        setIsTraveler(profile?.role === "traveler");
      }
    };
    getUser();
  }, [supabase]);

  // Calculate pricing when date/time changes
  useEffect(() => {
    if (selectedDate && startTime && endTime) {
      const start = new Date(
        `${format(selectedDate, "yyyy-MM-dd")}T${startTime}`,
      );
      const end = new Date(`${format(selectedDate, "yyyy-MM-dd")}T${endTime}`);

      if (isAfter(end, start)) {
        const hours = Math.ceil(
          (end.getTime() - start.getTime()) / (1000 * 60 * 60),
        );
        setTotalHours(hours);
        setTotalPrice(hours * listing.hourly_price);
      } else {
        setTotalHours(0);
        setTotalPrice(0);
      }
    } else {
      setTotalHours(0);
      setTotalPrice(0);
    }
  }, [selectedDate, startTime, endTime, listing.hourly_price]);

  // Generate time slots (9 AM to 9 PM in 1-hour increments)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 21; hour++) {
      const timeString = `${hour.toString().padStart(2, "0")}:00`;
      const displayTime = hour <= 12 ? `${hour}:00 AM` : `${hour - 12}:00 PM`;
      if (hour === 12) {
        slots.push({ value: timeString, label: "12:00 PM" });
      } else {
        slots.push({ value: timeString, label: displayTime });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Filter end time slots to be after start time
  const getAvailableEndTimes = () => {
    if (!startTime) return timeSlots;

    const startHour = parseInt(startTime.split(":")[0]);
    return timeSlots.filter((slot) => {
      const slotHour = parseInt(slot.value.split(":")[0]);
      return slotHour > startHour;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError("You must be logged in to make a booking");
      return;
    }

    if (!isTraveler) {
      setError("Only travelers can create bookings");
      return;
    }

    if (!selectedDate || !startTime || !endTime) {
      setError("Please select date and time");
      return;
    }

    if (totalHours <= 0) {
      setError("End time must be after start time");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create booking
      const startDateTime = new Date(
        `${format(selectedDate, "yyyy-MM-dd")}T${startTime}`,
      );
      const endDateTime = new Date(
        `${format(selectedDate, "yyyy-MM-dd")}T${endTime}`,
      );

      // Generate simple QR code (in production, use a proper QR code library)
      const qrCode = `STASH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          traveler_id: user.id,
          stash_id: listing.id,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          total_hours: totalHours,
          total_price: totalPrice,
          status: "pending",
          qr_code: qrCode,
          special_instructions: specialInstructions || null,
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Notify the stasher about the new booking
      await createNotificationFromClient({
        userId: listing.stasher_id,
        type: "new_booking",
        title: "New Booking Request",
        message: `You have a new booking request for "${listing.name}" — ${totalHours}h for $${totalPrice.toFixed(2)}`,
        data: {
          listing_id: listing.id,
          booking_id: booking.id,
          actor_id: user.id,
        },
      });

      // Redirect to booking confirmation
      router.push(`/booking-confirmation/${booking.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create booking");
    } finally {
      setIsLoading(false);
    }
  };

  // Disable past dates
  const disabledDays = {
    before: new Date(),
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Select Date & Time
          </CardTitle>
          <CardDescription>
            Choose when you'd like to drop off and pick up your luggage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date Selection */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={disabledDays}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Drop-off Time</Label>
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot.value} value={slot.value}>
                      {slot.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Pick-up Time</Label>
              <Select value={endTime} onValueChange={setEndTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableEndTimes().map((slot) => (
                    <SelectItem key={slot.value} value={slot.value}>
                      {slot.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Special Instructions */}
          <div className="space-y-2">
            <Label htmlFor="instructions">
              Special Instructions (Optional)
            </Label>
            <Textarea
              id="instructions"
              placeholder="Any special requests or information for the host..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Pricing Summary */}
      {totalHours > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Booking Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Duration</span>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span className="font-medium">
                  {totalHours} hour{totalHours !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span>Rate</span>
              <span className="font-medium">${listing.hourly_price}/hour</span>
            </div>

            <div className="flex justify-between items-center">
              <span>Capacity</span>
              <div className="flex items-center gap-1">
                <Luggage className="h-4 w-4" />
                <span className="font-medium">
                  Up to {listing.capacity_bags} bags
                </span>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Pay in cash when you drop off your luggage
              </p>
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Submit Button */}
      <Card>
        <CardContent className="pt-6">
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={
              isLoading ||
              !selectedDate ||
              !startTime ||
              !endTime ||
              totalHours <= 0
            }
          >
            {isLoading ? (
              "Creating Booking..."
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirm Booking
              </>
            )}
          </Button>

          {!user && (
            <p className="text-sm text-muted-foreground text-center mt-2">
              You must be logged in to make a booking
            </p>
          )}
        </CardContent>
      </Card>
    </form>
  );
}
