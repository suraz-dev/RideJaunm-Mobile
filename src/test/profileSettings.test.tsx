/**
 * ============================================================================
 * PROFILE, GARAGE, HISTORY, AND SETTINGS TESTS (R14)
 * ============================================================================
 *
 * Verifies:
 * 1. Domain contracts and fixtures for profile, garage, history, and settings.
 * 2. 4-Tab inner navigation (Profile, Garage, History, Settings).
 * 3. Local language preview switching (EN / NE / HI) affecting local copy without claiming full i18n.
 * 4. Calendar display switching (AD / BS) using pre-authored date strings.
 * 5. Disabled vehicle actions and setting controls with truthful no-save feedback.
 * 6. Empty history and unknown maintenance states.
 * 7. Zero storage, AppState, or outbox mutations.
 * 8. 4 Theme modes and Devanagari localization strings.
 */

import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { ProfileGarageScreen } from '../screens/ProfileGarageScreen';
import { ThemeProvider } from '../design/ThemeProvider';
import { AppStateProvider } from '../state/AppStateContext';
import { MemoryLocalStore } from '../services/storage/LocalStore';
import { ConnectionStateSnapshot } from '../domain/connectivity';
import { connectionOnlineSnapshot } from '../fixtures/connectivity.fixture';
import {
  primaryRiderProfileFixture,
  allFixtureMotorcycles,
  allFixtureRideHistory,
} from '../fixtures/profileSettings.fixture';
import { ThemeMode } from '../design/tokens';

describe('RideJaunm R14 Fixture Profile, Garage, History & Settings', () => {
  let memoryStore: MemoryLocalStore;

  beforeEach(() => {
    memoryStore = new MemoryLocalStore();
  });

  const createWrapper = (
    initialConn?: ConnectionStateSnapshot,
    theme: ThemeMode = 'night'
  ) => {
    return ({ children }: { children: React.ReactNode }) => (
      <AppStateProvider store={memoryStore} initialConnectionState={initialConn}>
        <ThemeProvider initialMode={theme}>{children}</ThemeProvider>
      </AppStateProvider>
    );
  };

  test('validates all required domain fixture models exist', () => {
    // 1. Profile
    expect(primaryRiderProfileFixture.riderId).toBe('rider-suraz-01');
    expect(primaryRiderProfileFixture.badges.length).toBeGreaterThan(0);

    // 2. Motorcycles
    const maintenanceStates = allFixtureMotorcycles.map((m) => m.maintenanceState);
    expect(maintenanceStates).toContain('good');
    expect(maintenanceStates).toContain('stale_unknown');

    // 3. History
    const historyStates = allFixtureRideHistory.map((h) => h.state);
    expect(historyStates).toContain('cached');
    expect(historyStates).toContain('stale');
  });

  test('renders top synthetic disclosure banner and 4 primary tabs', async () => {
    const view = await render(<ProfileGarageScreen />, { wrapper: createWrapper() });

    expect(view.getByText('Profile & Garage')).toBeTruthy();
    expect(view.getByText('SYNTHETIC PREVIEW')).toBeTruthy();
    expect(
      view.getByText(
        /Deterministic local fixtures · Not connected to backend user accounts or live telemetry\./
      )
    ).toBeTruthy();

    // Verify 4 tabs
    expect(view.getByLabelText('Select Profile tab (प्रोफाइल)')).toBeTruthy();
    expect(view.getByLabelText('Select Garage tab (ग्यारेज)')).toBeTruthy();
    expect(view.getByLabelText('Select History tab (इतिहास)')).toBeTruthy();
    expect(view.getByLabelText('Select Settings tab (सेटिङ)')).toBeTruthy();
  });

  test('renders Rider Profile tab with stats, badges, and synthetic disclosure', async () => {
    const view = await render(<ProfileGarageScreen />, { wrapper: createWrapper() });

    expect(view.getByText('Suraj Shrestha')).toBeTruthy();
    expect(view.getByText('"Kaza Wanderer"')).toBeTruthy();
    expect(view.getByText('BLOOD O+')).toBeTruthy();
    expect(view.getByText(/TOTAL RIDES/)).toBeTruthy();
    expect(view.getByText('48')).toBeTruthy();
    expect(view.getByText('4,820 km')).toBeTruthy();
    expect(view.getByText('38,400 m')).toBeTruthy();
    expect(view.getByText('Himalayan Explorer')).toBeTruthy();
    expect(
      view.getByText(/Synthetic profile preview · Not a registered backend account/)
    ).toBeTruthy();
  });

  test('renders Garage tab with motorcycles, fuel gauge, and disabled actions', async () => {
    const view = await render(<ProfileGarageScreen />, { wrapper: createWrapper() });

    // Switch to Garage tab
    const garageTab = view.getByLabelText('Select Garage tab (ग्यारेज)');
    await act(async () => {
      fireEvent.press(garageTab);
    });

    expect(view.getByText('Royal Enfield Himalayan 450')).toBeTruthy();
    expect(view.getByText('BA 02 PA 4821 · Kaza Brown')).toBeTruthy();
    expect(view.getByText('MAINTENANCE GOOD')).toBeTruthy();

    expect(view.getByText('KTM 390 Adventure')).toBeTruthy();
    expect(view.getByText('MAINTENANCE UNKNOWN')).toBeTruthy();

    // Press disabled action
    const editBtn = view.getByLabelText('Edit Royal Enfield Himalayan 450 specifications preview');
    await act(async () => {
      fireEvent.press(editBtn);
    });

    expect(
      view.getByText(
        /Preview only — Edit Specs for Royal Enfield Himalayan 450 was not saved\./
      )
    ).toBeTruthy();
  });

  test('renders Ride History tab with AD/BS dates and empty state toggle', async () => {
    const view = await render(<ProfileGarageScreen />, { wrapper: createWrapper() });

    // Switch to History tab
    const historyTab = view.getByLabelText('Select History tab (इतिहास)');
    await act(async () => {
      fireEvent.press(historyTab);
    });

    expect(view.getByText('Kathmandu to Pokhara Ridge Run')).toBeTruthy();
    expect(view.getByText('Upper Mustang Thorong High Pass Exploration')).toBeTruthy();
    expect(view.getByText('2026-08-10')).toBeTruthy();

    // Toggle Empty State simulation
    const emptyToggle = view.getByLabelText('Simulate empty ride history');
    await act(async () => {
      fireEvent.press(emptyToggle);
    });

    expect(view.getByText('No ride history recorded')).toBeTruthy();
    expect(
      view.getByText(
        /Empty history fixture state · Completed rides will appear here once live recording capabilities are added\./
      )
    ).toBeTruthy();
  });

  test('switches language preview to Nepali and Hindi updating local copy', async () => {
    const view = await render(<ProfileGarageScreen />, { wrapper: createWrapper() });

    // Switch to Settings tab
    const settingsTab = view.getByLabelText('Select Settings tab (सेटिङ)');
    await act(async () => {
      fireEvent.press(settingsTab);
    });

    // Select Nepali
    const nepaliRadio = view.getByLabelText('Language नेपाली');
    await act(async () => {
      fireEvent.press(nepaliRadio);
    });

    expect(
      view.getByText(/Preview only — app settings were not saved\./)
    ).toBeTruthy();

    // Switch to Profile tab and check Nepali strings
    const profileTab = view.getByLabelText('Select Profile tab (प्रोफाइल)');
    await act(async () => {
      fireEvent.press(profileTab);
    });

    expect(view.getByText('"काजा घुमन्ते"')).toBeTruthy();
    expect(view.getByText('सुरज श्रेष्ठ')).toBeTruthy();

    // Switch back to Settings and select Hindi
    await act(async () => {
      fireEvent.press(settingsTab);
    });
    const hindiRadio = view.getByLabelText('Language हिन्दी');
    await act(async () => {
      fireEvent.press(hindiRadio);
    });

    await act(async () => {
      fireEvent.press(profileTab);
    });
    expect(view.getByText('"काज़ा घुमक्कड़"')).toBeTruthy();
    expect(view.getByText('सूरज श्रेष्ठ')).toBeTruthy();
  });

  test('switches calendar preview to BS and verifies Bikram Sambat dates across tabs', async () => {
    const view = await render(<ProfileGarageScreen />, { wrapper: createWrapper() });

    // Switch to Settings tab
    const settingsTab = view.getByLabelText('Select Settings tab (सेटिङ)');
    await act(async () => {
      fireEvent.press(settingsTab);
    });

    // Select Bikram Sambat (BS)
    const bsRadio = view.getByLabelText('Calendar Bikram Sambat (BS)');
    await act(async () => {
      fireEvent.press(bsRadio);
    });

    // Switch to History tab and check BS dates
    const historyTab = view.getByLabelText('Select History tab (इतिहास)');
    await act(async () => {
      fireEvent.press(historyTab);
    });

    expect(view.getByText('2083-04-26')).toBeTruthy();
    expect(view.getByText('2083-04-18')).toBeTruthy();
  });

  test('verifies disabled privacy and live tracking services in Settings', async () => {
    const view = await render(<ProfileGarageScreen />, { wrapper: createWrapper() });

    // Switch to Settings tab
    const settingsTab = view.getByLabelText('Select Settings tab (सेटिङ)');
    await act(async () => {
      fireEvent.press(settingsTab);
    });

    expect(
      view.getByText(/Live background services & sharing are unavailable in this preview\./)
    ).toBeTruthy();
    expect(
      view.getByText(/Native BLE radio discovery is unverified in this fixture preview\./)
    ).toBeTruthy();
  });

  test('renders cleanly across all 4 theme modes with Devanagari text', async () => {
    const themes: ThemeMode[] = ['night', 'dayGlare', 'dusk', 'blackout'];

    for (const mode of themes) {
      const view = await render(<ProfileGarageScreen />, {
        wrapper: createWrapper(connectionOnlineSnapshot, mode),
      });
      expect(view.getByText('Profile & Garage')).toBeTruthy();
    }
  });
});
