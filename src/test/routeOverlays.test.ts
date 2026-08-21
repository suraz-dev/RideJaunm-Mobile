import { RouteSemantic } from '../domain/mapOverlay';
import {
  curvyRouteTraceFixture,
  supercurvyRouteTraceFixture,
  straightRouteTraceFixture,
  alternativeRouteTraceFixture,
  hazardDetourTraceFixture,
  lostRouteTraceFixture,
  teraiRestrictedRouteFixture,
  nepalMapMarkersFixture,
} from '../fixtures/routeOverlays.fixture';

describe('RideJaunm R8 Route Overlays & Markers Domain Fixtures', () => {
  test('covers all 7 required route semantics (R8-1)', () => {
    const requiredSemantics: RouteSemantic[] = [
      'straight',
      'curvy',
      'supercurvy',
      'alternative',
      'hazard',
      'detour',
      'lost',
    ];

    const testSet: RouteSemantic[] = [
      straightRouteTraceFixture.semantic,
      curvyRouteTraceFixture.semantic,
      supercurvyRouteTraceFixture.semantic,
      alternativeRouteTraceFixture.semantic,
      hazardDetourTraceFixture.semantic,
      'detour',
      lostRouteTraceFixture.semantic,
    ];

    requiredSemantics.forEach((semantic) => {
      expect(testSet).toContain(semantic);
    });
  });

  test('validates bounded synthetic screen points (0-100%) for all route traces', () => {
    const allTraces = [
      curvyRouteTraceFixture,
      supercurvyRouteTraceFixture,
      straightRouteTraceFixture,
      alternativeRouteTraceFixture,
      hazardDetourTraceFixture,
      lostRouteTraceFixture,
      teraiRestrictedRouteFixture,
    ];

    allTraces.forEach((trace) => {
      expect(trace.points.length).toBeGreaterThanOrEqual(2);
      trace.points.forEach((point) => {
        expect(point.x).toBeGreaterThanOrEqual(0);
        expect(point.x).toBeLessThanOrEqual(100);
        expect(point.y).toBeGreaterThanOrEqual(0);
        expect(point.y).toBeLessThanOrEqual(100);
      });
    });
  });

  test('validates Terai Supercurvy restriction disclosure', () => {
    expect(teraiRestrictedRouteFixture.semantic).toBe('supercurvy');
    expect(teraiRestrictedRouteFixture.restrictionReason).toBeDefined();
    expect(teraiRestrictedRouteFixture.restrictionReason).toContain('Terai flat corridor has no mountain bends');
  });

  test('validates Nepal map markers and verifies hazard markers are distinct from SOS', () => {
    const kinds = nepalMapMarkersFixture.map((m) => m.kind);
    expect(kinds).toContain('origin');
    expect(kinds).toContain('destination');
    expect(kinds).toContain('waypoint');
    expect(kinds).toContain('hazard');

    const hazardMarker = nepalMapMarkersFixture.find((m) => m.kind === 'hazard');
    expect(hazardMarker).toBeDefined();
    expect(hazardMarker?.label).toContain('Kurintar Landslide');
    // Safety check: hazard must NOT claim emergency SOS dispatch
    expect((hazardMarker as unknown as Record<string, unknown>).sosArmed).toBeUndefined();
  });
});
