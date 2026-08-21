/**
 * Safety Capability & Incident Snapshot Models (ADR-007)
 * Strictly restricted to client/device-observed state in Task R6.
 * Note: Never claims or models public emergency dispatch or server receipt
 * without validated native transports (reserved for Task S10 / R16).
 */

export type SafetyEvidenceTier =
  | 'local_device_armed'        // Armed locally on device (sensor/user trigger)
  | 'mesh_peer_observed'        // Nearby squad BLE mesh peer observation recorded
  | 'capability_unavailable'    // Safety transport hardware/sensor not available
  | 'stand_down_cancelled';      // Cancelled by user during cancel window or stand-down

export interface SafetyIncidentSnapshot {
  incidentId: string;
  triggerTimestampUtc: string;
  armedCoordinates: {
    latitude: number;
    longitude: number;
    altitudeMeters: number;
    accuracyMeters: number;
  };
  evidenceTier: SafetyEvidenceTier;
  meshHopCount: number;
  meshPeersObserved: number;
  isMeshAvailable: boolean;
  isCellularReported: boolean;
  isLowBattery: boolean;
  isCancelled: boolean;
  cancellationTimestampUtc?: string;
  observationNote: string;
  observationNoteNepali: string;
}
