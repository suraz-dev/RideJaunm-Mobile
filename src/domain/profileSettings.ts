/**
 * ============================================================================
 * PROFILE, GARAGE, HISTORY, AND SETTINGS DOMAIN CONTRACTS (R14)
 * ============================================================================
 *
 * Scope boundary:
 * Pure TypeScript view models for rider profile, motorcycles, ride history,
 * and preview settings.
 *
 * INVARIANTS:
 * 1. Zero auth/backend API contracts; purely local view models.
 * 2. Every model carries pre-authored synthetic disclosures and source versions.
 * 3. Never claims real phone numbers, real vehicle registration, or GPS-recorded rides.
 */

import { RouteProfile } from './route';

export type MaintenanceState = 'good' | 'due_soon' | 'stale_unknown';
export type AppPreviewLanguage = 'en' | 'ne' | 'hi';
export type CalendarSystemPreview = 'AD' | 'BS';
export type UnitSystemPreview = 'metric' | 'imperial';

export interface FixtureBadge {
  id: string;
  name: string;
  nameNepali?: string;
  nameHindi?: string;
  description: string;
  icon: string;
  unlockedDateAd: string;
  unlockedDateBs: string;
}

export interface FixtureRiderProfile {
  riderId: string;
  callsign: string;
  callsignNepali?: string;
  callsignHindi?: string;
  fullName: string;
  fullNameNepali?: string;
  fullNameHindi?: string;
  bloodGroup: string;
  emergencyContactSynthetic: string;
  bio: string;
  bioNepali?: string;
  bioHindi?: string;
  totalRidesCount: number;
  totalDistanceKm: number;
  elevationGainMeters: number;
  highPassesCrossedCount: number;
  badges: FixtureBadge[];
  sourceVersion: string;
  syntheticDisclosure: string;
}

export interface FixtureMotorcycle {
  id: string;
  makeModel: string;
  licensePlateSynthetic: string;
  colorName: string;
  displacementCc: number;
  fuelCapacityLiters: number;
  estimatedFuelLevelPercent: number;
  maintenanceState: MaintenanceState;
  odometerKm: number;
  lastServiceDateAd: string;
  lastServiceDateBs: string;
  notes: string;
  sourceVersion: string;
  syntheticDisclosure: string;
}

export interface FixtureRideHistoryItem {
  id: string;
  title: string;
  titleNepali?: string;
  titleHindi?: string;
  startLocation: string;
  endLocation: string;
  dateAd: string;
  dateBs: string;
  distanceKm: number;
  durationHours: number;
  elevationGainM: number;
  routeMode: RouteProfile;
  state: 'cached' | 'stale' | 'draft';
  sourceVersion: string;
  syntheticDisclosure: string;
}

export interface FixturePreferencePreview {
  language: AppPreviewLanguage;
  calendarSystem: CalendarSystemPreview;
  unitSystem: UnitSystemPreview;
  dataSaver: boolean;
  isUnsavedPreview: boolean;
  sourceVersion: string;
  syntheticDisclosure: string;
}
