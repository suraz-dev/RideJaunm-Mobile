/**
 * ============================================================================
 * SOS CONSOLE & SAFETY CAPABILITY GATE DOMAIN CONTRACTS (R15)
 * ============================================================================
 *
 * Scope boundary:
 * Pure TypeScript view models and state unions for the SOS emergency console,
 * channel evidence items, and capability gate snapshots.
 *
 * SAFETY & TRUTH INVARIANTS:
 * 1. Zero incident persistence, outbox writes, or server queries.
 * 2. Never claims an alert was sent, broadcast, relayed, delivered, or dispatched.
 * 3. Every state and evidence item contains explicit synthetic disclosures.
 */

export type FixtureSafetyConsoleState =
  | 'ready'
  | 'holding'
  | 'cancel_window'
  | 'active_preview'
  | 'stand_down_hold'
  | 'stood_down_preview';

export type FixtureSafetyEvidenceState =
  | 'unavailable'
  | 'local_observation'
  | 'device_reported'
  | 'unknown'
  | 'simulated_preview';

export type GPSFreshnessState = 'unavailable' | 'last_known' | 'fresh';
export type MeshCapabilityState = 'unavailable' | 'device_reported' | 'zero_peers';
export type BatteryHealthState = 'normal' | 'low';

export interface FixtureSafetyEvidenceItem {
  id: string;
  channelName: string;
  channelNameNepali?: string;
  evidenceState: FixtureSafetyEvidenceState;
  statusLabel: string;
  statusLabelNepali?: string;
  detail: string;
  detailNepali?: string;
  sourceVersion: string;
  syntheticDisclosure: string;
}

export interface FixtureSafetyCapabilitySnapshot {
  id: string;
  cellularObserved: boolean;
  cellularCarrierLabel: string;
  gpsFreshness: GPSFreshnessState;
  lastKnownLocationSynthetic: string;
  meshCapability: MeshCapabilityState;
  satelliteAvailable: boolean;
  batteryHealth: BatteryHealthState;
  batteryPercent: number;
  evidenceItems: FixtureSafetyEvidenceItem[];
  sourceVersion: string;
  syntheticDisclosure: string;
}
