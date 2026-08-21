import { OfflineRegion } from '../domain/offline';

export const mustangCircuitRegion: OfflineRegion = {
  id: 'pack-mustang-circuit-v1',
  name: 'Annapurna & Mustang Circuit',
  nameNepali: 'अन्नपूर्ण तथा मुस्ताङ क्षेत्र',
  description: 'Includes Jomsom, Kagbeni, Lo Manthang, Thorong La pass with 3D elevation and heli landing points.',
  sizeBytes: 228589568, // 218 MB
  downloadedBytes: 228589568,
  progressPercentage: 100,
  lifecycle: 'complete',
  zoomMin: 6,
  zoomMax: 15,
  bounds: {
    minLng: 83.45,
    minLat: 28.40,
    maxLng: 84.15,
    maxLat: 29.35,
  },
  checksumSha256: '9a8f2c3d4e5f60718293a4b5c6d7e8f901a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6',
  includes3dElevation: true,
  includesHeliLandingZones: true,
  lastUpdatedUtc: '2026-08-10T04:00:00Z',
  expiryUtc: '2026-11-10T04:00:00Z',
};

export const bagmatiNarayaniRegion: OfflineRegion = {
  id: 'pack-bagmati-narayani-v1',
  name: 'Bagmati & Narayani Zone',
  nameNepali: 'बागमती तथा नारायणी क्षेत्र',
  description: 'Kathmandu Valley, Dhulikhel, BP Highway, Hetauda, Narayanghat high-density vector map.',
  sizeBytes: 148897792, // 142 MB
  downloadedBytes: 148897792,
  progressPercentage: 100,
  lifecycle: 'complete',
  zoomMin: 6,
  zoomMax: 16,
  bounds: {
    minLng: 84.30,
    minLat: 27.20,
    maxLng: 85.90,
    maxLat: 28.10,
  },
  checksumSha256: '1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
  includes3dElevation: true,
  includesHeliLandingZones: true,
  lastUpdatedUtc: '2026-08-12T06:30:00Z',
  expiryUtc: '2026-11-12T06:30:00Z',
};

export const everestRegionDownloading: OfflineRegion = {
  id: 'pack-everest-khumbu-v1',
  name: 'Solukhumbu & Everest Base Trail',
  nameNepali: 'सोलुखुम्बु तथा सगरमाथा मार्ग',
  description: 'Jiri, Salleri, Lukla, Namche high mountain pack.',
  sizeBytes: 188743680, // 180 MB
  downloadedBytes: 84934656,  // ~45%
  progressPercentage: 45,
  lifecycle: 'downloading',
  zoomMin: 6,
  zoomMax: 15,
  bounds: {
    minLng: 86.40,
    minLat: 27.40,
    maxLng: 87.10,
    maxLat: 28.10,
  },
  checksumSha256: 'b4c5d6e7f8a90123456789abcdef0123456789abcdef0123456789abcdef0123',
  includes3dElevation: true,
  includesHeliLandingZones: true,
  lastUpdatedUtc: '2026-08-20T10:00:00Z',
  expiryUtc: '2026-11-20T10:00:00Z',
};

export const manangRegionQueued: OfflineRegion = {
  id: 'pack-manang-v1',
  name: 'Manang & Tilicho Lake High Route',
  nameNepali: 'मनाङ तथा तिलिचो ताल उच्च मार्ग',
  description: 'Besisahar to Manang, Khangsar, and Tilicho Base Camp trail.',
  sizeBytes: 167772160, // 160 MB
  downloadedBytes: 0,
  progressPercentage: 0,
  lifecycle: 'queued',
  zoomMin: 6,
  zoomMax: 15,
  bounds: {
    minLng: 83.80,
    minLat: 28.50,
    maxLng: 84.50,
    maxLat: 28.90,
  },
  checksumSha256: 'd1e2f3a4b5c6d7e8f901a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f901a2b3c4',
  includes3dElevation: true,
  includesHeliLandingZones: true,
  lastUpdatedUtc: '2026-08-15T00:00:00Z',
  expiryUtc: '2026-11-15T00:00:00Z',
};

export const raraRegionPaused: OfflineRegion = {
  id: 'pack-rara-mugu-v1',
  name: 'Rara Lake & Mugu Frontier',
  nameNepali: 'रारा ताल तथा मुगु सिमाना',
  description: 'Surkhet, Jumla, Sinja Valley, Rara National Park corridor.',
  sizeBytes: 209715200, // 200 MB
  downloadedBytes: 125829120, // 60%
  progressPercentage: 60,
  lifecycle: 'paused',
  zoomMin: 6,
  zoomMax: 14,
  bounds: {
    minLng: 81.90,
    minLat: 29.40,
    maxLng: 82.30,
    maxLat: 29.70,
  },
  checksumSha256: 'e2f3a4b5c6d7e8f901a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f901a2b3c4d5',
  includes3dElevation: true,
  includesHeliLandingZones: true,
  lastUpdatedUtc: '2026-08-14T08:00:00Z',
  expiryUtc: '2026-11-14T08:00:00Z',
};

export const langtangRegionPartial: OfflineRegion = {
  id: 'pack-langtang-helambu-v1',
  name: 'Langtang & Gosaikunda Passes',
  nameNepali: 'लाङटाङ तथा गोसाइँकुण्ड मार्ग',
  description: 'Syabrubesi, Kyanjin Gompa, Laurebina Pass.',
  sizeBytes: 136314880, // 130 MB
  downloadedBytes: 95420416, // 70%
  progressPercentage: 70,
  lifecycle: 'partial',
  zoomMin: 6,
  zoomMax: 15,
  bounds: {
    minLng: 85.20,
    minLat: 28.00,
    maxLng: 85.70,
    maxLat: 28.30,
  },
  checksumSha256: 'f3a4b5c6d7e8f901a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f901a2b3c4d5e6',
  includes3dElevation: true,
  includesHeliLandingZones: true,
  lastUpdatedUtc: '2026-08-16T12:00:00Z',
  expiryUtc: '2026-11-16T12:00:00Z',
};

export const pokharaRegionStale: OfflineRegion = {
  id: 'pack-pokhara-valley-v1',
  name: 'Pokhara Valley & Sarangkot Ridge',
  nameNepali: 'पोखरा उपत्यका तथा सराङकोट',
  description: 'Cached 90 days ago; new monsoon road updates available.',
  sizeBytes: 104857600, // 100 MB
  downloadedBytes: 104857600,
  progressPercentage: 100,
  lifecycle: 'stale',
  zoomMin: 6,
  zoomMax: 16,
  bounds: {
    minLng: 83.85,
    minLat: 28.15,
    maxLng: 84.10,
    maxLat: 28.30,
  },
  checksumSha256: 'a1b2c3d4e5f60718293a4b5c6d7e8f901a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
  includes3dElevation: true,
  includesHeliLandingZones: true,
  lastUpdatedUtc: '2026-05-10T00:00:00Z', // 3 months old
  expiryUtc: '2026-08-10T00:00:00Z',
};

export const annapurnaRegionFailed: OfflineRegion = {
  id: 'pack-annapurna-south-v1',
  name: 'Annapurna Sanctuary & ABC Trail',
  nameNepali: 'अन्नपूर्ण आधार शिविर मार्ग',
  description: 'Ghandruk, Chhomrong, Deurali, Machhapuchhre Base Camp.',
  sizeBytes: 157286400, // 150 MB
  downloadedBytes: 20971520,
  progressPercentage: 13,
  lifecycle: 'failed',
  zoomMin: 6,
  zoomMax: 15,
  bounds: {
    minLng: 83.70,
    minLat: 28.30,
    maxLng: 84.00,
    maxLat: 28.60,
  },
  checksumSha256: 'b2c3d4e5f60718293a4b5c6d7e8f901a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e',
  includes3dElevation: true,
  includesHeliLandingZones: true,
  lastUpdatedUtc: '2026-08-19T14:00:00Z',
  expiryUtc: '2026-11-19T14:00:00Z',
  failureReason: 'Checksum mismatch after network disconnect. Retry required.',
};

export const dolpaRegionStorageFull: OfflineRegion = {
  id: 'pack-dolpa-karnali-v1',
  name: 'Upper Dolpa & Shey Phoksundo',
  nameNepali: 'माथिल्लो डोल्पा तथा शे-फोक्सुण्डो',
  description: 'Remote Karnali trails, zero cellular coverage corridor.',
  sizeBytes: 314572800, // 300 MB
  downloadedBytes: 41943040,
  progressPercentage: 13,
  lifecycle: 'storage_full',
  zoomMin: 6,
  zoomMax: 14,
  bounds: {
    minLng: 82.50,
    minLat: 28.80,
    maxLng: 83.60,
    maxLat: 29.60,
  },
  checksumSha256: 'c5d6e7f8a9b0123456789abcdef0123456789abcdef0123456789abcdef01234',
  includes3dElevation: true,
  includesHeliLandingZones: true,
  lastUpdatedUtc: '2026-08-18T12:00:00Z',
  expiryUtc: '2026-11-18T12:00:00Z',
  failureReason: 'Insufficient device flash storage available (Needs 300 MB free).',
};

export const allOfflineRegionFixtures: OfflineRegion[] = [
  mustangCircuitRegion,
  bagmatiNarayaniRegion,
  everestRegionDownloading,
  manangRegionQueued,
  raraRegionPaused,
  langtangRegionPartial,
  pokharaRegionStale,
  annapurnaRegionFailed,
  dolpaRegionStorageFull,
];
