import { primitive, themes, routePresentation, safety } from '../design/tokens';

describe('RideJaunm Design Tokens & Theme Specification', () => {
  test('strictly isolates emergency SOS red token (#FF1F3D)', () => {
    expect(primitive.color.sos[500]).toBe('#FF1F3D');
    expect(primitive.color.volt[400]).toBe('#B4FF39');
    expect(primitive.color.cyan[400]).toBe('#22C9EE');
    expect(primitive.color.route.supercurvy).toBe('#C25CFF');
  });

  test('contains all 4 required theme modes', () => {
    expect(themes.night).toBeDefined();
    expect(themes.dayGlare).toBeDefined();
    expect(themes.dusk).toBeDefined();
    expect(themes.blackout).toBeDefined();
  });

  test('quad-codes all 3 route modes with unique colors and labels', () => {
    expect(routePresentation.straight.color).toBe(primitive.color.route.straight);
    expect(routePresentation.curvy.color).toBe(primitive.color.route.curvy);
    expect(routePresentation.supercurvy.color).toBe(primitive.color.route.supercurvy);
    expect(routePresentation.supercurvy.lineDasharray).toBeDefined();
  });

  test('satisfies safety durations and target sizing invariants', () => {
    expect(safety.sos.holdMs).toBe(3000);
    expect(safety.sos.cancelWindowMs).toBe(10000);
    expect(safety.sos.target).toBe(88);
    expect(primitive.size.targetInRide).toBe(56);
    expect(primitive.size.targetMin).toBe(48);
  });
});
