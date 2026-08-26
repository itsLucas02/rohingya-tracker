"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import Map, { Marker } from "react-map-gl/maplibre";
import { MapPin } from "lucide-react";
import { useTheme } from "next-themes";
import { MAP_STYLES } from "@/lib/map/config";

export default function MiniMapImpl({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const { resolvedTheme } = useTheme();
  const style = resolvedTheme === "dark" ? MAP_STYLES.dark : MAP_STYLES.light;

  return (
    <div className="h-40 w-full overflow-hidden rounded-xl border border-border">
      <Map
        initialViewState={{ latitude, longitude, zoom: 14 }}
        mapStyle={style}
        interactive={false}
        attributionControl={false}
        style={{ width: "100%", height: "100%" }}
      >
        <Marker longitude={longitude} latitude={latitude}>
          <MapPin className="size-7 -translate-y-3 fill-primary text-primary-foreground" />
        </Marker>
      </Map>
    </div>
  );
}
