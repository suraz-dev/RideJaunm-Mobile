/**
 * ============================================================================
 * TRIP READINESS & SQUAD HANDOFF FIXTURES (R11)
 * ============================================================================
 *
 * WHY THIS EXISTS:
 * Pre-authored deterministic fixtures for squad member rosters, local planning
 * roles (Lead, Sweep, Rider), and 6-category pre-ride readiness facts.
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
    syntheticDisclosure: 'Synthetic Nepal road corridor estimate',
  },
  {
    id: 'readiness-offline-map',
    category: 'offline_map',
    state: 'attention',
    title: 'Offline Map Pack Advisory',
    titleNepali: 'अफलाइन नक्सा सल्लाह',
    detail: 'Rabin missing Annapurna sector offline map pack (84MB) for dead-zone transit.',
    sourceVersion: 'OSM-NP-2026.08.15',
    syntheticDisclosure: 'Pre-computed fixture pack metadata',
  },
  {
    id: 'readiness-permit',
    category: 'permit',
    state: 'attention',
    title: 'Conservation Area Permits (ACAP)',
    titleNepali: 'संरक्षण क्षेत्र अनुमतिपत्र',
    detail: 'Entry checkpoint at Besisahar requires stamped ACAP pass for mountain sectors.',
    sourceVersion: 'NTNC-PERMIT-2026.08',
    syntheticDisclosure: 'Static regulatory reference data',
  },
  {
    id: 'readiness-fuel',
    category: 'fuel',
    state: 'attention',
    title: 'Mountain Fuel Gap (48 km)',
    titleNepali: 'पेट्रोल पम्प दूरी सल्लाह',
    detail: '48km gap between Kurintar and Damauli. Top up high-octane fuel at Kurintar stop.',
    sourceVersion: 'NOC-FUEL-2026.08',
    syntheticDisclosure: 'Synthetic fuel station location index',
  },
  {
    id: 'readiness-weather',
    category: 'weather',
    state: 'unknown',
    title: 'Weather Baseline Advisory',
    titleNepali: 'मौसम पूर्वअनुमान सल्लाह',
    detail: 'Pre-authored synthetic monsoon baseline (24°C, 15mm/hr rain). Not live weather telemetry.',
    sourceVersion: 'SYNTHETIC-WEATHER-2026.08',
    syntheticDisclosure: 'Synthetic baseline fixture only (Not real-time weather)',
  },
  {
    id: 'readiness-safety',
    category: 'safety',
    state: 'ready',
    title: 'Emergency Contacts & Mesh Protocol',
    titleNepali: 'आपतकालीन सम्पर्क तथा मेस तयार',
    detail: 'In-case-of-emergency (ICE) contacts configured. BLE Mesh peer discovery armed.',
    sourceVersion: 'SAFETY-CONFIG-2026.08',
    syntheticDisclosure: 'Local device safety profile fixture',
  },
];
