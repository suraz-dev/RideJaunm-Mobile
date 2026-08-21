import { SafetyIncidentSnapshot } from '../domain/safety';

export const sosArmedLocalObservation: SafetyIncidentSnapshot = {
  incidentId: 'sos-inc-20260820-001',
  triggerTimestampUtc: '2026-08-20T17:45:00Z',
  armedCoordinates: {
    latitude: 27.6775,
    longitude: 85.3486,
    altitudeMeters: 1740,
    accuracyMeters: 4.0,
  },
  evidenceTier: 'local_observation',
  meshHopCount: 0,
  meshPeersNotified: 0,
  cellularAvailableAtArm: false,
  isCancelled: false,
  statusText: 'Armed on device. Awaiting mesh or cellular transport acknowledgement.',
  statusTextNepali: 'यन्त्रमा सक्रिय भयो। मेस वा मोबाइल नेटवर्क प्रतिक्षामा छ।',
};

export const sosMeshRelayedObservation: SafetyIncidentSnapshot = {
  incidentId: 'sos-inc-20260820-002',
  triggerTimestampUtc: '2026-08-20T17:45:10Z',
  armedCoordinates: {
    latitude: 28.7845,
    longitude: 83.8567,
    altitudeMeters: 3540,
    accuracyMeters: 8.0,
  },
  evidenceTier: 'mesh_peer_relayed',
  meshHopCount: 2,
  meshPeersNotified: 3,
  cellularAvailableAtArm: false,
  isCancelled: false,
  statusText: 'Relayed across 2 BLE mesh hops to 3 squad peers.',
  statusTextNepali: '२ मेस हप्स मार्फत ३ जना साथीहरूलाई प्रसारित भयो।',
};
