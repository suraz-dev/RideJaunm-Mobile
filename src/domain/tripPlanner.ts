/**
 * ============================================================================
 * TRIP PLANNER & ROUTE COMPARISON DOMAIN (R10 / ADR-001)
 * ============================================================================
 *
 * WHY THIS EXISTS:
 * Defines screen-independent, provider-neutral view models for local destination
 * search, 3-way route candidate comparison, waypoint editing, and Solo/Group intent.
 *
 * INVARIANTS:
 * 1. 3 Route Profiles: Straight, Curvy, Supercurvy.
 * 2. Candidates carry explicit availability ('available', 'restricted', 'unavailable')
 *    with machine-readable reasons and permit requirements (never silent fallback).
 * 3. Waypoint editor operates on deterministic pre-authored place entities.
 * 4. Solo/Group mode is planning intent only (no live group network side effects).
 */

import { RouteProfile } from './route';

export type PlanningMode = 'solo' | 'group_fixture';

export type PlannerSearchState =
  | 'idle'
  | 'searching_fixture'
  | 'results'
  | 'offline_cached'
  | 'no_results';

export type CandidateAvailability = 'available' | 'restricted' | 'unavailable';

export interface PlannerPlace {
  id: string;
  name: string;
  nameNepali?: string;
  kind: 'origin' | 'destination' | 'waypoint' | 'suggested_stop';
  source: 'fixture_catalog' | 'offline_fixture_catalog';
  region?: string;
}

export interface PlannerWaypoint {
  id: string;
  place: PlannerPlace;
  order: number;
  category: 'fuel' | 'food' | 'viewpoint' | 'rest' | 'permit';
  state: 'selected' | 'suggested';
}

export interface PlannerRouteCandidate {
  id: string;
  profile: RouteProfile;
  name: string;
  nameNepali?: string;
  description: string;
  distanceKm: number;
  durationMinutes: number;
  curvinessScore: number; // 0.0 - 10.0 scale
  bendsCount: number;
  maxElevationMeters: number;
  surfaceSummary: string; // e.g. "85% Paved Asphalt · 15% Mountain Gravel"
  hazardsCount: number;
  fuelGapMaxKm: number;
  availability: CandidateAvailability;
  restrictionReason?: string;
  permitRequired?: {
    type: string;
    agency: string;
    note: string;
  };
  provenance: {
    sourceVersion: string;
    freshUntil?: string;
    syntheticDisclosure: string;
  };
}
