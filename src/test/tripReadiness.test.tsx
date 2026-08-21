import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { TripReadinessScreen } from '../screens/TripReadinessScreen';
import { TripPlannerScreen } from '../screens/TripPlannerScreen';
import { ThemeProvider } from '../design/ThemeProvider';
import { AppStateProvider } from '../state/AppStateContext';
import { MemoryLocalStore } from '../services/storage/LocalStore';
import { ConnectionStateSnapshot } from '../domain/connectivity';
import { connectionDeadZoneSnapshot } from '../fixtures/connectivity.fixture';
import {
  fixtureSquadMembers,
  fixtureTripReadinessChecklist,
} from '../fixtures/tripReadiness.fixture';
import { ThemeMode } from '../design/tokens';

describe('RideJaunm R11 Fixture Trip Readiness & Squad Planning Handoff', () => {
  let memoryStore: MemoryLocalStore;

  beforeEach(() => {
    memoryStore = new MemoryLocalStore();
  });

  const createWrapper = (initialConn?: ConnectionStateSnapshot, theme: ThemeMode = 'night') => {
    return ({ children }: { children: React.ReactNode }) => (
      <AppStateProvider store={memoryStore} initialConnectionState={initialConn}>
        <ThemeProvider initialMode={theme}>{children}</ThemeProvider>
      </AppStateProvider>
    );
  };

  test('validates stable fixture squad members and readiness checklist domain models', () => {
    expect(fixtureSquadMembers.length).toBeGreaterThanOrEqual(3);
    const memberIds = fixtureSquadMembers.map((m) => m.id);
    expect(memberIds).toContain('squad-member-bikash');
    expect(memberIds).toContain('squad-member-rabin');
    expect(memberIds).toContain('squad-member-suraj');

    expect(fixtureTripReadinessChecklist.length).toBe(6);
    const categories = fixtureTripReadinessChecklist.map((c) => c.category);
    expect(categories).toContain('route');
    expect(categories).toContain('offline_map');
    expect(categories).toContain('permit');
    expect(categories).toContain('fuel');
    expect(categories).toContain('weather');
    expect(categories).toContain('safety');

    // Weather must be in unknown state with non-live disclosure
    const weatherItem = fixtureTripReadinessChecklist.find((c) => c.category === 'weather');
    expect(weatherItem?.state).toBe('unknown');
    expect(weatherItem?.syntheticDisclosure).toContain('Not real-time weather');

    // Safety must not claim verified native mesh networking
    const safetyItem = fixtureTripReadinessChecklist.find((c) => c.category === 'safety');
    expect(safetyItem?.detail).toContain('Native BLE mesh protocol is unverified in this fixture preview');

    // Permit must state synthetic reference and verification with authorities
    const permitItem = fixtureTripReadinessChecklist.find((c) => c.category === 'permit');
    expect(permitItem?.detail).toContain('Requirements are not legally validated in this preview');
  });

  test('navigates from R10 TripPlanner Group Mode to R11 Readiness screen and back', async () => {
    const view = await render(<TripPlannerScreen />, { wrapper: createWrapper() });

    // 1. Switch to Squad Ride mode
    const squadTab = view.getByText(/Squad Ride/);
    await act(async () => {
      fireEvent.press(squadTab);
    });

    // 2. Open Squad Readiness Preview
    const openReadinessBtn = view.getByText('OPEN SQUAD READINESS PREVIEW (तयारी पूर्वावलोकन)');
    await act(async () => {
      fireEvent.press(openReadinessBtn);
    });

    // 3. Asserts on Readiness Screen
    expect(view.getByText('Fixture Trip Readiness — Local Preview')).toBeTruthy();
    expect(view.getByText('Squad Roster & Roles (टोली रोस्टर)')).toBeTruthy();

    // 4. Return back to Trip Planner
    const backBtn = view.getByLabelText('Back to Trip Planner screen');
    await act(async () => {
      fireEvent.press(backBtn);
    });

    expect(view.getByText('Trip Planner (यात्रा योजना)')).toBeTruthy();
  });

  test('allows local squad role reassignment and displays validation notice when lead/sweep missing', async () => {
    const view = await render(<TripReadinessScreen />, { wrapper: createWrapper() });

    expect(view.getByText('Bikash Shrestha')).toBeTruthy();
    expect(view.getByText('Rabin Gurung')).toBeTruthy();

    // Initially no validation error since Bikash is Lead and Rabin is Sweep
    expect(view.queryByText(/Role Validation:/)).toBeNull();

    // Reassign Bikash from Lead to Rider
    const bikashRiderOption = view.getByLabelText('Bikash Shrestha role: Rider (सवार)');
    await act(async () => {
      fireEvent.press(bikashRiderOption);
    });

    // Validation warning should now appear because there is no Lead
    expect(view.getByText(/⚠️ Role Validation: No Lead designated\./)).toBeTruthy();
  });

  test('triggers synthetic invite preview with truthful no-invitation-sent confirmation and permanent disclosures', async () => {
    const view = await render(<TripReadinessScreen />, { wrapper: createWrapper() });

    // Permanent disclosure present on all member cards
    expect(
      view.getAllByText('ℹ️ No invitation was sent · Synthetic roster preview only').length
    ).toBeGreaterThanOrEqual(3);

    // Existing ready members do NOT show "INVITE CONFIRMED"
    expect(view.queryByText('INVITE CONFIRMED')).toBeNull();
    expect(view.getAllByText('PREVIEW ROSTER ONLY').length).toBeGreaterThanOrEqual(1);

    // Anish starts as not_invited
    const anishInviteBtn = view.getByText('TRIGGER PREVIEW INVITE');
    await act(async () => {
      fireEvent.press(anishInviteBtn);
    });

    // Truthful feedback message is surfaced
    expect(view.getByText(/No invitation was sent · Synthetic preview only/)).toBeTruthy();
    expect(view.getByText('INVITATION PREVIEW PENDING')).toBeTruthy();
  });

  test('triggers synthetic save preview with truthful no-trip-saved confirmation', async () => {
    const view = await render(<TripReadinessScreen />, { wrapper: createWrapper() });

    const saveBtn = view.getByText('SAVE TRIP PREVIEW (पूर्वावलोकन सुरक्षित)');
    await act(async () => {
      fireEvent.press(saveBtn);
    });

    expect(view.getByText(/No trip was saved · Local preview only/)).toBeTruthy();
  });

  test('renders offline/mesh banner when in deadZone connection mode', async () => {
    const view = await render(<TripReadinessScreen />, {
      wrapper: createWrapper(connectionDeadZoneSnapshot),
    });

    expect(view.getByText('OFFLINE MESH MODE')).toBeTruthy();
    expect(view.getByText(/Operating in offline dead-zone \/ mesh mode\./)).toBeTruthy();
    expect(
      view.getByText(
        /All squad readiness facts are stored locally\. No remote syncing or invitation delivery performed\./
      )
    ).toBeTruthy();
  });

  test('renders all 6 readiness checklist categories with provenance disclosures', async () => {
    const view = await render(<TripReadinessScreen />, { wrapper: createWrapper() });

    expect(view.getByText('Route Candidate Armed')).toBeTruthy();
    expect(view.getByText('Offline Map Pack Advisory')).toBeTruthy();
    expect(view.getByText('Conservation Area Permit Notice (Synthetic Reference)')).toBeTruthy();
    expect(view.getByText('Mountain Fuel Gap (48 km)')).toBeTruthy();
    expect(view.getByText('Weather Baseline Advisory')).toBeTruthy();
    expect(view.getByText('Emergency Profile & Mesh Advisory')).toBeTruthy();

    expect(view.getAllByText(/Source: NP-ROUTING-2026.08.15/).length).toBeGreaterThanOrEqual(1);
    expect(
      view.getByText(/Synthetic baseline fixture only \(Not real-time weather\)/)
    ).toBeTruthy();
  });

  test('renders cleanly across all 4 theme modes', async () => {
    const themes: ThemeMode[] = ['night', 'dayGlare', 'dusk', 'blackout'];

    for (const mode of themes) {
      const view = await render(<TripReadinessScreen />, {
        wrapper: createWrapper(undefined, mode),
      });
      expect(view.getByText('Fixture Trip Readiness — Local Preview')).toBeTruthy();
    }
  });
});
