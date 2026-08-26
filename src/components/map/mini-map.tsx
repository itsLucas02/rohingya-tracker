"use client";

// Lazy wrapper: keeps the maplibre + react-map-gl chunk out of the initial
// bundle for /report/[id]. The impl file is only fetched after hydration.
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const MiniMapImpl = dynamic(() => import("./mini-map.impl"), {
  ssr: false,
  loading: () => (
    <Skeleton className="h-40 w-full rounded-xl border border-border" />
  ),
});

export function MiniMap(props: { latitude: number; longitude: number }) {
  return <MiniMapImpl {...props} />;
}
