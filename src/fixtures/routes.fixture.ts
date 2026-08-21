import { RouteCandidate } from '../domain/route';

export const kathmanduToPokharaCurvy: RouteCandidate = {
  id: 'route-ktm-pkr-curvy',
  profile: 'curvy',
  title: 'Kathmandu to Pokhara via BP Highway',
  titleNepali: 'काठमाडौं देखि पोखरा (बीपी राजमार्ग)',
  origin: {
    name: 'Kathmandu (Koteshwor)',
    nameNepali: 'काठमाडौं (कोटेश्वर)',
    coordinates: [85.3486, 27.6775],
  },
  destination: {
    name: 'Pokhara (Lakeside)',
    nameNepali: 'पोखरा (लेकसाइड)',
    coordinates: [83.9575, 28.2096],
  },
  distanceMeters: 214000,
  durationSeconds: 20700, // 5h 45m
  elevationGainMeters: 3120,
  maxAltitudeMeters: 2480,
  curvinessScore: 7.8,
  surfaceBreakdown: {
    pavedPercentage: 82,
    unpavedPercentage: 12,
    roughGravelPercentage: 6,
  },
  hazards: [
    {
      id: 'hazard-mugling-mud',
      type: 'monsoon_mud',
      locationName: 'Mugling - Kurintar Sector',
      coordinates: [84.552, 27.859],
      severity: 'moderate',
      description: 'Recent mud wash over tarmac after overnight rain.',
      activeMonsoonClosure: false,
      reportedAtUtc: '2026-08-20T16:30:00Z',
    },
    {
      id: 'hazard-dumre-fuel',
      type: 'fuel_gap',
      locationName: 'Dumre to Besisahar Link',
      coordinates: [84.412, 28.021],
      severity: 'low',
      description: '48 km without verified 95+ octane petrol pumps.',
      activeMonsoonClosure: false,
      reportedAtUtc: '2026-08-20T12:00:00Z',
    },
  ],
  isSupercurvyRestrictedInTerai: false,
  isPassableUnderMonsoon: true,
  provenance: 'OSRM_VALHALLA_NEPAL_GRAPH_V1',
  freshnessTimestampUtc: '2026-08-20T17:00:00Z',
};

export const kathmanduToPokharaSupercurvy: RouteCandidate = {
  id: 'route-ktm-pkr-supercurvy',
  profile: 'supercurvy',
  title: 'Kathmandu to Pokhara via Besisahar & Ridge Passes',
  titleNepali: 'काठमाडौं देखि पोखरा (बेसीशहर डाँडा मार्ग)',
  origin: {
    name: 'Kathmandu (Balaju)',
    nameNepali: 'काठमाडौं (बालाजु)',
    coordinates: [85.3012, 27.7345],
  },
  destination: {
    name: 'Pokhara (Sarangkot)',
    nameNepali: 'पोखरा (सराङकोट)',
    coordinates: [83.9482, 28.2435],
  },
  distanceMeters: 246000,
  durationSeconds: 27000, // 7h 30m
  elevationGainMeters: 4890,
  maxAltitudeMeters: 2890,
  curvinessScore: 9.4,
  surfaceBreakdown: {
    pavedPercentage: 48,
    unpavedPercentage: 34,
    roughGravelPercentage: 18,
  },
  hazards: [
    {
      id: 'hazard-ridge-gravel',
      type: 'unpaved_gravel',
      locationName: 'Gorkha Ridge Climb',
      coordinates: [84.628, 28.005],
      severity: 'high',
      description: 'Loose shale and sharp hairpins. Adventure tyres required.',
      activeMonsoonClosure: false,
      reportedAtUtc: '2026-08-20T14:15:00Z',
    },
  ],
  isSupercurvyRestrictedInTerai: false,
  isPassableUnderMonsoon: true,
  provenance: 'OSRM_VALHALLA_NEPAL_GRAPH_V1',
  freshnessTimestampUtc: '2026-08-20T17:00:00Z',
};

export const kathmanduToPokharaStraight: RouteCandidate = {
  id: 'route-ktm-pkr-straight',
  profile: 'straight',
  title: 'Kathmandu to Pokhara via Prithvi Highway',
  titleNepali: 'काठमाडौं देखि पोखरा (पृथ्वी राजमार्ग)',
  origin: {
    name: 'Kathmandu (Thankot)',
    nameNepali: 'काठमाडौं (थानकोट)',
    coordinates: [85.2034, 27.6892],
  },
  destination: {
    name: 'Pokhara (Prithvi Chowk)',
    nameNepali: 'पोखरा (पृथ्वी चोक)',
    coordinates: [83.9856, 28.2091],
  },
  distanceMeters: 200000,
  durationSeconds: 19800, // 5h 30m
  elevationGainMeters: 2100,
  maxAltitudeMeters: 1540,
  curvinessScore: 4.2,
  surfaceBreakdown: {
    pavedPercentage: 94,
    unpavedPercentage: 6,
    roughGravelPercentage: 0,
  },
  hazards: [],
  isSupercurvyRestrictedInTerai: false,
  isPassableUnderMonsoon: true,
  provenance: 'OSRM_VALHALLA_NEPAL_GRAPH_V1',
  freshnessTimestampUtc: '2026-08-20T17:00:00Z',
};

export const teraiHighwayStraight: RouteCandidate = {
  id: 'route-terai-mahendra-straight',
  profile: 'straight',
  title: 'Narayanghat to Butwal (Mahendra Highway)',
  titleNepali: 'नारायणघाट देखि बुटवल (महेन्द्र राजमार्ग)',
  origin: {
    name: 'Narayanghat',
    nameNepali: 'नारायणघाट',
    coordinates: [84.4286, 27.6938],
  },
  destination: {
    name: 'Butwal',
    nameNepali: 'बुटवल',
    coordinates: [83.4654, 27.7006],
  },
  distanceMeters: 114000,
  durationSeconds: 9000, // 2h 30m
  elevationGainMeters: 180,
  maxAltitudeMeters: 240,
  curvinessScore: 1.8,
  surfaceBreakdown: {
    pavedPercentage: 98,
    unpavedPercentage: 2,
    roughGravelPercentage: 0,
  },
  hazards: [],
  isSupercurvyRestrictedInTerai: true, // Supercurvy mode disabled in flat plains
  isPassableUnderMonsoon: true,
  provenance: 'OSRM_VALHALLA_NEPAL_GRAPH_V1',
  freshnessTimestampUtc: '2026-08-20T17:00:00Z',
};
