/**
 * Safety Capability & Incident Snapshot Models
 * Strictly encodes evidence tiers per ADR-007 (Never claims false public dispatch).
 */

export type SafetyEvidenceTier =
  | 'local_observation'       // Stored on device only (armed)
  | 'mesh_peer_relayed'        // Acknowledged by nearby squad BLE mesh peer
  | 'sms_gateway_queued'       // Transmitted to cellular SMS relay queue
  | 'provider_acknowledged'    // Cellular / Satellite gateway provider 200 OK receipt
  | 'human_confirmed';         // Verified human dispatch / emergency coordinator receipt

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
  meshPeersNotified: number;
  cellularAvailableAtArm: boolean;
  isCancelled: boolean;
  cancellationTimestampUtc?: string;
  statusText: string;
  statusTextNepali: string;
}
