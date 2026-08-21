/**
 * ============================================================================
 * TRIP PLANNER & ROUTE COMPARISON FIXTURES (R10)
 * ============================================================================
 *
 * WHY THIS EXISTS:
 * Pre-authored deterministic fixtures for local place search, 3-way route
 * candidate comparison (Curvy, Straight, Supercurvy), Terai/Permit restrictions,
 * and Nepal waypoint suggestions.
 */

import {
  PlannerPlace,
  PlannerWaypoint,
  PlannerRouteCandidate,
} from '../domain/tripPlanner';

/**
 * 1. Searchable Nepal Places Fixture Catalog
 */
export const nepalPlacesFixtureCatalog: PlannerPlace[] = [
  {
    id: 'place-ktm',
    name: 'Kathmandu',
    nameNepali: 'काठमाडौं',
    kind: 'origin',
    source: 'fixture_catalog',
    region: 'Bagmati Province',
  },
  {
    id: 'place-pkr',
    name: 'Pokhara',
    nameNepali: 'पोखरा',
    kind: 'destination',
    source: 'fixture_catalog',
    region: 'Gandaki Province',
  },
  {
    id: 'place-mustang',
    name: 'Lo Manthang (Upper Mustang)',
    nameNepali: 'लो मान्थाङ (मुस्ताङ)',
    kind: 'destination',
    source: 'fixture_catalog',
    region: 'Gandaki Province (Restricted Area)',
  },
  {
    id: 'place-biratnagar',
    name: 'Biratnagar',
    nameNepali: 'विराटनगर',
    kind: 'origin',
    source: 'fixture_catalog',
    region: 'Koshi Province (Terai)',
  },
  {
    id: 'place-janakpur',
    name: 'Janakpurdham',
    nameNepali: 'जनकपुरधाम',
    kind: 'destination',
    source: 'fixture_catalog',
    region: 'Madhesh Province (Terai)',
  },
  {
    id: 'place-chitwan',
    name: 'Sauraha (Chitwan)',
    nameNepali: 'सौराहा (चितवन)',
    kind: 'destination',
    source: 'fixture_catalog',
    region: 'Bagmati Province',
  },
  {
    id: 'place-besisahar',
    name: 'Besisahar (Annapurna Entry)',
    nameNepali: 'बेसीसहर',
    kind: 'waypoint',
    source: 'fixture_catalog',
    region: 'Gandaki Province',
  },
  {
    id: 'place-dhunche',
    name: 'Dhunche (Langtang)',
    nameNepali: 'धुन्चे (लाङटाङ)',
    kind: 'destination',
    source: 'fixture_catalog',
    region: 'Bagmati Province',
  },
  {
    id: 'place-manang',
    name: 'Manang Village',
    nameNepali: 'मनाङ',
    kind: 'destination',
    source: 'offline_fixture_catalog',
    region: 'Gandaki Province',
  },
];

/**
 * 2. Kathmandu -> Pokhara Candidates (All Available, Curvy Default)
 */
export const kathmanduToPokharaPlannerCandidates: PlannerRouteCandidate[] = [
  {
    id: 'candidate-ktm-pkr-curvy',
    profile: 'curvy',
    name: 'Curvy: Prithvi Highway & Old Ridge Bends',
    nameNepali: 'मध्यम घुमाउरो: पृथ्वी राजमार्ग',
    description: 'Balanced Himalayan curves, riverside corners, and scenic switchbacks.',
    distanceKm: 214,
    durationMinutes: 345, // 5h 45m
    curvinessScore: 7.8,
    bendsCount: 342,
    maxElevationMeters: 2480,
    surfaceSummary: '85% Paved Asphalt · 15% Mountain Gravel',
    hazardsCount: 2,
    fuelGapMaxKm: 48,
    availability: 'available',
    provenance: {
      sourceVersion: 'NP-ROUTING-2026.08.15',
      syntheticDisclosure: 'Synthetic Nepal road corridor estimate',
    },
  },
  {
    id: 'candidate-ktm-pkr-straight',
    profile: 'straight',
    name: 'Straight: Express Valley Corridor',
    nameNepali: 'सिधा: द्रुत मार्ग',
    description: 'Fastest highway transit following the Trishuli river plain.',
    distanceKm: 202,
    durationMinutes: 290, // 4h 50m
    curvinessScore: 4.2,
    bendsCount: 110,
    maxElevationMeters: 1420,
    surfaceSummary: '95% Paved Highway · 5% Bridge Transitions',
    hazardsCount: 1,
    fuelGapMaxKm: 32,
    availability: 'available',
    provenance: {
      sourceVersion: 'NP-ROUTING-2026.08.15',
      syntheticDisclosure: 'Synthetic Nepal road corridor estimate',
    },
  },
  {
    id: 'candidate-ktm-pkr-supercurvy',
    profile: 'supercurvy',
    name: 'Supercurvy: High Pass Mountain Route',
    nameNepali: 'अत्यन्त घुमाउरो: डाँडाको बाटो',
    description: 'Maximum twisties via Ranipauwa, Galchhi ridges, and high pass overlooks.',
    distanceKm: 248,
    durationMinutes: 430, // 7h 10m
    curvinessScore: 9.4,
    bendsCount: 520,
    maxElevationMeters: 2860,
    surfaceSummary: '60% Paved Asphalt · 40% Winding Broken Pavement',
    hazardsCount: 3,
    fuelGapMaxKm: 64,
    availability: 'available',
    provenance: {
      sourceVersion: 'NP-ROUTING-2026.08.15',
      syntheticDisclosure: 'Synthetic Nepal road corridor estimate',
    },
  },
];

/**
 * 3. Terai Corridor Candidates (Supercurvy Unavailable due to Flat Plains)
 */
export const teraiCorridorPlannerCandidates: PlannerRouteCandidate[] = [
  {
    id: 'candidate-terai-straight',
    profile: 'straight',
    name: 'Straight: East-West Mahendra Highway',
    nameNepali: 'सिधा: पूर्व-पश्चिम राजमार्ग',
    description: 'Direct paved highway transit across flat southern plains.',
    distanceKm: 180,
    durationMinutes: 220,
    curvinessScore: 1.8,
    bendsCount: 24,
    maxElevationMeters: 120,
    surfaceSummary: '98% Paved National Highway',
    hazardsCount: 0,
    fuelGapMaxKm: 25,
    availability: 'available',
    provenance: {
      sourceVersion: 'NP-ROUTING-2026.08.15',
      syntheticDisclosure: 'Synthetic Terai corridor estimate',
    },
  },
  {
    id: 'candidate-terai-curvy',
    profile: 'curvy',
    name: 'Curvy: Chure Foothill Bypass',
    nameNepali: 'मध्यम घुमाउरो: चुरे फेदी बाटो',
    description: 'Gentle winding roads following the low Siwalik hill foothills.',
    distanceKm: 195,
    durationMinutes: 260,
    curvinessScore: 4.5,
    bendsCount: 88,
    maxElevationMeters: 380,
    surfaceSummary: '75% Paved · 25% Rural Asphalt',
    hazardsCount: 1,
    fuelGapMaxKm: 42,
    availability: 'available',
    provenance: {
      sourceVersion: 'NP-ROUTING-2026.08.15',
      syntheticDisclosure: 'Synthetic Terai corridor estimate',
    },
  },
  {
    id: 'candidate-terai-supercurvy',
    profile: 'supercurvy',
    name: 'Supercurvy: High Mountain Twisties',
    nameNepali: 'अत्यन्त घुमाउरो (अनुपलब्ध)',
    description: 'Unavailable on flat plains. Terrain lacks sufficient elevation gradient.',
    distanceKm: 230,
    durationMinutes: 380,
    curvinessScore: 2.1,
    bendsCount: 30,
    maxElevationMeters: 210,
    surfaceSummary: '80% Paved Highway',
    hazardsCount: 0,
    fuelGapMaxKm: 50,
    availability: 'unavailable',
    restrictionReason: 'Not enough bends: Terai flat plains corridor has no mountain twisties',
    provenance: {
      sourceVersion: 'NP-ROUTING-2026.08.15',
      syntheticDisclosure: 'Synthetic Terai corridor estimate',
    },
  },
];

/**
 * 4. Upper Mustang Candidates (Supercurvy Restricted with RAP Permit Requirement)
 */
export const upperMustangPermitPlannerCandidates: PlannerRouteCandidate[] = [
  {
    id: 'candidate-mustang-curvy',
    profile: 'curvy',
    name: 'Curvy: Lower Mustang Kali Gandaki Valley',
    nameNepali: 'मध्यम घुमाउरो: कालीगण्डकी करिडोर',
    description: 'Gravel riverbed corridor up to Kagbeni with ACAP permit.',
    distanceKm: 185,
    durationMinutes: 360,
    curvinessScore: 6.8,
    bendsCount: 210,
    maxElevationMeters: 2800,
    surfaceSummary: '40% Paved · 60% Mountain Dirt & Water Crossings',
    hazardsCount: 3,
    fuelGapMaxKm: 75,
    availability: 'available',
    provenance: {
      sourceVersion: 'NP-ROUTING-2026.08.15',
      syntheticDisclosure: 'Synthetic Mustang corridor estimate',
    },
  },
  {
    id: 'candidate-mustang-straight',
    profile: 'straight',
    name: 'Straight: Kali Gandaki Highway Link',
    nameNepali: 'सिधा: बेनी-जोमसोम सडक',
    description: 'Direct valley river track through Tatopani and Marpha.',
    distanceKm: 165,
    durationMinutes: 320,
    curvinessScore: 5.2,
    bendsCount: 140,
    maxElevationMeters: 2720,
    surfaceSummary: '50% Paved · 50% Rocky Track',
    hazardsCount: 2,
    fuelGapMaxKm: 60,
    availability: 'available',
    provenance: {
      sourceVersion: 'NP-ROUTING-2026.08.15',
      syntheticDisclosure: 'Synthetic Mustang corridor estimate',
    },
  },
  {
    id: 'candidate-mustang-supercurvy',
    profile: 'supercurvy',
    name: 'Supercurvy: Lo Manthang Walled City Pass',
    nameNepali: 'अत्यन्त घुमाउरो: उपल्लो मुस्ताङ (अनुमति आवश्यक)',
    description: 'High altitude Himalayan plateau past Kagbeni to the ancient Tibetan kingdom.',
    distanceKm: 245,
    durationMinutes: 510,
    curvinessScore: 9.6,
    bendsCount: 460,
    maxElevationMeters: 3840,
    surfaceSummary: '10% Broken Pavement · 90% High Mountain Offroad',
    hazardsCount: 4,
    fuelGapMaxKm: 110,
    availability: 'restricted',
    restrictionReason: 'ACAP & Restricted Area Permit (RAP) mandatory north of Kagbeni checkpoint',
    permitRequired: {
      type: 'RAP ($500/10 days) + ACAP (NPR 3,000)',
      agency: 'Department of Immigration & NTNC Nepal',
      note: 'Requires minimum 2 riders accompanied by a registered Nepali guide.',
    },
    provenance: {
      sourceVersion: 'NP-ROUTING-2026.08.15',
      syntheticDisclosure: 'Synthetic Upper Mustang restricted area estimate',
    },
  },
];

/**
 * 5. Suggested Waypoints Catalog (Nepal Fuel, Food, Viewpoints, Permits)
 */
export const suggestedWaypointsCatalog: PlannerWaypoint[] = [
  {
    id: 'waypoint-kurintar-fuel',
    order: 1,
    category: 'fuel',
    state: 'suggested',
    place: {
      id: 'place-wp-kurintar',
      name: 'Kurintar High-Octane Fuel Checkpoint',
      nameNepali: 'कुरिनटार पेट्रोल पम्प',
      kind: 'suggested_stop',
      source: 'fixture_catalog',
      region: 'Chitwan/Prithvi Hwy',
    },
  },
  {
    id: 'waypoint-mugling-rest',
    order: 2,
    category: 'rest',
    state: 'suggested',
    place: {
      id: 'place-wp-mugling',
      name: 'Mugling Riverside Rider Hub',
      nameNepali: 'मुग्लिङ बजार',
      kind: 'suggested_stop',
      source: 'fixture_catalog',
      region: 'Trishuli-Marshyangdi Confluence',
    },
  },
  {
    id: 'waypoint-malekhu-food',
    order: 3,
    category: 'food',
    state: 'suggested',
    place: {
      id: 'place-wp-malekhu',
      name: 'Malekhu Local Highway Rest Stop',
      nameNepali: 'मलेखु माछा तथा खाना',
      kind: 'suggested_stop',
      source: 'fixture_catalog',
      region: 'Dhading',
    },
  },
  {
    id: 'waypoint-kagbeni-permit',
    order: 4,
    category: 'permit',
    state: 'suggested',
    place: {
      id: 'place-wp-kagbeni',
      name: 'Kagbeni Immigration & RAP Checkpoint',
      nameNepali: 'कागबेनी चेकपोष्ट',
      kind: 'suggested_stop',
      source: 'fixture_catalog',
      region: 'Mustang',
    },
  },
  {
    id: 'waypoint-sarangkot-view',
    order: 5,
    category: 'viewpoint',
    state: 'suggested',
    place: {
      id: 'place-wp-sarangkot',
      name: 'Sarangkot Annapurna Panorama Overlook',
      nameNepali: 'सराङकोट भ्युपोइन्ट',
      kind: 'suggested_stop',
      source: 'fixture_catalog',
      region: 'Pokhara Ridge',
    },
  },
];
