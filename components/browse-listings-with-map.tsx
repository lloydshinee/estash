'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Luggage, Shield, Clock, Map, Grid } from "lucide-react";
import Link from "next/link";
import dynamic from 'next/dynamic';

// Dynamically import the map component to avoid SSR issues
const LeafletMap = dynamic(() => import('@/components/map/leaflet-map'), {
  ssr: false,
  loading: () => (
    <div className="h-96 w-full rounded-lg bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <Map className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">Loading map...</p>
      </div>
    </div>
  )
});

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
  profiles: {
    full_name: string | null;
  } | null;
  avgRating: number;
  reviewCount: number;
}

interface BrowseListingsWithMapProps {
  listings: Listing[];
}

export default function BrowseListingsWithMap({ listings }: BrowseListingsWithMapProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const handleMarkerClick = (listing: Listing) => {
    setSelectedListing(listing);
  };

  return (
    <div>
      {/* View Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
        <p className="text-sm text-muted-foreground">
          Showing {listings.length} results
        </p>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="flex-1 sm:flex-none"
          >
            <Grid className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Grid</span>
          </Button>
          <Button
            variant={viewMode === 'map' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('map')}
            className="flex-1 sm:flex-none"
          >
            <Map className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Map</span>
          </Button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        /* Grid View */
        listings.length > 0 ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )
      ) : (
        /* Map View */
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="order-2 lg:order-1">
            <LeafletMap
              listings={listings}
              onMarkerClick={handleMarkerClick}
              className="h-[600px] w-full rounded-lg"
            />
          </div>
          <div className="order-1 lg:order-2 max-h-[600px] overflow-y-auto space-y-4">
            {listings.length > 0 ? (
              listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  compact
                  isSelected={selectedListing?.id === listing.id}
                />
              ))
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ListingCard({ 
  listing, 
  compact = false, 
  isSelected = false 
}: { 
  listing: Listing; 
  compact?: boolean;
  isSelected?: boolean;
}) {
  return (
    <Card 
      className={`hover:shadow-lg transition-shadow ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      } ${compact ? 'p-3' : ''}`}
    >
      <CardHeader className={compact ? "pb-2" : "pb-3"}>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className={compact ? "text-base" : "text-lg"}>
              {listing.name}
            </CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <MapPin className="h-4 w-4" />
              {listing.address}
            </CardDescription>
          </div>
          {listing.reviewCount > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">
                {listing.avgRating}
              </span>
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
          {listing.description && !compact && (
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
          {listing.amenities && listing.amenities.length > 0 && !compact && (
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
              <span className={compact ? "text-lg font-bold" : "text-2xl font-bold"}>
                ${listing.hourly_price}
              </span>
              <span className="text-muted-foreground">/hour</span>
            </div>
            <Button asChild size={compact ? "sm" : "default"}>
              <Link href={`/listings/${listing.id}`}>
                {compact ? "View" : "View Details"}
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <Luggage className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium mb-2">
        No storage locations found
      </h3>
      <p className="text-muted-foreground mb-4">
        Try adjusting your filters or search in a different area.
      </p>
      <Link href="/browse">
        <Button variant="outline">Clear Filters</Button>
      </Link>
    </div>
  );
}
