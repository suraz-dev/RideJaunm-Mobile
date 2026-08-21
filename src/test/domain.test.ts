import {
  kathmanduToPokharaCurvy,
  kathmanduToPokharaSupercurvy,
  kathmanduToPokharaStraight,
  teraiHighwayStraight,
  gpsLockedFixture,
  gpsAcquiringFixture,
  gpsStaleFixture,
  gpsLostFixture,
  mustangCircuitRegion,
  everestRegionDownloading,
  dolpaRegionStorageFull,
} from '../fixtures';
import { GpsLockState } from '../domain/connectivity';
import { OfflinePackLifecycle } from '../domain/offline';

describe('RideJaunm R6 Domain Models & Nepal Fixtures', () => {
  test('quad-codes 3 route candidates and flags Terai Supercurvy restriction', () => {
    expect(kathmanduToPokharaCurvy.profile).toBe('curvy');
    expect(kathmanduToPokharaCurvy.curvinessScore).toBeGreaterThan(7.0);

    expect(kathmanduToPokharaSupercurvy.profile).toBe('supercurvy');
    expect(kathmanduToPokharaSupercurvy.curvinessScore).toBeGreaterThan(9.0);

    expect(kathmanduToPokharaStraight.profile).toBe('straight');

    // Terai flat highway disables Supercurvy mode
    expect(teraiHighwayStraight.isSupercurvyRestrictedInTerai).toBe(true);
  });

  test('validates Nepal GPS freshness lifecycle transitions', () => {
    const validStates: GpsLockState[] = ['acquiring', 'locked', 'stale', 'lost'];

    expect(validStates).toContain(gpsAcquiringFixture.lockState);
    expect(validStates).toContain(gpsLockedFixture.lockState);
    expect(validStates).toContain(gpsStaleFixture.lockState);
    expect(validStates).toContain(gpsLostFixture.lockState);

    expect(gpsLockedFixture.accuracyMeters).toBeLessThanOrEqual(15);
    expect(gpsAcquiringFixture.accuracyMeters).toBeGreaterThan(15);
  });

  test('validates offline region pack lifecycle states', () => {
    const lifecycles: OfflinePackLifecycle[] = [
      'queued',
      'downloading',
      'paused',
      'partial',
      'complete',
      'stale',
      'failed',
      'storage_full',
    ];

    expect(lifecycles).toContain(mustangCircuitRegion.lifecycle);
    expect(lifecycles).toContain(everestRegionDownloading.lifecycle);
    expect(lifecycles).toContain(dolpaRegionStorageFull.lifecycle);

    expect(mustangCircuitRegion.includes3dElevation).toBe(true);
    expect(mustangCircuitRegion.includesHeliLandingZones).toBe(true);
    expect(dolpaRegionStorageFull.failureReason).toBeDefined();
  });
});
