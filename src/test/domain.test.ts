import {
  kathmanduToPokharaCurvy,
  kathmanduToPokharaSupercurvy,
  kathmanduToPokharaStraight,
  teraiHighwayStraight,
  gpsLockedFixture,
  gpsAcquiringFixture,
  gpsStaleFixture,
  gpsLostFixture,
  allOfflineRegionFixtures,
  allSafetyFixtures,
  localeEnFixture,
  localeNeFixture,
  localeHiFixture,
  longDevanagariAddressFixture,
  nepalTimezoneFixture,
  calendarTestFixtures,
} from '../fixtures';
import { GpsLockState, computeGpsLockState } from '../domain/connectivity';
import { OfflinePackLifecycle, canTransitionPackLifecycle } from '../domain/offline';
import { SafetyEvidenceTier } from '../domain/safety';

describe('RideJaunm R6 Domain Models, Fixtures & Locale Matrix', () => {
  test('quad-codes 3 route candidates and flags Terai Supercurvy restriction', () => {
    expect(kathmanduToPokharaCurvy.profile).toBe('curvy');
    expect(kathmanduToPokharaCurvy.curvinessScore).toBeGreaterThan(7.0);

    expect(kathmanduToPokharaSupercurvy.profile).toBe('supercurvy');
    expect(kathmanduToPokharaSupercurvy.curvinessScore).toBeGreaterThan(9.0);

    expect(kathmanduToPokharaStraight.profile).toBe('straight');

    // Terai flat highway disables Supercurvy mode
    expect(teraiHighwayStraight.isSupercurvyRestrictedInTerai).toBe(true);
  });

  test('validates Nepal GPS freshness lifecycle transitions and accuracy thresholds', () => {
    const validStates: GpsLockState[] = ['acquiring', 'locked', 'stale', 'lost'];

    expect(validStates).toContain(gpsAcquiringFixture.lockState);
    expect(validStates).toContain(gpsLockedFixture.lockState);
    expect(validStates).toContain(gpsStaleFixture.lockState);
    expect(validStates).toContain(gpsLostFixture.lockState);

    expect(gpsLockedFixture.accuracyMeters).toBeLessThanOrEqual(15);
    expect(gpsAcquiringFixture.accuracyMeters).toBeGreaterThan(15);
  });

  test('validates GPS freshness pure transition rules (RC-4)', () => {
    // 1. High accuracy recent fix -> locked
    expect(computeGpsLockState(4.2, 1)).toBe('locked');
    expect(computeGpsLockState(14.9, 8)).toBe('locked');

    // 2. Low accuracy recent fix -> acquiring
    expect(computeGpsLockState(25.0, 3)).toBe('acquiring');

    // 3. Degraded signal age -> stale
    expect(computeGpsLockState(5.0, 15)).toBe('stale');
    expect(computeGpsLockState(35.0, 5)).toBe('stale');

    // 4. Lost signal (age > 60s or extreme inaccuracy) -> lost
    expect(computeGpsLockState(5.0, 65)).toBe('lost');
    expect(computeGpsLockState(150.0, 2)).toBe('lost');
  });

  test('covers all 8 required offline region pack lifecycle states (R6-1)', () => {
    const requiredLifecycles: OfflinePackLifecycle[] = [
      'queued',
      'downloading',
      'paused',
      'partial',
      'complete',
      'stale',
      'failed',
      'storage_full',
    ];

    const presentLifecycles = allOfflineRegionFixtures.map((r) => r.lifecycle);

    requiredLifecycles.forEach((lifecycle) => {
      expect(presentLifecycles).toContain(lifecycle);
    });

    expect(allOfflineRegionFixtures.length).toBeGreaterThanOrEqual(8);
  });

  test('validates offline pack lifecycle allowed and blocked transition rules (RC-4)', () => {
    // Allowed valid transitions
    expect(canTransitionPackLifecycle('queued', 'downloading')).toBe(true);
    expect(canTransitionPackLifecycle('downloading', 'complete')).toBe(true);
    expect(canTransitionPackLifecycle('downloading', 'paused')).toBe(true);
    expect(canTransitionPackLifecycle('downloading', 'storage_full')).toBe(true);
    expect(canTransitionPackLifecycle('downloading', 'partial')).toBe(true);
    expect(canTransitionPackLifecycle('complete', 'stale')).toBe(true);
    expect(canTransitionPackLifecycle('stale', 'downloading')).toBe(true);
    expect(canTransitionPackLifecycle('failed', 'queued')).toBe(true);

    // Blocked invalid transitions
    expect(canTransitionPackLifecycle('complete', 'queued')).toBe(false);
    expect(canTransitionPackLifecycle('stale', 'paused')).toBe(false);
    expect(canTransitionPackLifecycle('storage_full', 'complete')).toBe(false);
    expect(canTransitionPackLifecycle('paused', 'complete')).toBe(false);
  });

  test('covers full approved R6 safety matrix without public dispatch claims (R6-1 & R6-3)', () => {
    const validTiers: SafetyEvidenceTier[] = [
      'local_device_armed',
      'mesh_peer_observed',
      'capability_unavailable',
      'stand_down_cancelled',
    ];

    allSafetyFixtures.forEach((fixture) => {
      expect(validTiers).toContain(fixture.evidenceTier);
      // R6 safety fixtures must never claim public dispatch
      expect((fixture as unknown as Record<string, unknown>).humanDispatcherReceipt).toBeUndefined();
    });

    const meshFixture = allSafetyFixtures.find((f) => f.evidenceTier === 'mesh_peer_observed');
    expect(meshFixture).toBeDefined();
    expect(meshFixture?.meshPeersObserved).toBeGreaterThanOrEqual(0);

    const cancelledFixture = allSafetyFixtures.find((f) => f.evidenceTier === 'stand_down_cancelled');
    expect(cancelledFixture?.isCancelled).toBe(true);
  });

  test('validates locale, long Devanagari strings, Nepal timezone, and AD/BS calendar fixtures (R6-1)', () => {
    expect(localeEnFixture.code).toBe('en');
    expect(localeNeFixture.code).toBe('ne');
    expect(localeHiFixture.code).toBe('hi');

    // Long Devanagari string verification
    expect(longDevanagariAddressFixture.fullAddressNepali.length).toBeGreaterThan(40);

    // Nepal UTC+5:45 timezone check
    expect(nepalTimezoneFixture.ianaTimezone).toBe('Asia/Kathmandu');
    expect(nepalTimezoneFixture.utcOffsetMinutes).toBe(345);

    // AD/BS dual calendar fixtures
    expect(calendarTestFixtures.length).toBe(3);
    expect(calendarTestFixtures[0].bikramSambatBs).toBe('२०८३ भाद्र ०४');
    expect(calendarTestFixtures[0].gregorianDateAd).toBe('2026-08-20');
  });
});
