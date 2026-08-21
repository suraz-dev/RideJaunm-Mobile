import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { MapSurface } from '../components/map/MapSurface';
import { ThemeProvider } from '../design/ThemeProvider';
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
    expect(view.getByText(/© OpenStreetMap contributors · ODbL/)).toBeTruthy();
  });

  test('renders stale map state with disclosure banner and cache provenance', async () => {
    const view = await render(
      <ThemeProvider initialMode="night">
        <MapSurface input={mapStaleMustangFixture} />
      </ThemeProvider>
    );

    expect(view.getByText('⚠️ STALE MAP CACHE')).toBeTruthy();
    expect(view.getByText(/OSM-NP-2026.05.10/)).toBeTruthy();
    expect(view.getByText(/Local vector cache expired/)).toBeTruthy();
    expect(view.getByText(/© OpenStreetMap contributors · ODbL/)).toBeTruthy();
  });

  test('renders partial coverage map with hatched wireframe and missing area label', async () => {
    const view = await render(
      <ThemeProvider initialMode="night">
        <MapSurface input={mapPartialManangFixture} />
      </ThemeProvider>
    );

    expect(view.getByText('⚠️ PARTIAL OFFLINE COVERAGE')).toBeTruthy();
    expect(
      view.getByText(/Thorong La Pass & High Camp \(Above 4,800m ASL\)/)
    ).toBeTruthy();
    expect(view.getByText(/Cached valley base rendered/)).toBeTruthy();
    expect(view.getByText(/© OpenStreetMap contributors · ODbL/)).toBeTruthy();
  });

  test('renders loading state with initializing indicator and message', async () => {
    const view = await render(
      <ThemeProvider initialMode="night">
        <MapSurface input={mapLoadingFixture} />
      </ThemeProvider>
    );

    expect(view.getByText('INITIALIZING VECTOR TILES...')).toBeTruthy();
    expect(view.getByText(/Loading topographic elevation contours/)).toBeTruthy();
    expect(view.getByText(/© OpenStreetMap contributors · ODbL/)).toBeTruthy();
  });

  test('renders unavailable offline sector state with truthful missing message', async () => {
    const view = await render(
      <ThemeProvider initialMode="night">
        <MapSurface input={mapUnavailableDolpaFixture} />
      </ThemeProvider>
    );

    expect(view.getByText('OFFLINE SECTOR UNCACHED')).toBeTruthy();
    expect(
      view.getByText(/No cached map pack found for Upper Dolpa & Shey Phoksundo Corridor/)
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
    expect(view.getByText('Unable to Render Vector Mesh')).toBeTruthy();

    const retryBtn = view.getByText('RETRY VECTOR RENDER');
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

  test('renders high-contrast solid surfaces in Day-Glare sunlight mode', async () => {
    const view = await render(
      <ThemeProvider initialMode="dayGlare">
        <MapSurface input={mapFreshKathmanduFixture} />
      </ThemeProvider>
    );

    expect(view.getByText(/N 27.6775° · E 85.3486°/)).toBeTruthy();
    expect(view.getByText(/© OpenStreetMap contributors · ODbL/)).toBeTruthy();
  });
});
