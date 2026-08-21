/**
 * ============================================================================
 * DETERMINISTIC GEOSPATIAL MAP FIXTURES (R7)
 * ============================================================================
 *
 * WHY THIS EXISTS:
 * Provides deterministic map render inputs for unit testing and simulator
 * visual verification across all required base states:
 * - Fresh online vector rendering
 * - Stale offline cache disclosure
 * - Partial mountain pass coverage
 * - Loading tile state
 * - Unavailable offline sector
 * - Render error with retry
 * - Cache-only uncached sector
 */

import { MapRenderInput } from '../domain/map';

const OSM_PROVENANCE = {
  source: 'OpenStreetMap Vector Contours v4.2',
  sourceVersion: 'OSM-NP-2026.08.15',
  licence: 'Open Database Licence (ODbL) 1.0',
  attribution: '© OpenStreetMap contributors',
  freshUntil: '2026-11-15T00:00:00Z',
};

/**
 * 1. Fresh Online Vector Map (Kathmandu Valley & Koteshwor Corridor)
 */
export const mapFreshKathmanduFixture: MapRenderInput = {
  camera: {
    center: { latitude: 27.6775, longitude: 85.3486 },
    zoom: 12.5,
    bearingDegrees: 45,
    pitchDegrees: 0,
  },
  networkPolicy: 'online',
  baseState: 'fresh',
  coverage: {
    isCovered: true,
  },
  provenance: OSM_PROVENANCE,
};

/**
 * 2. Stale Cache-Only Vector Map (Annapurna / Mustang Circuit)
 * Cached 90 days ago; expired on 2026-08-10.
 */
export const mapStaleMustangFixture: MapRenderInput = {
  camera: {
    center: { latitude: 28.7845, longitude: 83.8567 },
    zoom: 11.0,
    bearingDegrees: 12,
    pitchDegrees: 30,
  },
  networkPolicy: 'cache_only',
  baseState: 'stale',
  coverage: {
    isCovered: true,
  },
  provenance: {
    ...OSM_PROVENANCE,
    sourceVersion: 'OSM-NP-2026.05.10',
    freshUntil: '2026-08-10T00:00:00Z', // Expired
  },
};

/**
 * 3. Partial Coverage Map (Manang Valley with Uncached High Pass)
 * Base valley tiles are available; Thorong La High Pass is missing from local cache.
 */
export const mapPartialManangFixture: MapRenderInput = {
  camera: {
    center: { latitude: 28.6650, longitude: 84.0200 },
    zoom: 13.0,
    bearingDegrees: 315,
    pitchDegrees: 45,
  },
  networkPolicy: 'cache_only',
  baseState: 'partial',
  coverage: {
    isCovered: false,
    missingAreaLabel: 'Thorong La Pass & High Camp (Above 4,800m ASL)',
    missingAreaBounds: {
      minLng: 83.90,
      minLat: 28.75,
      maxLng: 84.05,
      maxLat: 28.85,
    },
  },
  provenance: OSM_PROVENANCE,
};

/**
 * 4. Loading State
 */
export const mapLoadingFixture: MapRenderInput = {
  camera: {
    center: { latitude: 27.7172, longitude: 85.3240 },
    zoom: 10.0,
    bearingDegrees: 0,
    pitchDegrees: 0,
  },
  networkPolicy: 'online',
  baseState: 'loading',
  coverage: {
    isCovered: true,
  },
  provenance: OSM_PROVENANCE,
};

/**
 * 5. Unavailable Sector (Upper Dolpa Dead Zone with No Local Cache)
 */
export const mapUnavailableDolpaFixture: MapRenderInput = {
  camera: {
    center: { latitude: 29.1500, longitude: 83.1000 },
    zoom: 10.5,
    bearingDegrees: 0,
    pitchDegrees: 0,
  },
  networkPolicy: 'cache_only',
  baseState: 'unavailable',
  coverage: {
    isCovered: false,
    missingAreaLabel: 'Upper Dolpa & Shey Phoksundo Corridor',
  },
  provenance: OSM_PROVENANCE,
};

/**
 * 6. Error State (Storage Fault / Corrupt Vector Tiles)
 */
export const mapErrorFixture: MapRenderInput = {
  camera: {
    center: { latitude: 27.6775, longitude: 85.3486 },
    zoom: 12.0,
    bearingDegrees: 0,
    pitchDegrees: 0,
  },
  networkPolicy: 'online',
  baseState: 'error',
  provenance: OSM_PROVENANCE,
};

/**
 * 7. Cache-Only Policy with Uncached Map Sector
 */
export const mapCacheOnlyUncachedFixture: MapRenderInput = {
  camera: {
    center: { latitude: 28.0000, longitude: 84.5000 },
    zoom: 11.0,
    bearingDegrees: 0,
    pitchDegrees: 0,
  },
  networkPolicy: 'cache_only',
  baseState: 'unavailable',
  coverage: {
    isCovered: false,
    missingAreaLabel: 'Gorkha - Manaslu Trekking Corridor',
  },
  provenance: OSM_PROVENANCE,
};

export const allMapFixtures = [
  mapFreshKathmanduFixture,
  mapStaleMustangFixture,
  mapPartialManangFixture,
  mapLoadingFixture,
  mapUnavailableDolpaFixture,
  mapErrorFixture,
  mapCacheOnlyUncachedFixture,
];
