import { ConnectionStateSnapshot, GpsTelemetry } from '../domain/connectivity';

export const gpsLockedFixture: GpsTelemetry = {
  latitude: 27.6775,
  longitude: 85.3486,
  altitudeMeters: 1740,
  accuracyMeters: 3.5,
  speedKmh: 68,
  headingDeg: 45,
  timestampUtc: '2026-08-20T17:45:00Z',
  lockState: 'locked',
};

export const gpsAcquiringFixture: GpsTelemetry = {
  latitude: 27.6775,
  longitude: 85.3486,
  altitudeMeters: 1400,
  accuracyMeters: 55.0,
  speedKmh: 0,
  headingDeg: 0,
  timestampUtc: '2026-08-20T17:45:00Z',
  lockState: 'acquiring',
};

export const gpsStaleFixture: GpsTelemetry = {
  latitude: 27.8592,
  longitude: 84.5521,
  altitudeMeters: 2100,
  accuracyMeters: 25.0,
  speedKmh: 42,
  headingDeg: 120,
  timestampUtc: '2026-08-20T17:42:15Z', // 3 minutes stale
  lockState: 'stale',
};

export const gpsLostFixture: GpsTelemetry = {
  latitude: 28.7845,
  longitude: 83.8567,
  altitudeMeters: 3540,
  accuracyMeters: 999.0,
  speedKmh: 0,
  headingDeg: 0,
  timestampUtc: '2026-08-20T17:30:00Z',
  lockState: 'lost',
};

export const connectionOnlineSnapshot: ConnectionStateSnapshot = {
  mode: 'online',
  cellularSignalBars: 4,
  meshPeersCount: 3,
  activeMeshPeers: [
    { nodeId: 'mesh-node-01', callsign: 'Bikash (Lead)', rssiDb: -64, hopCount: 1, batteryLevel: 88, lastHeardUtc: '2026-08-20T17:44:50Z' },
    { nodeId: 'mesh-node-02', callsign: 'Rabin (Sweep)', rssiDb: -82, hopCount: 2, batteryLevel: 32, lastHeardUtc: '2026-08-20T17:44:30Z' },
  ],
  gps: gpsLockedFixture,
  offlineMapCached: true,
  userFacingNotice: '4G LTE Connected · Live Cloud Telemetry Active',
  userFacingNoticeNepali: '४जी इन्टरनेट जडान · प्रत्यक्ष क्लाउड सक्रिय',
};

export const connectionMeshOnlySnapshot: ConnectionStateSnapshot = {
  mode: 'meshOnly',
  cellularSignalBars: 0,
  meshPeersCount: 2,
  activeMeshPeers: [
    { nodeId: 'mesh-node-01', callsign: 'Bikash (Lead)', rssiDb: -72, hopCount: 1, batteryLevel: 84, lastHeardUtc: '2026-08-20T17:44:45Z' },
  ],
  gps: gpsLockedFixture,
  offlineMapCached: true,
  userFacingNotice: 'Cellular Dead Zone · BLE Mesh Active (2 Peers Relaying)',
  userFacingNoticeNepali: 'मोबाइल नेटवर्क छैन · बीएलई मेस सक्रिय (२ जना साथीहरू)',
};

export const connectionDeadZoneSnapshot: ConnectionStateSnapshot = {
  mode: 'deadZone',
  cellularSignalBars: 0,
  meshPeersCount: 0,
  activeMeshPeers: [],
  gps: gpsStaleFixture,
  offlineMapCached: true,
  userFacingNotice: 'Dead Zone · Pure Offline Vector Cache Operating',
  userFacingNoticeNepali: 'पूर्ण अफलाइन · भण्डारण गरिएको नक्सा प्रयोग भइरहेको छ',
};
