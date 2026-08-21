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

/**
 * Pure state machine transition validation for offline map packs.
 * Defines allowed deterministic state progressions without side effects.
 */
export function canTransitionPackLifecycle(
  from: OfflinePackLifecycle,
  to: OfflinePackLifecycle
): boolean {
  const allowedTransitions: Record<OfflinePackLifecycle, OfflinePackLifecycle[]> = {
    queued: ['downloading', 'failed'],
    downloading: ['paused', 'complete', 'failed', 'storage_full', 'partial'],
    paused: ['downloading', 'failed'],
    partial: ['downloading', 'failed'],
    complete: ['stale', 'downloading'], // stale when expiry reached, downloading on user re-sync
    stale: ['downloading'],
    failed: ['queued', 'downloading'],
    storage_full: ['queued', 'downloading'],
  };

  return allowedTransitions[from]?.includes(to) ?? false;
}

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
