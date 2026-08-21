/**
 * Trip & Active Ride Session Models
 * Manages trip planning drafts, waypoint sequences, and real-time ride telemetry state.
 */

import { RouteCandidate, RouteId } from './route';
import { GpsTelemetry } from './connectivity';

export type TripId = string;
export type RideId = string;

export type TripLifecycle = 'draft' | 'planned' | 'active' | 'completed' | 'cancelled';
export type TripMode = 'solo' | 'group';

export type RideLifecycle =
  | 'idle'
  | 'preparing'
  | 'navigating'
  | 'paused'
  | 'sosArmed'
  | 'finished';

export interface Trip {
  id: TripId;
  title: string;
  originName: string;
  destinationName: string;
  mode: TripMode;
  groupId?: string;
  selectedRouteId: RouteId;
  candidateRoutes: RouteCandidate[];
  lifecycle: TripLifecycle;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface ActiveRideSession {
  rideId: RideId;
  tripId: TripId;
  startTimeUtc: string;
  currentSpeedKmh: number;
  maxSpeedKmh: number;
  distanceTraveledMeters: number;
  currentAltitudeMeters: number;
  maxAltitudeMeters: number;
  bearingDeg: number;
  lifecycle: RideLifecycle;
  lastKnownGps: GpsTelemetry;
  routeProgressPercentage: number;
}
