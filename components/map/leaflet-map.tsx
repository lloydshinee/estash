"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers in Leaflet with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
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

interface LeafletMapProps {
  listings: Listing[];
  center?: [number, number];
  zoom?: number;
  onMarkerClick?: (listing: Listing) => void;
  className?: string;
}

export default function LeafletMap({
  listings,
  center = [40.7128, -74.006], // Default to NYC
  zoom = 12,
  onMarkerClick,
  className = "h-96 w-full rounded-lg",
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    mapInstanceRef.current = L.map(mapRef.current).setView(center, zoom);

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(mapInstanceRef.current);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center, zoom]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      mapInstanceRef.current?.removeLayer(marker);
    });
    markersRef.current = [];

    // Add new markers
    listings.forEach((listing) => {
      if (listing.latitude && listing.longitude) {
        const marker = L.marker([listing.latitude, listing.longitude]).addTo(
          mapInstanceRef.current!,
        ).bindPopup(`
            <div class="p-2">
              <h3 class="font-semibold">${listing.name}</h3>
              <p class="text-sm text-gray-600">${listing.address}</p>
              <p class="text-sm">
                <strong>$${listing.hourly_price}/hour</strong> • 
                ${listing.capacity_bags} bags
              </p>
            </div>
          `);

        if (onMarkerClick) {
          marker.on("click", () => onMarkerClick(listing));
        }

        markersRef.current.push(marker);
      }
    });

    // Fit map to show all markers if there are any
    if (markersRef.current.length > 0) {
      const group = new L.FeatureGroup(markersRef.current);
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    }
  }, [listings, onMarkerClick]);

  return <div ref={mapRef} className={className} />;
}
