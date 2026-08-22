import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { MapSurface } from '../components/map/MapSurface';
import { ThemeProvider } from '../design/ThemeProvider';
import { ThemeMode } from '../design/tokens';
import {
  mapFreshKathmanduFixture,
  mapStaleMustangFixture,
  mapPartialManangFixture,
  mapLoadingFixture,
  mapUnavailableDolpaFixture,
  mapErrorFixture,
  allMapFixtures,
} from '../fixtures/map.fixture';

describe('RideJaunm R7 Visual MapSurface Composite Component', () => {
  test('renders fresh map state with coordinate telemetry and OSM attribution', async () => {
    const view = await render(
      <ThemeProvider initialMode="night">
        <MapSurface input={mapFreshKathmanduFixture} />
      </ThemeProvider>
    );

    expect(view.getByText(/N 27.6775° · E 85.3486°/)).toBeTruthy();
    expect(view.getByText(/Online Policy \(Simulated\)/)).toBeTruthy();
    expect(view.getByText(/© OpenStreetMap contributors · ODbL/)).toBeTruthy();
  });

  test('renders stale map fixture with disclosure banner and cache provenance', async () => {
    const view = await render(
      <ThemeProvider initialMode="night">
        <MapSurface input={mapStaleMustangFixture} />
      </ThemeProvider>
    );

    expect(view.getByText('STALE MAP CACHE')).toBeTruthy();
    expect(view.getByText(/OSM-NP-2026.05.10/)).toBeTruthy();
    expect(view.getByText(/Cached map expired/)).toBeTruthy();
    expect(view.getByText(/© OpenStreetMap contributors · ODbL/)).toBeTruthy();
  });

  test('renders partial coverage map with hatched wireframe and missing area label', async () => {
    const view = await render(
      <ThemeProvider initialMode="night">
        <MapSurface input={mapPartialManangFixture} />
      </ThemeProvider>
    );

    expect(view.getByText('PARTIAL OFFLINE COVERAGE')).toBeTruthy();
    expect(
      view.getByText(/Thorong La Pass & High Camp \(Above 4,800m ASL\)/)
    ).toBeTruthy();
    expect(view.getByText(/Base coverage rendered/)).toBeTruthy();
    expect(view.getByText(/© OpenStreetMap contributors · ODbL/)).toBeTruthy();
  });

  test('renders loading state with initializing indicator and truthful synthetic message', async () => {
    const view = await render(
      <ThemeProvider initialMode="night">
        <MapSurface input={mapLoadingFixture} />
      </ThemeProvider>
    );

    expect(view.getByText('INITIALIZING OFFLINE MAP...')).toBeTruthy();
    expect(view.getByText(/Loading offline topographic contours/)).toBeTruthy();
    expect(view.getByText(/© OpenStreetMap contributors · ODbL/)).toBeTruthy();
  });

  test('renders unavailable offline sector state with truthful missing message', async () => {
    const view = await render(
      <ThemeProvider initialMode="night">
        <MapSurface input={mapUnavailableDolpaFixture} />
      </ThemeProvider>
    );

    expect(view.getByText('UNCACHED SECTOR')).toBeTruthy();
    expect(
      view.getByText(/Offline map sector missing for Upper Dolpa & Shey Phoksundo Corridor/)
    ).toBeTruthy();
    expect(view.getByText(/© OpenStreetMap contributors · ODbL/)).toBeTruthy();
  });

  test('renders error state and invokes onRetry callback when button is pressed', async () => {
    const handleRetry = jest.fn();

    const view = await render(
      <ThemeProvider initialMode="night">
        <MapSurface input={mapErrorFixture} onRetry={handleRetry} />
      </ThemeProvider>
    );

    expect(view.getByText('RENDER FAULT')).toBeTruthy();
    expect(view.getByText('Render Fault')).toBeTruthy();

    const retryBtn = view.getByText('RETRY MAP RENDER');
    expect(retryBtn).toBeTruthy();

    fireEvent.press(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);

    expect(view.getByText(/© OpenStreetMap contributors · ODbL/)).toBeTruthy();
  });

  test('ensures mandatory OpenStreetMap attribution is visible across EVERY base state', async () => {
    for (const fixture of allMapFixtures) {
      const view = await render(
        <ThemeProvider initialMode="night">
          <MapSurface input={fixture} />
        </ThemeProvider>
      );

      const attributionElement = view.getByText(/© OpenStreetMap contributors · ODbL/);
      expect(attributionElement).toBeTruthy();
    }
  });

  test('renders cleanly and without errors across all 4 theme modes (night, dayGlare, dusk, blackout)', async () => {
    const themes: ThemeMode[] = ['night', 'dayGlare', 'dusk', 'blackout'];

    for (const mode of themes) {
      const view = await render(
        <ThemeProvider initialMode={mode}>
          <MapSurface input={mapFreshKathmanduFixture} />
        </ThemeProvider>
      );

      expect(view.getByText(/N 27.6775° · E 85.3486°/)).toBeTruthy();
      expect(view.getByText(/© OpenStreetMap contributors · ODbL/)).toBeTruthy();
    }
  });
});
