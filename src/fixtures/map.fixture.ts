/**
 * ============================================================================
 * DETERMINISTIC GEOSPATIAL MAP FIXTURES (R7)
 * ============================================================================
 *
 * WHY THIS EXISTS:
 * Provides deterministic, synthetic map render inputs for unit testing
 * and simulator visual verification across all required base states:
 * - Fresh synthetic vector terrain rendering
 * - Stale offline cache simulation
 * - Partial mountain pass coverage simulation
 * - Loading fixture state
 * - Unavailable sector simulation
 * - Deterministic render error with retry simulation
 * - Cache-only policy with uncached sector simulation
 *
 * SCOPE & TRUTHFULNESS:
 * All fixtures are purely synthetic test inputs. They make no network calls,
 * do not import third-party map SDKs, and do not claim live cellular downloading.
 */

import { MapRenderInput } from '../domain/map';

const OSM_PROVENANCE = {
  source: 'OpenStreetMap Vector Contours (Synthetic Fixture)',
  sourceVersion: 'OSM-NP-2026.08.15',
  licence: 'Open Database Licence (ODbL) 1.0',
  attribution: '© OpenStreetMap contributors',
  freshUntil: '2026-11-15T00:00:00Z',
};

/**
 * 1. Fresh Vector Map Fixture (Kathmandu Valley & Koteshwor Corridor)
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
 * 2. Stale Cache-Only Vector Map Fixture (Annapurna / Mustang Circuit)
 * Demonstrates expired synthetic cache state (dated 2026-05-10).
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
    freshUntil: '2026-08-10T00:00:00Z',
  },
};

/**
 * 3. Partial Coverage Map Fixture (Manang Valley with Uncached High Pass)
 * Demonstrates synthetic missing sector boundary for Thorong La High Pass.
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
 * 4. Loading State Fixture
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
 * 5. Unavailable Sector Fixture (Upper Dolpa Corridor Simulation)
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
 * 6. Deterministic Error State Fixture
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
 * 7. Cache-Only Policy with Uncached Map Sector Fixture
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
