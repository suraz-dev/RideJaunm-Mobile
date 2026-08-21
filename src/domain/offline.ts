/**
 * Offline Region & Map Pack Models
 * Manages lifecycle of vector tiles, elevation data, POIs, and emergency LZ caches.
 */

export type RegionId = string;

export type OfflinePackLifecycle =
  | 'queued'
  | 'downloading'
  | 'paused'
  | 'partial'
  | 'complete'
  | 'stale'
  | 'failed'
  | 'storage_full';

export interface BoundingBox {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
}

export interface OfflineRegion {
  id: RegionId;
  name: string;
  nameNepali: string;
  description: string;
  sizeBytes: number;
  downloadedBytes: number;
  progressPercentage: number;
  lifecycle: OfflinePackLifecycle;
  zoomMin: number;
  zoomMax: number;
  bounds: BoundingBox;
  checksumSha256: string;
  includes3dElevation: boolean;
  includesHeliLandingZones: boolean;
  lastUpdatedUtc: string;
  expiryUtc: string;
  failureReason?: string;
}
