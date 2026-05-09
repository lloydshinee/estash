"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { notifyAdminsFromClient } from "@/lib/notifications";
import { 
  Building2, 
  MapPin, 
  FileText, 
  Upload, 
  AlertCircle, 
  CheckCircle,
  Camera,
  Shield,
  DollarSign
} from "lucide-react";

interface StasherApplicationFormProps {
  user: any;
}

export default function StasherApplicationForm({ user }: StasherApplicationFormProps) {
  const router = useRouter();
  const supabase = createClient();
  
  const [formData, setFormData] = useState({
    businessName: "",
    address: "",
    description: "",
    idPhotoUrl: "",
    spacePhotos: [] as string[]
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.businessName || !formData.address || !formData.description) {
      setError("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Submit application
      const { data: newApp, error: applicationError } = await supabase
        .from("stasher_applications")
        .insert({
          user_id: user.id,
          business_name: formData.businessName,
          address: formData.address,
          description: formData.description,
          id_photo_url: formData.idPhotoUrl || null,
          space_photos: formData.spacePhotos.length > 0 ? formData.spacePhotos : null,
          status: "pending"
        })
        .select("id")
        .single();

      if (applicationError) throw applicationError;

      // Notify all admins about the new application
      await notifyAdminsFromClient({
        type: "application_submitted",
        title: "New Stasher Application",
        message: `${user.user_metadata?.full_name || "A user"} has submitted a stasher application: "${formData.businessName}"`,
        data: {
          application_id: newApp?.id,
          actor_id: user.id,
          actor_name: user.user_metadata?.full_name || undefined,
        },
      });

      // Redirect to pending page
      router.push("/pending");
    } catch (err: any) {
      setError(err.message || "Failed to submit application");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Benefits Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Why Become a Stasher?
          </CardTitle>
          <CardDescription>
            Join thousands of hosts earning extra income by providing secure storage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Earn Extra Income</h3>
              <p className="text-sm text-muted-foreground">
                Set your own rates and earn money from unused space
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Safe & Secure</h3>
              <p className="text-sm text-muted-foreground">
                All bookings are insured and travelers are verified
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Flexible Hosting</h3>
              <p className="text-sm text-muted-foreground">
                Choose your availability and manage bookings easily
              </p>
            </div>
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
          <CardDescription>
            Tell us about your storage location and business
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name *</Label>
            <Input
              id="businessName"
              placeholder="e.g., Downtown Storage Solutions"
              value={formData.businessName}
              onChange={(e) => handleInputChange("businessName", e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              This will be displayed to travelers looking for storage
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Storage Location Address *</Label>
            <Input
              id="address"
              placeholder="123 Main Street, City, State, ZIP"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Full address where travelers will drop off their luggage
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe your storage space, security features, accessibility, and any special amenities..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={5}
              required
            />
            <p className="text-xs text-muted-foreground">
              Minimum 50 characters. Include details about security, accessibility, and what makes your space special.
            </p>
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
          <CardDescription>
            Help us verify your identity and location (optional for now)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="idPhoto">ID Photo URL</Label>
            <Input
              id="idPhoto"
              type="url"
              placeholder="https://example.com/id-photo.jpg"
              value={formData.idPhotoUrl}
              onChange={(e) => handleInputChange("idPhotoUrl", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Upload your government-issued ID to a secure service and paste the URL here
            </p>
          </div>

          <div className="space-y-2">
            <Label>Space Photos</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Camera className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Upload Space Photos</h3>
              <p className="text-muted-foreground mb-4">
                Show travelers your storage space with clear, well-lit photos
              </p>
              <Button type="button" variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Upload Photos (Coming Soon)
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              For now, you can add photos after your application is approved
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Requirements Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Requirements Checklist
          </CardTitle>
          <CardDescription>
            Make sure you meet these requirements before applying
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm">Secure, clean storage space available</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm">Available during business hours for drop-off/pickup</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm">Reliable internet connection for managing bookings</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm">Commitment to providing excellent customer service</span>
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

      {/* Submit Button */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Application Review Process</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    After submitting, our team will review your application within 2-3 business days. 
                    You'll receive an email notification once your application status is updated.
                  </p>
                </div>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                "Submitting Application..."
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Submit Application
                </>
              )}
            </Button>
            
            <p className="text-xs text-muted-foreground text-center">
              By submitting this application, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
