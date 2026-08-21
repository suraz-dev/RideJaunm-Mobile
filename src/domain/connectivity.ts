/**
 * Connectivity & GPS Freshness Models
 * Represents multi-transport network state and GPS sensor observation metrics.
 */

export type ConnectionMode =
  | 'online'             // High-speed cellular / Wi-Fi (4G/5G)
  | 'cellularDegraded'   // 2G/EDGE or flaky mountain cellular
  | 'meshOnly'           // Pure BLE multi-hop mesh among squad peers (no cellular)
  | 'deadZone';          // Complete isolation (no mesh peers, no cellular, pure offline maps)

export type GpsLockState =
  | 'acquiring'          // Searching for satellites / initial fix
  | 'locked'             // 3D fix with high accuracy (<= 15m)
  | 'stale'              // Signal degraded, using dead-reckoning / last known location
  | 'lost';              // No satellite visibility (e.g. tunnel, dense canyon)

export interface GpsTelemetry {
  latitude: number;
  longitude: number;
  altitudeMeters: number;
  accuracyMeters: number;
  speedKmh: number;
  headingDeg: number;
  timestampUtc: string;
  lockState: GpsLockState;
}

export interface MeshPeer {
  nodeId: string;
  callsign: string;
  rssiDb: number;
  hopCount: number;
  batteryLevel: number;
  lastHeardUtc: string;
}

export interface ConnectionStateSnapshot {
  mode: ConnectionMode;
  cellularSignalBars: number; // 0 to 4
  meshPeersCount: number;
  activeMeshPeers: MeshPeer[];
  gps: GpsTelemetry;
  offlineMapCached: boolean;
  userFacingNotice: string;
  userFacingNoticeNepali: string;
}
