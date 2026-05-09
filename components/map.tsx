'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    id: string;
    position: [number, number];
    title: string;
    description?: string;
    price?: number;
    onClick?: () => void;
  }>;
  onMapClick?: (lat: number, lng: number) => void;
  className?: string;
  height?: string;
}

export default function Map({
  center = [40.7128, -74.0060], // Default to NYC
  zoom = 13,
  markers = [],
  onMapClick,
  className = '',
  height = '400px',
}: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map
    mapRef.current = L.map(mapContainerRef.current).setView(center, zoom);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapRef.current);

    // Add map click handler
    if (onMapClick) {
      mapRef.current.on('click', (e: L.LeafletMouseEvent) => {
        onMapClick(e.latlng.lat, e.latlng.lng);
      });
    }

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update map center and zoom
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(center, zoom);
    }
  }, [center, zoom]);

  // Update markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapRef.current?.removeLayer(marker);
    });
    markersRef.current = [];

    // Add new markers
    markers.forEach(markerData => {
      const marker = L.marker(markerData.position);
      
      // Create popup content
      let popupContent = `<div class="p-2">
        <h3 class="font-semibold text-sm">${markerData.title}</h3>`;
      
      if (markerData.description) {
        popupContent += `<p class="text-xs text-gray-600 mt-1">${markerData.description}</p>`;
      }
      
      if (markerData.price) {
        popupContent += `<p class="text-sm font-bold text-blue-600 mt-2">$${markerData.price}/hour</p>`;
      }
      
      popupContent += '</div>';
      
      marker.bindPopup(popupContent);

      // Add click handler
      if (markerData.onClick) {
        marker.on('click', markerData.onClick);
      }

      marker.addTo(mapRef.current!);
      markersRef.current.push(marker);
    });

    // Fit bounds if there are markers
    if (markers.length > 1) {
      const group = new L.FeatureGroup(markersRef.current);
      mapRef.current.fitBounds(group.getBounds().pad(0.1));
    }
  }, [markers]);

  return (
    <div 
      ref={mapContainerRef} 
      className={`w-full ${className}`}
      style={{ height }}
    />
  );
}
