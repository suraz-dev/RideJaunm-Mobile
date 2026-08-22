/**
 * ============================================================================
 * TRIP READINESS & SQUAD HANDOFF FIXTURES (R11)
 * ============================================================================
 *
 * WHY THIS EXISTS:
 * Pre-authored deterministic fixtures for squad member rosters, local planning
 * roles (Lead, Sweep, Rider), and 6-category pre-ride readiness facts.
 *
 * TRUTHFULNESS & SAFETY RULES:
 * 1. Never imply live invitations, messages, or confirmations.
 * 2. Never present permit rules as legally current or validated.
 * 3. Never claim verified native mesh networking capability.
 * 4. Never use SOS Red (#FF1F3D) for ordinary readiness states.
 */

import {
  FixtureSquadMember,
  FixtureTripReadinessItem,
} from '../domain/tripReadiness';

/**
 * 1. Pre-Authored Squad Members Fixture
 */
export const fixtureSquadMembers: FixtureSquadMember[] = [
  {
    id: 'squad-member-bikash',
    displayName: 'Bikash Shrestha',
    displayNameNepali: 'बिकाश श्रेष्ठ (Lead)',
    role: 'lead',
    inviteState: 'preview_ready',
    offlineMapState: 'ready',
    permitState: 'ready',
    fuelState: 'ready',
    emergencyContactState: 'ready',
    source: 'fixture',
  },
  {
    id: 'squad-member-rabin',
    displayName: 'Rabin Gurung',
    displayNameNepali: 'रबिन गुरुङ (Sweep)',
    role: 'sweep',
    inviteState: 'preview_ready',
    offlineMapState: 'attention',
    permitState: 'ready',
    fuelState: 'ready',
    emergencyContactState: 'ready',
    source: 'fixture',
  },
  {
    id: 'squad-member-suraj',
    displayName: 'Suraj Shrestha (You)',
    displayNameNepali: 'सुरज श्रेष्ठ (तपाईं)',
    role: 'rider',
    inviteState: 'preview_ready',
    offlineMapState: 'ready',
    permitState: 'ready',
    fuelState: 'ready',
    emergencyContactState: 'ready',
    source: 'fixture',
  },
  {
    id: 'squad-member-anish',
    displayName: 'Anish Thapa',
    displayNameNepali: 'अनिश थापा',
    role: 'rider',
    inviteState: 'not_invited',
    offlineMapState: 'unknown',
    permitState: 'attention',
    fuelState: 'ready',
    emergencyContactState: 'unknown',
    source: 'fixture',
  },
];

/**
 * 2. Pre-Authored 6-Category Trip Readiness Checklist
 */
export const fixtureTripReadinessChecklist: FixtureTripReadinessItem[] = [
  {
    id: 'readiness-route',
    category: 'route',
    state: 'ready',
    title: 'Route Candidate Armed',
    titleNepali: 'मार्ग चयन सम्पन्न',
    detail: 'Kathmandu → Pokhara Curvy route (214 KM · 5h 45m · 342 bends) selected.',
    sourceVersion: 'NP-ROUTING-2026.08.15',
    syntheticDisclosure: 'Local road corridor estimate',
  },
  {
    id: 'readiness-offline-map',
    category: 'offline_map',
    state: 'attention',
    title: 'Offline Map Pack Advisory',
    titleNepali: 'अफलाइन नक्सा सल्लाह',
    detail: 'Rabin missing Annapurna sector offline map pack (84MB) for dead-zone transit.',
    sourceVersion: 'OSM-NP-2026.08.15',
    syntheticDisclosure: 'Local pack metadata',
  },
  {
    id: 'readiness-permit',
    category: 'permit',
    state: 'attention',
    title: 'Conservation Area Permit Notice',
    titleNepali: 'संरक्षण क्षेत्र अनुमतिपत्र सूचना',
    detail: 'Advisory for ACAP Besisahar checkpoint. Requirements are not legally validated in this preview; riders must verify current entry rules with local authorities prior to travel.',
    sourceVersion: 'NTNC-PERMIT-2026.08',
    syntheticDisclosure: 'Regulatory reference data (Verify with NTNC/Immigration authorities)',
  },
  {
    id: 'readiness-fuel',
    category: 'fuel',
    state: 'attention',
    title: 'Mountain Fuel Gap (48 km)',
    titleNepali: 'पेट्रोल पम्प दूरी सल्लाह',
    detail: '48km gap between Kurintar and Damauli. Top up high-octane fuel at Kurintar stop.',
    sourceVersion: 'NOC-FUEL-2026.08',
    syntheticDisclosure: 'Fuel station location index',
  },
  {
    id: 'readiness-weather',
    category: 'weather',
    state: 'unknown',
    title: 'Weather Baseline Advisory',
    titleNepali: 'मौसम पूर्वअनुमान सल्लाह',
    detail: 'Monsoon baseline forecast (24°C, 15mm/hr rain). Not live weather telemetry.',
    sourceVersion: 'SYNTHETIC-WEATHER-2026.08',
    syntheticDisclosure: 'Baseline mountain forecast (Not real-time telemetry)',
  },
  {
    id: 'readiness-safety',
    category: 'safety',
    state: 'ready',
    title: 'Emergency Profile & Mesh Advisory',
    titleNepali: 'आपतकालीन सम्पर्क तथा मेस सल्लाह',
    detail: 'In-case-of-emergency (ICE) contact configured locally. Native BLE mesh protocol is unverified in this fixture preview.',
    sourceVersion: 'SAFETY-CONFIG-2026.08',
    syntheticDisclosure: 'Local safety profile (Native mesh discovery unverified)',
  },
];
