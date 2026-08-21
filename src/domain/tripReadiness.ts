/**
 * ============================================================================
 * FIXTURE TRIP READINESS & SQUAD HANDOFF CONTRACTS (R11)
 * ============================================================================
 *
 * WHY THIS EXISTS:
 * Defines screen-independent view models for inspecting a synthetic squad
 * roster, assigning local planning roles (lead, sweep, rider), and viewing
 * pre-authored readiness checklist items.
 *
 * INVARIANTS:
 * 1. Strictly local fixture data: No server DTOs, network mutations, or UUID generators.
 * 2. Stable fixture IDs.
 * 3. Synthetic invite and save actions never perform network requests or write
 *    persistent trips.
 * 4. Never use SOS Red (#FF1F3D) for ordinary readiness warnings or blocks.
 */

export type FixtureTripRole = 'lead' | 'sweep' | 'rider';

export type FixtureInviteState =
  | 'not_invited'
  | 'preview_pending'
  | 'preview_ready'
  | 'preview_blocked';

export type ReadinessState = 'ready' | 'attention' | 'blocked' | 'unknown';

export interface FixtureSquadMember {
  id: string;
  displayName: string;
  displayNameNepali?: string;
  role: FixtureTripRole;
  inviteState: FixtureInviteState;
  offlineMapState: ReadinessState;
  permitState: ReadinessState;
  fuelState: ReadinessState;
  emergencyContactState: ReadinessState;
  source: 'fixture';
}

export interface FixtureTripReadinessItem {
  id: string;
  category: 'route' | 'offline_map' | 'permit' | 'fuel' | 'weather' | 'safety';
  state: ReadinessState;
  title: string;
  titleNepali?: string;
  detail: string;
  sourceVersion: string;
  syntheticDisclosure: string;
}
