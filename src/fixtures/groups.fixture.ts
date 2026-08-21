import { Group } from '../domain/group';

export const himalayanSquadKT04: Group = {
  id: 'group-himalayan-kt04',
  name: 'Himalayan Riders KT-04',
  passCode: 'RIDE-8848',
  leaderRiderId: 'rider-bikash-01',
  members: [
    {
      riderId: 'rider-bikash-01',
      name: 'Bikash Shrestha',
      callsign: 'KTM-Lead',
      role: 'lead',
      status: 'riding',
      distanceDeltaMeters: 400, // 400m ahead
      bearingToLeaderDeg: 0,
      batteryPercent: 86,
      isMeshRelayActive: true,
      lastSeenTimestampUtc: '2026-08-20T17:44:55Z',
    },
    {
      riderId: 'rider-suraj-02',
      name: 'Suraj Shrestha',
      callsign: 'Point-Rider',
      role: 'point',
      status: 'riding',
      distanceDeltaMeters: 0, // Current user
      bearingToLeaderDeg: 45,
      batteryPercent: 92,
      isMeshRelayActive: true,
      lastSeenTimestampUtc: '2026-08-20T17:45:00Z',
    },
    {
      riderId: 'rider-rabin-03',
      name: 'Rabin Thapa',
      callsign: 'Sweep-03',
      role: 'sweep',
      status: 'mesh_relay',
      distanceDeltaMeters: -1200, // 1.2km behind
      bearingToLeaderDeg: 225,
      batteryPercent: 24, // Low battery indicator
      isMeshRelayActive: true,
      lastSeenTimestampUtc: '2026-08-20T17:43:30Z',
    },
  ],
  activeTripId: 'trip-ktm-pkr-01',
  createdAtUtc: '2026-08-15T09:00:00Z',
};
