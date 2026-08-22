/**
 * ============================================================================
 * PROFILE, GARAGE, HISTORY, AND SETTINGS STABLE FIXTURES (R14)
 * ============================================================================
 *
 * Scope boundary:
 * Deterministic pre-authored fixture data for rider identity, motorcycle fleet,
 * ride history records, and preview preferences.
 *
 * TRUTH INVARIANTS:
 * 1. Zero dynamic timestamps or IDs generated at render time.
 * 2. Every entry carries synthetic disclosure and source version.
 * 3. Never claims real phone numbers, real vehicle registrations, or GPS-recorded rides.
 */

import {
  FixtureRiderProfile,
  FixtureMotorcycle,
  FixtureRideHistoryItem,
  FixturePreferencePreview,
} from '../domain/profileSettings';

export const primaryRiderProfileFixture: FixtureRiderProfile = {
  riderId: 'rider-suraz-01',
  callsign: 'Kaza Wanderer',
  callsignNepali: 'काजा घुमन्ते',
  callsignHindi: 'काज़ा घुमक्कड़',
  fullName: 'Suraj Shrestha',
  fullNameNepali: 'सुरज श्रेष्ठ',
  fullNameHindi: 'सूरज श्रेष्ठ',
  bloodGroup: 'O+',
  emergencyContactSynthetic: '+977-9800000000 (Synthetic Fixture)',
  bio: 'Dual-sport Himalayan adventure rider exploring high passes, switchback ridges, and remote dead-zone trails across Nepal.',
  bioNepali: 'नेपालका उच्च हिमाली भञ्ज्याङहरू, घुम्ती रिजहरू र दुर्गम अफलाइन ट्रेलहरू अन्वेषण गर्ने एड्भेन्चर राइडर।',
  bioHindi: 'नेपाल के ऊंचे हिमालयी दर्रों, घुमावदार रिज और दूरदराज के ऑफलाइन ट्रेल्स की खोज करने वाला एडवेंचर राइडर।',
  totalRidesCount: 48,
  totalDistanceKm: 4820,
  elevationGainMeters: 38400,
  highPassesCrossedCount: 6,
  badges: [
    {
      id: 'badge-himalayan-explorer',
      name: 'Himalayan Explorer',
      nameNepali: 'हिमालयन अन्वेषक',
      nameHindi: 'हिमालयन खोजकर्ता',
      description: 'Crossed 5+ mountain passes above 3,500m.',
      icon: '🏔️',
      unlockedDateAd: '2026-08-02',
      unlockedDateBs: '2083-04-18',
    },
    {
      id: 'badge-supercurvy-master',
      name: 'Supercurvy Master',
      nameNepali: 'सुपर-कर्भी उस्ताद',
      nameHindi: 'सुपर-कर्व्ही मास्टर',
      description: 'Completed 500+ km of high-twistiness mountain routes.',
      icon: '🏍️',
      unlockedDateAd: '2026-08-10',
      unlockedDateBs: '2083-04-26',
    },
    {
      id: 'badge-deadzone-veteran',
      name: 'Dead-Zone Veteran',
      nameNepali: 'डेड-जोन भेट्रान',
      nameHindi: 'डेड-ज़ोन वेटरन',
      description: 'Navigated 10+ hours completely offline with local vector packs.',
      icon: '📡',
      unlockedDateAd: '2026-07-28',
      unlockedDateBs: '2083-04-13',
    },
  ],
  sourceVersion: 'NP-PROFILE-2026.08.15',
  syntheticDisclosure: 'Local profile preview · Offline rider instrument',
};

export const allFixtureMotorcycles: FixtureMotorcycle[] = [
  {
    id: 'moto-re-450',
    makeModel: 'Royal Enfield Himalayan 450',
    licensePlateSynthetic: 'BA 02 PA 4821',
    colorName: 'Kaza Brown',
    displacementCc: 452,
    fuelCapacityLiters: 17.0,
    estimatedFuelLevelPercent: 75,
    maintenanceState: 'good',
    odometerKm: 4820,
    lastServiceDateAd: '2026-07-20',
    lastServiceDateBs: '2083-04-04',
    notes: 'Fresh fork oil, heavy-duty aluminum bash plate installed.',
    sourceVersion: 'NP-GARAGE-2026.08.15',
    syntheticDisclosure: 'Local vehicle profile · Fleet maintained offline',
  },
  {
    id: 'moto-ktm-390',
    makeModel: 'KTM 390 Adventure',
    licensePlateSynthetic: 'BA 04 PA 9912',
    colorName: 'Factory Orange',
    displacementCc: 373,
    fuelCapacityLiters: 14.5,
    estimatedFuelLevelPercent: 40,
    maintenanceState: 'stale_unknown',
    odometerKm: 12400,
    lastServiceDateAd: '2025-11-10',
    lastServiceDateBs: '2082-07-24',
    notes: 'Maintenance interval overdue · Stale fixture estimate.',
    sourceVersion: 'NP-GARAGE-2026.08.15',
    syntheticDisclosure: 'Local vehicle profile · Maintenance service due',
  },
];

export const allFixtureRideHistory: FixtureRideHistoryItem[] = [
  {
    id: 'ride-hist-01',
    title: 'Kathmandu to Pokhara Ridge Run',
    titleNepali: 'काठमाडौंदेखि पोखरा रिज यात्रा',
    titleHindi: 'काठमांडू से पोखरा रिज यात्रा',
    startLocation: 'Kathmandu Valley',
    endLocation: 'Pokhara Lakeside',
    dateAd: '2026-08-10',
    dateBs: '2083-04-26',
    distanceKm: 204,
    durationHours: 6.2,
    elevationGainM: 2100,
    routeMode: 'curvy',
    state: 'cached',
    sourceVersion: 'NP-HISTORY-2026.08.15',
    syntheticDisclosure: 'Local ride record · Completed ride cache',
  },
  {
    id: 'ride-hist-02',
    title: 'Upper Mustang Thorong High Pass Exploration',
    titleNepali: 'माथिल्लो मुस्ताङ थोराङ भञ्ज्याङ अन्वेषण',
    titleHindi: 'अपर मुस्तांग थोरोंग दर्रा अन्वेषण',
    startLocation: 'Kagbeni',
    endLocation: 'Lo Manthang',
    dateAd: '2026-08-02',
    dateBs: '2083-04-18',
    distanceKm: 62,
    durationHours: 4.5,
    elevationGainM: 3200,
    routeMode: 'supercurvy',
    state: 'cached',
    sourceVersion: 'NP-HISTORY-2026.08.15',
    syntheticDisclosure: 'Local ride record · Completed ride cache',
  },
  {
    id: 'ride-hist-03',
    title: 'BP Highway Sindhuli Twisties',
    titleNepali: 'बीपी राजमार्ग सिन्धुली घुम्ती यात्रा',
    titleHindi: 'बीपी हाईवे सिंधुली मोड़ यात्रा',
    startLocation: 'Dhulikhel',
    endLocation: 'Bardibas',
    dateAd: '2026-07-15',
    dateBs: '2083-03-31',
    distanceKm: 158,
    durationHours: 4.0,
    elevationGainM: 1450,
    routeMode: 'supercurvy',
    state: 'stale',
    sourceVersion: 'NP-HISTORY-2026.08.15',
    syntheticDisclosure: 'Local ride record · Archived route history',
  },
];

export const defaultPreferencePreviewFixture: FixturePreferencePreview = {
  language: 'en',
  calendarSystem: 'AD',
  unitSystem: 'metric',
  dataSaver: false,
  isUnsavedPreview: true,
  sourceVersion: 'NP-SETTINGS-2026.08.15',
  syntheticDisclosure: 'Local preview preferences · Changes are not saved to persistent storage',
};
