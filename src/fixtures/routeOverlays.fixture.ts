/**
 * ============================================================================
 * NEPAL ROUTE OVERLAY & MARKER FIXTURES (R8)
 * ============================================================================
 *
 * WHY THIS EXISTS:
 * Deterministic synthetic route traces, markers, and detour overlays
 * for testing and simulator verification across all 7 route semantics.
 */

import { RouteLayerInput, MapMarker } from '../domain/mapOverlay';

const FIXTURE_PROVENANCE = {
  source: 'OpenStreetMap Vector Contours (Synthetic Fixture)',
  sourceVersion: 'OSM-NP-2026.08.15',
  freshUntil: '2026-11-15T00:00:00Z',
};

/**
 * 1. Curvy Route Trace (Kathmandu ➔ Pokhara via Prithvi Highway Bends)
 */
export const curvyRouteTraceFixture: RouteLayerInput = {
  id: 'route-trace-curvy-ktm-pkr',
  semantic: 'curvy',
  isSelected: true,
  label: 'Curvy (घुमाउरो)',
  labelNepali: 'घुमाउरो मार्ग (पृथ्वी राजमार्ग)',
  points: [
    { x: 18, y: 78 }, // Kathmandu
    { x: 28, y: 64 }, // Naubise
    { x: 38, y: 58 }, // Galchhi
    { x: 50, y: 50 }, // Mugling
    { x: 62, y: 44 }, // Dumre
    { x: 74, y: 38 }, // Damauli
    { x: 84, y: 28 }, // Pokhara
  ],
  provenance: FIXTURE_PROVENANCE,
};

/**
 * 2. Supercurvy Route Trace (Kathmandu ➔ Pokhara High-Ridge Adventure)
 */
export const supercurvyRouteTraceFixture: RouteLayerInput = {
  id: 'route-trace-supercurvy-ktm-pkr',
  semantic: 'supercurvy',
  isSelected: true,
  label: 'Supercurvy (अत्यन्त घुमाउरो)',
  labelNepali: 'अत्यन्त घुमाउरो मार्ग (डाँडाकाँडा)',
  points: [
    { x: 18, y: 78 }, // Kathmandu
    { x: 24, y: 52 }, // Kakani Ridge
    { x: 34, y: 42 }, // Trishuli Valley
    { x: 48, y: 34 }, // Gorkha Foothills
    { x: 66, y: 28 }, // Besisahar Junction
    { x: 84, y: 28 }, // Pokhara
  ],
  provenance: FIXTURE_PROVENANCE,
};

/**
 * 3. Straight Route Trace (Fastest Highway Corridor)
 */
export const straightRouteTraceFixture: RouteLayerInput = {
  id: 'route-trace-straight-ktm-pkr',
  semantic: 'straight',
  isSelected: false,
  label: 'Straight (सिधा)',
  labelNepali: 'सिधा द्रुतमार्ग',
  points: [
    { x: 18, y: 78 },
    { x: 40, y: 60 },
    { x: 62, y: 42 },
    { x: 84, y: 28 },
  ],
  provenance: FIXTURE_PROVENANCE,
};

/**
 * 4. Alternative Route Trace (Bypass Corridor)
 */
export const alternativeRouteTraceFixture: RouteLayerInput = {
  id: 'route-trace-alternative-ktm-pkr',
  semantic: 'alternative',
  isSelected: false,
  label: 'Alternative (वैकल्पिक)',
  labelNepali: 'वैकल्पिक सहायक मार्ग',
  points: [
    { x: 18, y: 78 },
    { x: 26, y: 72 },
    { x: 42, y: 68 },
    { x: 60, y: 52 },
    { x: 84, y: 28 },
  ],
  provenance: FIXTURE_PROVENANCE,
};

/**
 * 5. Hazard & Detour Trace (Kurintar Landslide Sector)
 */
export const hazardDetourTraceFixture: RouteLayerInput = {
  id: 'route-trace-hazard-kurintar',
  semantic: 'hazard',
  isSelected: false,
  label: 'Hazard Detour (पहिरो घुम्ती)',
  labelNepali: 'पहिरो क्षेत्र डाइभर्सन',
  points: [
    { x: 46, y: 53 },
    { x: 50, y: 50 },
    { x: 54, y: 47 },
  ],
  provenance: FIXTURE_PROVENANCE,
};

/**
 * 6. Lost / Off-Route Segment Fixture
 */
export const lostRouteTraceFixture: RouteLayerInput = {
  id: 'route-trace-lost-dead-reckoning',
  semantic: 'lost',
  isSelected: false,
  label: 'Off-Route (मार्ग विच्छेद)',
  labelNepali: 'अफ-रुट अनुगमन',
  points: [
    { x: 50, y: 50 },
    { x: 55, y: 60 },
    { x: 58, y: 70 },
  ],
  provenance: FIXTURE_PROVENANCE,
};

/**
 * 7. Terai Restricted Supercurvy Fixture
 * Supercurvy is disabled on flat plains of Mahendra Highway.
 */
export const teraiRestrictedRouteFixture: RouteLayerInput = {
  id: 'route-trace-terai-highway',
  semantic: 'supercurvy',
  isSelected: false,
  label: 'Supercurvy Unavailable',
  labelNepali: 'सुपरकर्भी अनुपलब्ध (तराई फाँट)',
  restrictionReason: 'Supercurvy disabled: Terai flat corridor has no mountain bends',
  points: [
    { x: 10, y: 85 },
    { x: 50, y: 85 },
    { x: 90, y: 85 },
  ],
  provenance: FIXTURE_PROVENANCE,
};

/**
 * Nepal Map Markers (Origin, Destination, Waypoint, Hazard)
 * Hazard marker uses warning/danger amber, NEVER SOS red.
 */
export const nepalMapMarkersFixture: MapMarker[] = [
  {
    id: 'marker-origin-ktm',
    kind: 'origin',
    position: { x: 18, y: 78 },
    label: 'Kathmandu (Koteshwor)',
    labelNepali: 'कोटेश्वर, काठमाडौँ',
    description: 'Start Point · 1,350m ASL',
  },
  {
    id: 'marker-waypoint-mugling',
    kind: 'waypoint',
    position: { x: 50, y: 50 },
    label: 'Mugling Junction',
    labelNepali: 'मुग्लिन दोबाटो',
    description: 'Waypoint · Trishuli River Confluence',
  },
  {
    id: 'marker-hazard-kurintar',
    kind: 'hazard',
    position: { x: 50, y: 50 },
    label: 'Kurintar Landslide Risk',
    labelNepali: 'पहिरो जोखिम (कुरिनटार)',
    description: 'Monsoon debris on active bend · Caution advised',
    severity: 'moderate',
  },
  {
    id: 'marker-destination-pkr',
    kind: 'destination',
    position: { x: 84, y: 28 },
    label: 'Pokhara (Lakeside)',
    labelNepali: 'लेकसाइड, पोखरा',
    description: 'Destination · 820m ASL',
  },
];
