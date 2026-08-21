import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { TripPlannerScreen } from '../screens/TripPlannerScreen';
import { ThemeProvider } from '../design/ThemeProvider';
import { AppStateProvider } from '../state/AppStateContext';
import { MemoryLocalStore } from '../services/storage/LocalStore';
import { ConnectionStateSnapshot } from '../domain/connectivity';
import { connectionDeadZoneSnapshot } from '../fixtures/connectivity.fixture';
import { ThemeMode } from '../design/tokens';

describe('RideJaunm R10 Trip Planner & Route Comparison', () => {
  let memoryStore: MemoryLocalStore;

  beforeEach(() => {
    memoryStore = new MemoryLocalStore();
  });

  const createWrapper = (initialConn?: ConnectionStateSnapshot) => {
    return ({ children }: { children: React.ReactNode }) => (
      <AppStateProvider store={memoryStore} initialConnectionState={initialConn}>
        <ThemeProvider initialMode="night">{children}</ThemeProvider>
      </AppStateProvider>
    );
  };

  test('renders TripPlannerScreen with default Kathmandu to Pokhara candidates, Curvy default, and provenance disclosure', async () => {
    const view = await render(<TripPlannerScreen />, { wrapper: createWrapper() });

    expect(view.getByText('Trip Planner (यात्रा योजना)')).toBeTruthy();
    expect(view.getAllByText(/Kathmandu/).length).toBeGreaterThanOrEqual(1);
    expect(view.getAllByText(/Pokhara/).length).toBeGreaterThanOrEqual(1);
    expect(view.getAllByText(/Curvy: Prithvi Highway/).length).toBeGreaterThanOrEqual(1);
    expect(view.getByText(/Straight: Express Valley Corridor/)).toBeTruthy();
    expect(view.getByText(/Supercurvy: High Pass Mountain Route/)).toBeTruthy();

    // Provenance disclosure
    expect(view.getAllByText(/Source: NP-ROUTING-2026.08.15/).length).toBeGreaterThanOrEqual(1);

    // Synthetic map preview is rendered
    expect(view.getByText('SYNTHETIC FIXTURE ROUTE TRACE PREVIEW')).toBeTruthy();
  });

  test('allows editing Origin location via local catalog search', async () => {
    const view = await render(<TripPlannerScreen />, { wrapper: createWrapper() });

    const changeOriginBtn = view.getByLabelText('Change trip origin location');
    expect(changeOriginBtn).toBeTruthy();

    await act(async () => {
      fireEvent.press(changeOriginBtn);
    });

    const originInput = view.getByPlaceholderText(/Search Nepal origin/);
    await act(async () => {
      fireEvent.changeText(originInput, 'Biratnagar');
    });

    const biratnagarOption = view.getByLabelText('Select origin: Biratnagar');
    await act(async () => {
      fireEvent.press(biratnagarOption);
    });

    expect(view.getAllByText(/Biratnagar/).length).toBeGreaterThanOrEqual(1);
  });

  test('switches between Solo and Squad planning intent with R11 handoff notice', async () => {
    const view = await render(<TripPlannerScreen />, { wrapper: createWrapper() });

    const squadTab = view.getByText(/Squad Ride/);
    await act(async () => {
      fireEvent.press(squadTab);
    });

    expect(view.getByText('TASK R11 HANDOFF PREVIEW')).toBeTruthy();
    expect(view.getByText(/Himalayan Ridge Riders Squad/)).toBeTruthy();
    expect(
      view.getByText(/Group roster, member invites, and live rally coordination will be activated in Task R11./)
    ).toBeTruthy();

    const soloTab = view.getByText(/Solo Ride/);
    await act(async () => {
      fireEvent.press(soloTab);
    });
    expect(view.queryByText('TASK R11 HANDOFF PREVIEW')).toBeNull();
  });

  test('searches local Nepal places catalogue, selects Janakpur (Terai corridor), and preserves Curvy as default', async () => {
    const view = await render(<TripPlannerScreen />, { wrapper: createWrapper() });

    const changeDestBtn = view.getByLabelText('Change trip destination location');
    await act(async () => {
      fireEvent.press(changeDestBtn);
    });

    const searchInput = view.getByPlaceholderText(/Search Nepal destination/);
    await act(async () => {
      fireEvent.changeText(searchInput, 'Janakpur');
    });

    const janakpurResult = view.getByLabelText('Select destination: Janakpurdham');
    expect(janakpurResult).toBeTruthy();

    await act(async () => {
      fireEvent.press(janakpurResult);
    });

    // Terai corridor disables Supercurvy with explicit reason
    expect(view.getAllByText(/Janakpurdham/).length).toBeGreaterThanOrEqual(1);
    expect(view.getByText(/Supercurvy \(UNAVAILABLE\)/)).toBeTruthy();
    expect(
      view.getByText(/Not enough bends: Terai flat plains corridor has no mountain twisties/)
    ).toBeTruthy();

    // Preserves Curvy as default selected candidate
    expect(view.getAllByText(/Curvy: Chure Foothill Bypass/).length).toBeGreaterThanOrEqual(1);
  });

  test('handles no search results gracefully against synthetic catalogue', async () => {
    const view = await render(<TripPlannerScreen />, { wrapper: createWrapper() });

    const changeDestBtn = view.getByLabelText('Change trip destination location');
    await act(async () => {
      fireEvent.press(changeDestBtn);
    });

    const searchInput = view.getByPlaceholderText(/Search Nepal destination/);
    await act(async () => {
      fireEvent.changeText(searchInput, 'NonExistentCity123');
    });

    expect(view.getByText('No places found in Nepal fixture catalog.')).toBeTruthy();
  });

  test('renders visible offline-catalogue search state when in dead zone or offline mode', async () => {
    const view = await render(
      <TripPlannerScreen forceOfflineSearchState={true} />,
      { wrapper: createWrapper(connectionDeadZoneSnapshot) }
    );

    const changeDestBtn = view.getByLabelText('Change trip destination location');
    await act(async () => {
      fireEvent.press(changeDestBtn);
    });

    // Explicitly asserts visible offline catalogue badge and banner
    expect(view.getByText('OFFLINE FIXTURE CATALOGUE')).toBeTruthy();
    expect(
      view.getByText(/Offline Mode · Searching local pre-loaded synthetic Nepal places only/)
    ).toBeTruthy();
    expect(
      view.getByText(/No cellular network connection · Operating from local fixture storage/)
    ).toBeTruthy();

    // Offline pack badge on items
    expect(view.getAllByText('OFFLINE PACK').length).toBeGreaterThanOrEqual(1);
  });

  test('discloses Upper Mustang permit restriction when Mustang destination is selected', async () => {
    const view = await render(<TripPlannerScreen />, { wrapper: createWrapper() });

    const changeDestBtn = view.getByLabelText('Change trip destination location');
    await act(async () => {
      fireEvent.press(changeDestBtn);
    });

    const searchInput = view.getByPlaceholderText(/Search Nepal destination/);
    await act(async () => {
      fireEvent.changeText(searchInput, 'Mustang');
    });

    const mustangResult = view.getByLabelText('Select destination: Lo Manthang (Upper Mustang)');
    await act(async () => {
      fireEvent.press(mustangResult);
    });

    expect(view.getByText('⚠️ PERMIT REQUIRED')).toBeTruthy();
    expect(
      view.getByText(/ACAP & Restricted Area Permit \(RAP\) mandatory north of Kagbeni checkpoint/)
    ).toBeTruthy();
    expect(view.getByText(/Department of Immigration & NTNC Nepal/)).toBeTruthy();
  });

  test('supports adding, reordering (move up/down), and removing waypoints with confirmation/cancellation', async () => {
    const view = await render(<TripPlannerScreen />, { wrapper: createWrapper() });

    // Initial waypoints: Kurintar, Mugling
    expect(view.getAllByText('Kurintar High-Octane Fuel Checkpoint').length).toBeGreaterThanOrEqual(1);
    expect(view.getAllByText('Mugling Riverside Rider Hub').length).toBeGreaterThanOrEqual(1);

    // 1. Add suggested waypoint: Malekhu
    const addMalekhuBtn = view.getByLabelText('Add suggested stop: Malekhu Local Highway Rest Stop');
    await act(async () => {
      fireEvent.press(addMalekhuBtn);
    });
    expect(view.getAllByText('Malekhu Local Highway Rest Stop').length).toBeGreaterThanOrEqual(1);

    // 2. Reorder: Move Malekhu up (was #3, now #2)
    const moveUpBtns = view.getAllByLabelText(/Move stop .* earlier in route order/);
    await act(async () => {
      fireEvent.press(moveUpBtns[moveUpBtns.length - 1]); // Move up last item
    });

    // 3. Remove Kurintar with confirmation flow:
    const removeKurintarBtn = view.getByLabelText(/Remove stop Kurintar High-Octane Fuel Checkpoint/);
    await act(async () => {
      fireEvent.press(removeKurintarBtn);
    });

    // Confirmation prompt is visible
    expect(view.getByText('Remove stop Kurintar High-Octane Fuel Checkpoint?')).toBeTruthy();
    expect(view.getByText('YES, REMOVE')).toBeTruthy();
    expect(view.getByText('CANCEL')).toBeTruthy();

    // Test Cancel first
    const cancelBtn = view.getByText('CANCEL');
    await act(async () => {
      fireEvent.press(cancelBtn);
    });
    expect(view.getAllByText('Kurintar High-Octane Fuel Checkpoint').length).toBeGreaterThanOrEqual(1);

    // Trigger remove again and Confirm
    const removeAgainBtn = view.getByLabelText(/Remove stop Kurintar High-Octane Fuel Checkpoint/);
    await act(async () => {
      fireEvent.press(removeAgainBtn);
    });
    const confirmBtn = view.getByText('YES, REMOVE');
    await act(async () => {
      fireEvent.press(confirmBtn);
    });
    expect(view.queryByText('Kurintar High-Octane Fuel Checkpoint')).toBeNull();
  });

  test('toggles fixture map preview visibility', async () => {
    const view = await render(<TripPlannerScreen />, { wrapper: createWrapper() });

    expect(view.getByText('SYNTHETIC FIXTURE ROUTE TRACE PREVIEW')).toBeTruthy();

    const hideMapBtn = view.getByText('HIDE FIXTURE MAP (नक्सा लुकाउनुहोस्)');
    await act(async () => {
      fireEvent.press(hideMapBtn);
    });
    expect(view.queryByText('SYNTHETIC FIXTURE ROUTE TRACE PREVIEW')).toBeNull();

    const previewMapBtn = view.getByText('PREVIEW FIXTURE ROUTE (पूर्वावलोकन)');
    await act(async () => {
      fireEvent.press(previewMapBtn);
    });
    expect(view.getByText('SYNTHETIC FIXTURE ROUTE TRACE PREVIEW')).toBeTruthy();
  });

  test('renders cleanly across all 4 theme modes', async () => {
    const themes: ThemeMode[] = ['night', 'dayGlare', 'dusk', 'blackout'];

    for (const mode of themes) {
      const view = await render(
        <ThemeProvider initialMode={mode}>
          <TripPlannerScreen />
        </ThemeProvider>,
        { wrapper: createWrapper() }
      );
      expect(view.getByText('Trip Planner (यात्रा योजना)')).toBeTruthy();
    }
  });
});
