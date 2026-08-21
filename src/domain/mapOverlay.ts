/**
 * ============================================================================
 * ROUTE OVERLAYS, MARKERS & MAP CONTROLS DOMAIN (R8 / R9 / ADR-001)
 * ============================================================================
 *
 * WHY THIS EXISTS:
 * Defines typed contracts for route polyline overlays, markers, and tactical
 * map controls without coupling the UI to proprietary map renderer SDKs.
 *
 * INVARIANTS:
 * 1. 7 Route Semantics (Straight, Curvy, Supercurvy, Alternative, Hazard, Detour, Lost).
 * 2. Hazard styling strictly uses warning/danger semantics (never SOS Red #FF1F3D).
 * 3. Rider position marker is rendered ONLY for 'locked' and 'stale' GPS fixes.
 * 4. All screen points represent synthetic fixture traces (not live GPS/SDK points).
 */

export type RouteSemantic =
  | 'straight'     // Fastest highway corridor (Glacier Cyan solid)
  | 'curvy'        // Balanced bends (Volt solid with glow)
  | 'supercurvy'   // Adventure / high-pass bends (Ultra Magenta dashed)
  | 'alternative'  // Secondary option (Cyan dashed)
  | 'hazard'       // Hazardous / mud washout segment (Warning/Danger dashed)
  | 'detour'       // Temporary bypass route (Amber dashed)
  | 'lost';        // Off-route / dead reckoning segment (Neutral dashed)

/**
 * Normalized 2D coordinate percentage (0 - 100) on the map canvas.
 */
export interface RouteScreenPoint {
  x: number; // 0 to 100 percentage from left
  y: number; // 0 to 100 percentage from top
}

export interface RouteLayerInput {
  id: string;
  semantic: RouteSemantic;
  isSelected: boolean;
  label: string;
  labelNepali?: string;
  points: RouteScreenPoint[];
  provenance: {
    source: string;
    sourceVersion: string;
    freshUntil?: string;
  };
  restrictionReason?: string;
}

export type MarkerKind = 'origin' | 'destination' | 'waypoint' | 'hazard' | 'rider';

export interface MapMarker {
  id: string;
  kind: MarkerKind;
  position: RouteScreenPoint;
  label: string;
  labelNepali?: string;
  description?: string;
  severity?: 'low' | 'moderate' | 'critical'; // Strictly warning/danger (never SOS red)
  headingDeg?: number;
  isStale?: boolean;
}

export interface MapControlState {
  bearingDegrees: number;
  pitchDegrees: number;
  zoom: number;
  isLayersSheetOpen: boolean;
}
