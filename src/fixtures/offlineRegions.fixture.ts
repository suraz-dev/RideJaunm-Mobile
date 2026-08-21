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
