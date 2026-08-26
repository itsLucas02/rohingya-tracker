// CARTO free vector basemaps — no API key required, monochrome, matches the
// black/white design language. Positron = light, Dark Matter = dark.
export const MAP_STYLES = {
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
} as const;

// Malaysia — spans peninsular + Borneo.
export const MALAYSIA_VIEW = {
  longitude: 109.5,
  latitude: 4.0,
  zoom: 5,
} as const;

export const MAX_MARKER_ZOOM = 16;
