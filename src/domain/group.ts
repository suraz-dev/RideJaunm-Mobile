/**
 * Group & Squad Models
 * Manages squad formations, member telemetry, BLE mesh peer discovery, and role statuses.
 */

export type GroupId = string;
export type RiderId = string;

export type RiderRole = 'lead' | 'point' | 'sweep' | 'member';

export type RiderStatus =
  | 'riding'
  | 'stopped'
  | 'mesh_relay'
  | 'offline_cached'
  | 'low_battery'
  | 'sos_active';

export interface GroupMember {
  riderId: RiderId;
  name: string;
  callsign: string;
  role: RiderRole;
  status: RiderStatus;
  distanceDeltaMeters: number; // Positive = ahead of user, negative = behind
  bearingToLeaderDeg: number;
  batteryPercent: number;
  isMeshRelayActive: boolean;
  lastSeenTimestampUtc: string;
}

export interface Group {
  id: GroupId;
  name: string;
  passCode: string;
  leaderRiderId: RiderId;
  members: GroupMember[];
  activeTripId?: string;
  createdAtUtc: string;
}
