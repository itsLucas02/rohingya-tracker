"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useState } from "react";
import Map, { Marker, type MapRef } from "react-map-gl/maplibre";
import { useRef } from "react";
import { MapPin, LocateFixed } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { MAP_STYLES, MALAYSIA_VIEW } from "@/lib/map/config";
import { Button } from "@/components/ui/button";
import type { LatLng } from "./location-picker";

export default function LocationPickerImpl({
  value,
  onChange,
}: {
  value: LatLng | null;
  onChange: (v: LatLng) => void;
}) {
  const { resolvedTheme } = useTheme();
  const t = useTranslations("map");
  const mapRef = useRef<MapRef>(null);
  const [locating, setLocating] = useState(false);
  const style = resolvedTheme === "dark" ? MAP_STYLES.dark : MAP_STYLES.light;

  function useMyLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        onChange(next);
        mapRef.current?.flyTo({
          center: [next.longitude, next.latitude],
          zoom: 15,
        });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <div className="relative h-56 w-full overflow-hidden rounded-xl border border-border">
      <Map
        ref={mapRef}
        initialViewState={value ? { ...value, zoom: 14 } : MALAYSIA_VIEW}
        mapStyle={style}
        onClick={(e) =>
          onChange({ latitude: e.lngLat.lat, longitude: e.lngLat.lng })
        }
        style={{ width: "100%", height: "100%" }}
      >
        {value && (
          <Marker
            longitude={value.longitude}
            latitude={value.latitude}
            draggable
            onDragEnd={(e) =>
              onChange({ latitude: e.lngLat.lat, longitude: e.lngLat.lng })
            }
          >
            <MapPin className="size-7 -translate-y-3 fill-primary text-primary-foreground" />
          </Marker>
        )}
      </Map>

      <Button
        type="button"
        variant="glass"
        size="sm"
        onClick={useMyLocation}
        disabled={locating}
        className="absolute right-2 top-2 z-10"
      >
        <LocateFixed className="size-4" />
        {t("useMyLocation")}
      </Button>

      {!value && (
        <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center">
          <span className="glass rounded-md px-2.5 py-1 text-[11px] text-text-secondary">
            {t("useMyLocation")}
          </span>
        </div>
      )}
    </div>
  );
}
