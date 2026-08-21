import React from 'react';
import { render } from '@testing-library/react-native';
import { RouteLayer } from '../components/map/RouteLayer';
import { MarkerLayer } from '../components/map/MarkerLayer';
import { ThemeProvider } from '../design/ThemeProvider';
import { ThemeMode } from '../design/tokens';
import {
  curvyRouteTraceFixture,
  supercurvyRouteTraceFixture,
  straightRouteTraceFixture,
  alternativeRouteTraceFixture,
  hazardDetourTraceFixture,
  lostRouteTraceFixture,
  nepalMapMarkersFixture,
} from '../fixtures/routeOverlays.fixture';

describe('RideJaunm R8 Map Overlays (RouteLayer & MarkerLayer)', () => {
  test('renders all 7 route semantics cleanly in RouteLayer', async () => {
    const allRoutes = [
      curvyRouteTraceFixture,
      supercurvyRouteTraceFixture,
      straightRouteTraceFixture,
      alternativeRouteTraceFixture,
      hazardDetourTraceFixture,
      { ...hazardDetourTraceFixture, id: 'detour-01', semantic: 'detour' as const },
      lostRouteTraceFixture,
    ];

    const view = await render(
      <ThemeProvider initialMode="night">
        <RouteLayer routes={allRoutes} />
      </ThemeProvider>
    );

    expect(view.toJSON()).toBeTruthy();
  });

  test('renders accessible markers for Origin, Destination, Waypoint, and Hazard', async () => {
    const view = await render(
      <ThemeProvider initialMode="night">
        <MarkerLayer markers={nepalMapMarkersFixture} />
      </ThemeProvider>
    );

    expect(view.getByLabelText(/origin marker: Kathmandu/)).toBeTruthy();
    expect(view.getByLabelText(/destination marker: Pokhara/)).toBeTruthy();
    expect(view.getByLabelText(/waypoint marker: Mugling Junction/)).toBeTruthy();
    expect(view.getByLabelText(/hazard marker: Kurintar Landslide Risk/)).toBeTruthy();

    expect(view.getByText('Kathmandu (Koteshwor)')).toBeTruthy();
    expect(view.getByText('Pokhara (Lakeside)')).toBeTruthy();
    expect(view.getByText('Mugling Junction')).toBeTruthy();
    expect(view.getByText('Kurintar Landslide Risk')).toBeTruthy();
  });

  test('renders RouteLayer and MarkerLayer cleanly across all 4 themes', async () => {
    const themes: ThemeMode[] = ['night', 'dayGlare', 'dusk', 'blackout'];

    for (const mode of themes) {
      const view = await render(
        <ThemeProvider initialMode={mode}>
          <RouteLayer routes={[curvyRouteTraceFixture, alternativeRouteTraceFixture]} />
          <MarkerLayer markers={nepalMapMarkersFixture} />
        </ThemeProvider>
      );

      expect(view.getByText('Kathmandu (Koteshwor)')).toBeTruthy();
      expect(view.getByText('Pokhara (Lakeside)')).toBeTruthy();
    }
  });
});
