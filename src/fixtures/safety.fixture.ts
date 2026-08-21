import { SafetyIncidentSnapshot } from '../domain/safety';

export const sosLocalArmedFixture: SafetyIncidentSnapshot = {
  incidentId: 'sos-inc-local-001',
  triggerTimestampUtc: '2026-08-20T17:45:00Z',
  armedCoordinates: {
    latitude: 27.6775,
    longitude: 85.3486,
    altitudeMeters: 1740,
    accuracyMeters: 3.5,
  },
  evidenceTier: 'local_device_armed',
  meshHopCount: 0,
  meshPeersObserved: 0,
  isMeshAvailable: false,
  isCellularReported: false,
  isLowBattery: false,
  isCancelled: false,
  observationNote: 'Armed locally on device. Sensor trigger recorded.',
  observationNoteNepali: 'यन्त्रमा सक्रिय भयो। सेन्सर रेकर्ड गरियो।',
};

export const sosMeshAvailableFixture: SafetyIncidentSnapshot = {
  incidentId: 'sos-inc-mesh-002',
  triggerTimestampUtc: '2026-08-20T17:45:10Z',
  armedCoordinates: {
    latitude: 28.7845,
    longitude: 83.8567,
    altitudeMeters: 3540,
    accuracyMeters: 6.0,
  },
  evidenceTier: 'mesh_peer_observed',
  meshHopCount: 1,
  meshPeersObserved: 3,
  isMeshAvailable: true,
  isCellularReported: false,
  isLowBattery: false,
  isCancelled: false,
  observationNote: 'BLE mesh transport active; 3 squad peers observed within 1.2km.',
  observationNoteNepali: 'बीएलई मेस सक्रिय; १.२ किमी भित्र ३ जना साथीहरू फेला परे।',
};

export const sosZeroPeersFixture: SafetyIncidentSnapshot = {
  incidentId: 'sos-inc-mesh-zero-003',
  triggerTimestampUtc: '2026-08-20T17:46:00Z',
  armedCoordinates: {
    latitude: 28.9950,
    longitude: 83.7120,
    altitudeMeters: 4100,
    accuracyMeters: 8.0,
  },
  evidenceTier: 'mesh_peer_observed',
  meshHopCount: 0,
  meshPeersObserved: 0,
  isMeshAvailable: true,
  isCellularReported: false,
  isLowBattery: false,
  isCancelled: false,
  observationNote: 'BLE mesh radio active but 0 squad peers currently in signal range.',
  observationNoteNepali: 'बीएलई मेस सक्रिय तर दायराभित्र कोही साथीहरू छैनन्।',
};

export const sosCapabilityUnavailableFixture: SafetyIncidentSnapshot = {
  incidentId: 'sos-inc-unavail-004',
  triggerTimestampUtc: '2026-08-20T17:47:00Z',
  armedCoordinates: {
    latitude: 27.7000,
    longitude: 85.3000,
    altitudeMeters: 1350,
    accuracyMeters: 50.0,
  },
  evidenceTier: 'capability_unavailable',
  meshHopCount: 0,
  meshPeersObserved: 0,
  isMeshAvailable: false,
  isCellularReported: false,
  isLowBattery: false,
  isCancelled: false,
  observationNote: 'Bluetooth radio powered off; mesh relay capability unavailable.',
  observationNoteNepali: 'ब्लुटुथ बन्द छ; मेस क्षमता उपलब्ध छैन।',
};

export const sosLastKnownGpsFixture: SafetyIncidentSnapshot = {
  incidentId: 'sos-inc-stale-gps-005',
  triggerTimestampUtc: '2026-08-20T17:48:00Z',
  armedCoordinates: {
    latitude: 28.5200,
    longitude: 83.6000,
    altitudeMeters: 2800,
    accuracyMeters: 45.0,
  },
  evidenceTier: 'local_device_armed',
  meshHopCount: 0,
  meshPeersObserved: 0,
  isMeshAvailable: false,
  isCellularReported: false,
  isLowBattery: false,
  isCancelled: false,
  observationNote: 'GPS signal lost in gorge; using last known position (4m stale).',
  observationNoteNepali: 'खोचमा जीपीएस सम्पर्क विच्छेद; पछिल्लो ज्ञात स्थान प्रयोग गरिएको छ।',
};

export const sosLowBatteryFixture: SafetyIncidentSnapshot = {
  incidentId: 'sos-inc-low-bat-006',
  triggerTimestampUtc: '2026-08-20T17:49:00Z',
  armedCoordinates: {
    latitude: 27.8000,
    longitude: 84.8000,
    altitudeMeters: 1900,
    accuracyMeters: 4.0,
  },
  evidenceTier: 'local_device_armed',
  meshHopCount: 0,
  meshPeersObserved: 1,
  isMeshAvailable: true,
  isCellularReported: false,
  isLowBattery: true,
  isCancelled: false,
  observationNote: 'Device battery below 15%; BLE advertising rate throttled to save power.',
  observationNoteNepali: 'ब्याट्री १५% भन्दा कम; शक्ति बचत गर्न प्रसारण दर घटाइयो।',
};

export const sosStandDownCancelledFixture: SafetyIncidentSnapshot = {
  incidentId: 'sos-inc-cancelled-007',
  triggerTimestampUtc: '2026-08-20T17:50:00Z',
  armedCoordinates: {
    latitude: 27.6775,
    longitude: 85.3486,
    altitudeMeters: 1740,
    accuracyMeters: 3.5,
  },
  evidenceTier: 'stand_down_cancelled',
  meshHopCount: 0,
  meshPeersObserved: 0,
  isMeshAvailable: false,
  isCellularReported: false,
  isLowBattery: false,
  isCancelled: true,
  cancellationTimestampUtc: '2026-08-20T17:50:06Z',
  observationNote: 'Incident disarmed and cancelled by rider during 10s window.',
  observationNoteNepali: '१० सेकेन्डको समय भित्र चालक द्वारा आपतकाल रद्द गरियो।',
};

export const allSafetyFixtures: SafetyIncidentSnapshot[] = [
  sosLocalArmedFixture,
  sosMeshAvailableFixture,
  sosZeroPeersFixture,
  sosCapabilityUnavailableFixture,
  sosLastKnownGpsFixture,
  sosLowBatteryFixture,
  sosStandDownCancelledFixture,
];
