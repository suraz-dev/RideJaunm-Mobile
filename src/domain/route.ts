/**
 * Route & Geospatial Domain Types
 * Defines route profiles, curvature indexing, Nepal road surfaces, and hazard restrictions.
 */

export type RouteId = string;
export type RouteProfile = 'straight' | 'curvy' | 'supercurvy';

export type RoadSurface =
  | 'paved_asphalt'
  | 'broken_tar'
  | 'gravel_dirt'
  | 'monsoon_mud'
  | 'riverbed';

export type HazardSeverity = 'low' | 'moderate' | 'high' | 'critical_closed';

export interface RouteHazard {
  id: string;
  type: 'landslide' | 'unpaved_gravel' | 'fuel_gap' | 'permit_checkpoint' | 'water_crossing' | 'monsoon_mud';
  locationName: string;
  coordinates: [number, number]; // [longitude, latitude]
  severity: HazardSeverity;
  description: string;
  activeMonsoonClosure: boolean;
  reportedAtUtc: string;
}

export interface SurfaceBreakdown {
  pavedPercentage: number;
  unpavedPercentage: number;
  roughGravelPercentage: number;
}

export interface RouteCandidate {
  id: RouteId;
  profile: RouteProfile;
  title: string;
  titleNepali: string;
  origin: {
    name: string;
    nameNepali: string;
    coordinates: [number, number];
  };
  destination: {
    name: string;
    nameNepali: string;
    coordinates: [number, number];
  };
  distanceMeters: number;
  durationSeconds: number;
  elevationGainMeters: number;
  maxAltitudeMeters: number;
  curvinessScore: number; // Scale 1.0 - 10.0
  surfaceBreakdown: SurfaceBreakdown;
  hazards: RouteHazard[];
  isSupercurvyRestrictedInTerai: boolean; // Flat Terai highways cannot offer Supercurvy
  isPassableUnderMonsoon: boolean;
  provenance: string; // e.g. 'OSRM_VALHALLA_NEPAL_GRAPH_V1'
  freshnessTimestampUtc: string;
}
