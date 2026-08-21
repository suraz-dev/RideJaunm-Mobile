/**
 * ============================================================================
 * GEOSPATIAL MAP DOMAIN MODELS & ADAPTER TYPES (ADR-001 / R7)
 * ============================================================================
 *
 * WHY THIS EXISTS:
 * Defines the provider-neutral data contracts for map rendering, camera state,
 * network policies, base-map freshness/coverage states, and provenance attribution.
 *
 * By isolating these contracts in the domain layer, screens and components
 * interact with an abstract geospatial boundary without being coupled to a
 * specific map renderer SDK (e.g. MapLibre, Mapbox, or Google Maps).
 */

import { BoundingBox } from './offline';

/**
 * Camera viewport orientation and position.
 */
export interface MapCamera {
  center: {
    latitude: number;
    longitude: number;
  };
  zoom: number;            // Standard web mercator zoom level (0 - 22)
  bearingDegrees: number;  // Rotation in degrees (0 = North, 90 = East, 180 = South, 270 = West)
  pitchDegrees: number;    // Tilt in degrees (0 = Top-down 2D, 60 = 3D perspective)
}

/**
 * Network caching and fetch policy for geospatial tiles.
 * - 'online': Fetch from vector tile servers when available; fallback to cache.
 * - 'cache_only': Strictly read from local offline pack storage; no network requests.
 */
export type MapNetworkPolicy = 'online' | 'cache_only';

/**
 * Base map visual and availability states.
 * - 'loading': Tiles/elevation meshes are initializing.
 * - 'fresh': Active vector map rendered with valid up-to-date data.
 * - 'stale': Map data rendered from expired local cache.
 * - 'partial': Sector has partial vector coverage (missing boundaries).
 * - 'unavailable': No vector tiles or offline packs available for sector.
 * - 'error': Render failure (IO fault, corrupted tiles, or network failure).
 */
export type MapBaseState =
  | 'loading'
  | 'fresh'
  | 'stale'
  | 'partial'
  | 'unavailable'
  | 'error';

/**
 * Sector coverage metadata indicating whether missing boundaries exist.
 */
export interface MapCoverage {
  isCovered: boolean;
  missingAreaLabel?: string;
  missingAreaBounds?: BoundingBox;
}

/**
 * Legal and provenance metadata for map rendering.
 * Mandatory OpenStreetMap attribution must be displayed on every map state.
 */
export interface MapProvenance {
  source: string;
  sourceVersion: string;
  licence: string;
  attribution: string;
  freshUntil?: string;
}

/**
 * Complete immutable input required to render a map frame.
 */
export interface MapRenderInput {
  camera: MapCamera;
  networkPolicy: MapNetworkPolicy;
  baseState: MapBaseState;
  coverage?: MapCoverage;
  provenance: MapProvenance;
}
