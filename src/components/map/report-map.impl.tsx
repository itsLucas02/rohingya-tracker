"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useMemo, useRef, useState } from "react";
import Map, {
  Marker,
  Popup,
  NavigationControl,
  GeolocateControl,
  type MapRef,
} from "react-map-gl/maplibre";
import Supercluster from "supercluster";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { CATEGORY_ICONS } from "@/lib/categories";
import { MAP_STYLES, MALAYSIA_VIEW } from "@/lib/map/config";
import { CategoryBadge } from "@/components/report/category-badge";
import type { MapReport } from "@/lib/data/reports";

type ClusterProps = { cluster: true; point_count: number; cluster_id: number };
type PointProps = { cluster: false; report: MapReport };

export default function ReportMapImpl({ reports }: { reports: MapReport[] }) {
  const { resolvedTheme } = useTheme();
  const t = useTranslations();
  const mapRef = useRef<MapRef>(null);
  const [selected, setSelected] = useState<MapReport | null>(null);
  const [bounds, setBounds] = useState<[number, number, number, number] | null>(
    null,
  );
  const [zoom, setZoom] = useState<number>(MALAYSIA_VIEW.zoom);

  const style = resolvedTheme === "dark" ? MAP_STYLES.dark : MAP_STYLES.light;

  const index = useMemo(() => {
    const sc = new Supercluster<{ report: MapReport }>({
      radius: 60,
      maxZoom: 15,
    });
    sc.load(
      reports.map((r) => ({
        type: "Feature" as const,
        properties: { report: r },
        geometry: {
          type: "Point" as const,
          coordinates: [r.longitude, r.latitude],
        },
      })),
    );
    return sc;
  }, [reports]);

  const clusters = useMemo(() => {
    if (!bounds) return [];
    return index.getClusters(bounds, Math.round(zoom));
  }, [index, bounds, zoom]);

  const syncViewport = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const b = map.getBounds();
    setBounds([
      b.getWest(),
      b.getSouth(),
      b.getEast(),
      b.getNorth(),
    ]);
    setZoom(map.getZoom());
  }, []);

  return (
    <div className="relative size-full">
      <Map
        ref={mapRef}
        initialViewState={MALAYSIA_VIEW}
        mapStyle={style}
        onLoad={syncViewport}
        onMoveEnd={syncViewport}
        attributionControl={{ compact: true }}
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="bottom-right" showCompass={false} />
        <GeolocateControl position="bottom-right" />

        {clusters.map((feature) => {
          const [lng, lat] = feature.geometry.coordinates;
          const props = feature.properties as ClusterProps | PointProps;

          if ("cluster" in props && props.cluster) {
            const size = 28 + Math.min(props.point_count, 40);
            return (
              <Marker
                key={`cluster-${props.cluster_id}`}
                longitude={lng}
                latitude={lat}
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  const zoomTo = Math.min(
                    index.getClusterExpansionZoom(props.cluster_id),
                    16,
                  );
                  mapRef.current?.flyTo({ center: [lng, lat], zoom: zoomTo });
                }}
              >
                <div
                  className="glass-elevated flex items-center justify-center rounded-full text-xs font-semibold shadow-md"
                  style={{ width: size, height: size }}
                >
                  {props.point_count}
                </div>
              </Marker>
            );
          }

          const report = (props as PointProps).report;
          const Icon = CATEGORY_ICONS[report.category];
          return (
            <Marker
              key={report.id}
              longitude={lng}
              latitude={lat}
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setSelected(report);
                mapRef.current?.flyTo({ center: [lng, lat], zoom: Math.max(zoom, 13) });
              }}
            >
              <div className="flex size-8 items-center justify-center rounded-full border border-black/10 bg-white text-black shadow-md transition-transform hover:scale-110">
                <Icon className="size-4" />
              </div>
            </Marker>
          );
        })}

        {selected && (
          <Popup
            longitude={selected.longitude}
            latitude={selected.latitude}
            anchor="bottom"
            offset={20}
            closeButton={false}
            onClose={() => setSelected(null)}
            className="[&_.maplibregl-popup-content]:!bg-transparent [&_.maplibregl-popup-content]:!p-0 [&_.maplibregl-popup-content]:!shadow-none [&_.maplibregl-popup-tip]:!hidden"
          >
            <Link
              href={`/report/${selected.id}`}
              onClick={() => setSelected(null)}
              className="glass-elevated block w-56 overflow-hidden rounded-xl shadow-lg"
            >
              {selected.thumbnail_urls[0] && (
                <div className="relative h-24 w-full">
                  <Image
                    src={selected.thumbnail_urls[0]}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="224px"
                  />
                </div>
              )}
              <div className="space-y-1.5 p-3">
                <CategoryBadge
                  category={selected.category}
                  label={t(`categories.${selected.category}`)}
                />
                <p className="line-clamp-2 text-sm font-medium leading-snug">
                  {selected.title}
                </p>
                {selected.address && (
                  <p className="text-[11px] text-text-muted">
                    {selected.address}
                  </p>
                )}
              </div>
            </Link>
          </Popup>
        )}
      </Map>
    </div>
  );
}
