"use client";

// Lazy wrapper: keeps the maplibre bundle out of report-form's initial JS.
// Users tapping "New Report" get instant form paint, map loads after hydration.
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

export interface LatLng {
  latitude: number;
  longitude: number;
}

const LocationPickerImpl = dynamic(() => import("./location-picker.impl"), {
  ssr: false,
  loading: () => (
    <Skeleton className="h-56 w-full rounded-xl border border-border" />
  ),
});

export function LocationPicker(props: {
  value: LatLng | null;
  onChange: (v: LatLng) => void;
}) {
  return <LocationPickerImpl {...props} />;
}
