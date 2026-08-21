import React from 'react';
import { render } from '@testing-library/react-native';
import { TelemetryHUD } from '../components/composites/TelemetryHUD';
import { ThemeProvider } from '../design/ThemeProvider';
import { ThemeMode } from '../design/tokens';
import {
  telemetryLockedPresentationFixture,
  telemetryAcquiringPresentationFixture,
  telemetryStalePresentationFixture,
  telemetryLostPresentationFixture,
} from '../fixtures/telemetryPresentation.fixture';

describe('RideJaunm R9 Truthful TelemetryHUD Component', () => {
  test('renders locked GPS state with numeric speed, altitude, and bearing', async () => {
    const view = await render(
      <ThemeProvider initialMode="night">
        <TelemetryHUD
          speedKmh={telemetryLockedPresentationFixture.speedKmh}
          altitudeMeters={telemetryLockedPresentationFixture.altitudeMeters}
          bearingDeg={telemetryLockedPresentationFixture.bearingDeg}
          gpsStatus={telemetryLockedPresentationFixture.gpsState}
          networkStatus="online"
          sourceLabel={telemetryLockedPresentationFixture.sourceLabel}
        />
      </ThemeProvider>
    );

    expect(view.getByText('GPS LOCKED')).toBeTruthy();
    expect(view.getByText('CELLULAR 4G')).toBeTruthy();
    expect(view.getByText('68')).toBeTruthy();
    expect(view.getByText(/1740/)).toBeTruthy();
    expect(view.getByText(/NE 45°/)).toBeTruthy();
    expect(view.getByText(/Simulated Local GPS Fix/)).toBeTruthy();
  });

  test('renders acquiring GPS state with non-numeric speed/bearing placeholder and never substitutes 0', async () => {
    const view = await render(
      <ThemeProvider initialMode="night">
        <TelemetryHUD
          speedKmh={telemetryAcquiringPresentationFixture.speedKmh}
          altitudeMeters={telemetryAcquiringPresentationFixture.altitudeMeters}
          bearingDeg={telemetryAcquiringPresentationFixture.bearingDeg}
          gpsStatus={telemetryAcquiringPresentationFixture.gpsState}
          networkStatus="online"
          sourceLabel={telemetryAcquiringPresentationFixture.sourceLabel}
        />
      </ThemeProvider>
    );

    expect(view.getByText('ACQUIRING GPS...')).toBeTruthy();
    expect(view.getByText('--')).toBeTruthy(); // Speed placeholder
    expect(view.getByText('--°')).toBeTruthy(); // Bearing placeholder
    expect(view.getByText(/1400/)).toBeTruthy();
  });

  test('renders stale GPS state with last-known disclosure banner and non-numeric speed placeholder', async () => {
    const view = await render(
      <ThemeProvider initialMode="night">
        <TelemetryHUD
          speedKmh={telemetryStalePresentationFixture.speedKmh}
          altitudeMeters={telemetryStalePresentationFixture.altitudeMeters}
          bearingDeg={telemetryStalePresentationFixture.bearingDeg}
          gpsStatus={telemetryStalePresentationFixture.gpsState}
          networkStatus="offline"
          sourceLabel={telemetryStalePresentationFixture.sourceLabel}
          observationAgeSeconds={telemetryStalePresentationFixture.observationAgeSeconds}
        />
      </ThemeProvider>
    );

    expect(view.getByText('LAST KNOWN FIX')).toBeTruthy();
    expect(view.getByText('OFFLINE CACHE')).toBeTruthy();
    expect(view.getByText('--')).toBeTruthy();
    expect(view.getByText(/2100/)).toBeTruthy();
    expect(view.getByText(/Last Known Fix \(3m ago · ±25m\)/)).toBeTruthy();
  });

  test('renders lost GPS state with non-numeric placeholders across all metrics', async () => {
    const view = await render(
      <ThemeProvider initialMode="night">
        <TelemetryHUD
          speedKmh={telemetryLostPresentationFixture.speedKmh}
          altitudeMeters={telemetryLostPresentationFixture.altitudeMeters}
          bearingDeg={telemetryLostPresentationFixture.bearingDeg}
          gpsStatus={telemetryLostPresentationFixture.gpsState}
          networkStatus="offline"
          sourceLabel={telemetryLostPresentationFixture.sourceLabel}
        />
      </ThemeProvider>
    );

    expect(view.getByText('GPS UNAVAILABLE')).toBeTruthy();
    expect(view.getByText('--')).toBeTruthy();
    expect(view.getByText('--°')).toBeTruthy();
    expect(view.getByText(/GPS Signal Unavailable/)).toBeTruthy();
  });

  test('renders TelemetryHUD cleanly across all 4 theme modes', async () => {
    const themes: ThemeMode[] = ['night', 'dayGlare', 'dusk', 'blackout'];

    for (const mode of themes) {
      const view = await render(
        <ThemeProvider initialMode={mode}>
          <TelemetryHUD
            speedKmh={68}
            altitudeMeters={1740}
            bearingDeg={45}
            gpsStatus="locked"
            networkStatus="online"
          />
        </ThemeProvider>
      );

      expect(view.getByText('GPS LOCKED')).toBeTruthy();
      expect(view.getByText('68')).toBeTruthy();
    }
  });
});
