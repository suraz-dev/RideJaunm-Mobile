/**
 * ============================================================================
 * TELEMETRY & MAP HOME PRESENTATION CONTRACTS (R9 / ADR-004)
 * ============================================================================
 *
 * WHY THIS EXISTS:
 * Defines screen-independent, provider-neutral view models for Map Home
 * position, follow/recenter controls, Ride Mode lifecycle, and Telemetry HUD.
 *
 * INVARIANTS:
 * 1. 4 Explicit GPS States: 'acquiring', 'locked', 'stale', 'lost'.
 * 2. Stale/Lost states NEVER use numeric 0 as a placeholder; non-numeric
 *    placeholders ("--") are rendered instead.
 * 3. Follow mode is enabled ONLY when GPS state is 'locked'.
 * 4. Local Ride Mode ('idle' | 'active_fixture' | 'ended') remains local
 *    without claiming background location or server synchronization.
 */

import { GpsLockState } from './connectivity';

export type RideModeState = 'idle' | 'active_fixture' | 'ended';

export type CameraFollowMode =
  | 'route_origin'
  | 'fixture_position'
  | 'heading_up'
  | 'north_up'
  | 'unavailable';

export interface TelemetryPresentation {
  speedKmh?: number;            // undefined when GPS is acquiring/stale/lost
  altitudeMeters?: number;      // undefined when GPS is lost
  bearingDeg?: number;          // undefined when GPS is acquiring/stale/lost
  accuracyMeters?: number;
  gpsState: GpsLockState;
  connectionMode: 'online' | 'meshOnly' | 'deadZone';
  rideMode: RideModeState;
  observationAgeSeconds?: number;
  sourceLabel: string;
  isFollowAvailable: boolean;
}
