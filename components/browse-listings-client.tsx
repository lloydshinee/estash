'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Shield, Clock, Luggage, Map as MapIcon, Grid3X3 } from 'lucide-react';
import Link from 'next/link';
import DynamicMap from '@/components/dynamic-map';
import { useRouter } from 'next/navigation';

interface Listing {
  id: string;
  name: string;
  description: string | null;
  address: string;
  latitude: number;
  longitude: number;
  hourly_price: number;
  capacity_bags: number;
  security_features: string[] | null;
  amenities: string[] | null;
  photos: string[] | null;
  profiles: {
    full_name: string | null;
  } | null;
  avgRating: number;
  reviewCount: number;
}

interface BrowseListingsClientProps {
  listings: Listing[];
  searchParams: {
    location?: string;
    priceRange?: string;
    capacity?: string;
    sortBy?: string;
  };
}

export default function BrowseListingsClient({ 
  listings, 
  searchParams 
}: BrowseListingsClientProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const router = useRouter();

  // Calculate map center based on listings
  const mapCenter: [number, number] = listings.length > 0 
    ? [
        listings.reduce((sum, listing) => sum + listing.latitude, 0) / listings.length,
        listings.reduce((sum, listing) => sum + listing.longitude, 0) / listings.length
      ]
    : [40.7128, -74.0060]; // Default to NYC

  // Convert listings to map markers
  const mapMarkers = listings.map(listing => ({
    id: listing.id,
    position: [listing.latitude, listing.longitude] as [number, number],
    title: listing.name,
    description: listing.address,
    price: listing.hourly_price,
    onClick: () => {
      router.push(`/listings/${listing.id}`);
    }
  }));

  const handleMapClick = (lat: number, lng: number) => {
    // Update location search based on clicked coordinates
    const newParams = new URLSearchParams();
    
    // Add existing search params
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== 'location') {
        newParams.set(key, value);
      }
    });
    
    // Add approximate location (you might want to use reverse geocoding here)
    newParams.set('location', `${lat.toFixed(4)},${lng.toFixed(4)}`);
    
    router.push(`/browse?${newParams.toString()}`);
  };

  return (
    <div className="lg:col-span-3">
      {/* View Toggle and Sort Options */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Showing {listings.length} results
          </p>
          
          {/* View Mode Toggle */}
          <div className="flex border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8"
            >
              <Grid3X3 className="h-4 w-4 mr-1" />
              Grid
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('map')}
              className="h-8"
            >
              <MapIcon className="h-4 w-4 mr-1" />
              Map
            </Button>
          </div>
        </div>

        {/* Sort Options */}
        <form method="GET">
          <select
            name="sortBy"
            defaultValue={searchParams.sortBy || "newest"}
            onChange={(e) => {
              const form = e.target.form;
              if (form) form.submit();
            }}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="newest">Newest first</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="capacity">Highest Capacity</option>
          </select>
          {/* Hidden inputs */}
          {searchParams.location && (
            <input type="hidden" name="location" value={searchParams.location} />
          )}
          {searchParams.priceRange && (
            <input type="hidden" name="priceRange" value={searchParams.priceRange} />
          )}
          {searchParams.capacity && (
            <input type="hidden" name="capacity" value={searchParams.capacity} />
          )}
        </form>
      </div>

      {/* Content */}
      {viewMode === 'map' ? (
        <div className="space-y-4">
          {/* Map */}
          <Card>
            <CardContent className="p-0">
              <DynamicMap
                center={mapCenter}
                zoom={12}
                markers={mapMarkers}
                onMapClick={handleMapClick}
                height="500px"
                className="rounded-lg overflow-hidden"
              />
            </CardContent>
          </Card>
          
          {/* Listings List (compact view below map) */}
          <div className="space-y-3">
            {listings.map((listing) => (
              <Card key={listing.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">{listing.name}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {listing.address}
                          </p>
                        </div>
                        {listing.reviewCount > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{listing.avgRating}</span>
                            <span className="text-sm text-muted-foreground">
                              ({listing.reviewCount})
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex gap-2">
                          <Badge variant="secondary" className="text-xs">
                            <Luggage className="h-3 w-3 mr-1" />
                            {listing.capacity_bags} bags
                          </Badge>
                          {listing.security_features && listing.security_features.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                              Secure
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 ml-auto">
                          <div className="text-right">
                            <span className="text-lg font-bold">${listing.hourly_price}</span>
                            <span className="text-muted-foreground text-sm">/hour</span>
                          </div>
                          <Button asChild size="sm">
                            <Link href={`/listings/${listing.id}`}>
                              View
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        /* Grid View */
        listings.length > 0 ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{listing.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <MapPin className="h-4 w-4" />
                        {listing.address}
                      </CardDescription>
                    </div>
                    {listing.reviewCount > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{listing.avgRating}</span>
                        <span className="text-sm text-muted-foreground">
                          ({listing.reviewCount})
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Description */}
                    {listing.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {listing.description}
                      </p>
                    )}

                    {/* Features */}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">
                        <Luggage className="h-3 w-3 mr-1" />
                        {listing.capacity_bags} bags
                      </Badge>
                      {listing.security_features && listing.security_features.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          Secure
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        Hourly
                      </Badge>
                    </div>

                    {/* Amenities */}
                    {listing.amenities && listing.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {listing.amenities.slice(0, 3).map((amenity, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                        {listing.amenities.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{listing.amenities.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Price and Action */}
                    <div className="flex justify-between items-center pt-2">
                      <div>
                        <span className="text-2xl font-bold">${listing.hourly_price}</span>
                        <span className="text-muted-foreground">/hour</span>
                      </div>
                      <Button asChild>
                        <Link href={`/listings/${listing.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Luggage className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No storage locations found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or search in a different area.
            </p>
            <Link href="/browse">
              <Button variant="outline">Clear Filters</Button>
            </Link>
          </div>
        )
      )}
    </div>
  );
}
