"use client";

// Lazy wrapper: defers loading maplibre-gl + react-map-gl + supercluster until
// after hydration so the home page can paint without the map bundle blocking.
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { MapReport } from "@/lib/data/reports";

const ReportMapImpl = dynamic(() => import("./report-map.impl"), {
  ssr: false,
  loading: () => <Skeleton className="size-full" />,
});

export function ReportMap(props: { reports: MapReport[] }) {
  return <ReportMapImpl {...props} />;
}
