'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamically import the Map component to avoid SSR issues
const Map = dynamic(() => import('./map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-muted rounded-lg flex items-center justify-center">
      <div className="text-center space-y-2">
        <Skeleton className="h-4 w-32 mx-auto" />
        <Skeleton className="h-3 w-24 mx-auto" />
      </div>
    </div>
  ),
});

interface DynamicMapProps {
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

export default function DynamicMap(props: DynamicMapProps) {
  return <Map {...props} />;
}
