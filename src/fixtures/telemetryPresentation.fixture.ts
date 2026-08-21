/**
 * ============================================================================
 * TELEMETRY PRESENTATION FIXTURES (R9)
 * ============================================================================
 *
 * WHY THIS EXISTS:
 * Provides deterministic, truthful view models for testing TelemetryHUD,
 * Map Home follow mode, and Ride Mode state across all 4 GPS states.
 */

import { TelemetryPresentation } from '../domain/telemetryPresentation';

/**
 * 1. Locked GPS Telemetry Fixture (Online, Kathmandu-Pokhara Highway)
 */
export const telemetryLockedPresentationFixture: TelemetryPresentation = {
  speedKmh: 68,
  altitudeMeters: 1740,
  bearingDeg: 45,
  accuracyMeters: 3.5,
  gpsState: 'locked',
  connectionMode: 'online',
  rideMode: 'active_fixture',
  observationAgeSeconds: 1,
  sourceLabel: 'Simulated Local GPS Fix (±3.5m)',
  isFollowAvailable: true,
};

/**
 * 2. Acquiring GPS Telemetry Fixture (Searching for Satellites)
 * Speed and Bearing are undefined (non-numeric placeholder rendered).
 */
export const telemetryAcquiringPresentationFixture: TelemetryPresentation = {
  speedKmh: undefined,
  altitudeMeters: 1400,
  bearingDeg: undefined,
  accuracyMeters: 55.0,
  gpsState: 'acquiring',
  connectionMode: 'online',
  rideMode: 'idle',
  observationAgeSeconds: 0,
  sourceLabel: 'Acquiring Satellites...',
  isFollowAvailable: false,
};

/**
 * 3. Stale GPS Telemetry Fixture (Cellular Dead Zone, 3 minutes old)
 * Speed and Bearing undefined; Altitude shows last-known fix with age disclosure.
 */
export const telemetryStalePresentationFixture: TelemetryPresentation = {
  speedKmh: undefined,
  altitudeMeters: 2100,
  bearingDeg: undefined,
  accuracyMeters: 25.0,
  gpsState: 'stale',
  connectionMode: 'deadZone',
  rideMode: 'active_fixture',
  observationAgeSeconds: 180, // 3 minutes old
  sourceLabel: 'Last Known Fix (3m ago · ±25m)',
  isFollowAvailable: false,
};

/**
 * 4. Lost GPS Telemetry Fixture (No Signal in Gorge)
 * All metrics undefined; non-numeric placeholder rendered.
 */
export const telemetryLostPresentationFixture: TelemetryPresentation = {
  speedKmh: undefined,
  altitudeMeters: undefined,
  bearingDeg: undefined,
  accuracyMeters: 999.0,
  gpsState: 'lost',
  connectionMode: 'deadZone',
  rideMode: 'idle',
  observationAgeSeconds: 600, // 10 minutes old
  sourceLabel: 'GPS Signal Unavailable',
  isFollowAvailable: false,
};

/**
 * 5. Locked GPS in Mesh-Only Mode (Offline Group Relay)
 */
export const telemetryMeshLockedPresentationFixture: TelemetryPresentation = {
  speedKmh: 42,
  altitudeMeters: 3540,
  bearingDeg: 315,
  accuracyMeters: 4.8,
  gpsState: 'locked',
  connectionMode: 'meshOnly',
  rideMode: 'active_fixture',
  observationAgeSeconds: 2,
  sourceLabel: 'Local GPS Fix · Mesh Peer Relay Active',
  isFollowAvailable: true,
};

export const allTelemetryPresentationFixtures = [
  telemetryLockedPresentationFixture,
  telemetryAcquiringPresentationFixture,
  telemetryStalePresentationFixture,
  telemetryLostPresentationFixture,
  telemetryMeshLockedPresentationFixture,
];
