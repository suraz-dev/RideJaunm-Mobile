import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { TripPlannerScreen } from '../screens/TripPlannerScreen';
import { ThemeProvider } from '../design/ThemeProvider';
import { ThemeMode } from '../design/tokens';

describe('RideJaunm R10 Trip Planner & Route Comparison', () => {
  test('renders TripPlannerScreen with default Kathmandu to Pokhara candidates and Curvy selected', async () => {
    const view = await render(
      <ThemeProvider initialMode="night">
        <TripPlannerScreen />
      </ThemeProvider>
    );

    expect(view.getByText('Trip Planner (यात्रा योजना)')).toBeTruthy();
    expect(view.getByText(/Kathmandu/)).toBeTruthy();
    expect(view.getByText(/Pokhara/)).toBeTruthy();
    expect(view.getAllByText(/Curvy: Prithvi Highway/).length).toBeGreaterThanOrEqual(1);
    expect(view.getByText(/Straight: Express Valley Corridor/)).toBeTruthy();
    expect(view.getByText(/Supercurvy: High Pass Mountain Route/)).toBeTruthy();
  });

  test('switches between Solo and Squad planning intent with R11 handoff notice', async () => {
    const view = await render(
      <ThemeProvider initialMode="night">
        <TripPlannerScreen />
      </ThemeProvider>
    );

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

  test('searches local Nepal places catalogue and selects Janakpur (Terai corridor)', async () => {
    const view = await render(
      <ThemeProvider initialMode="night">
        <TripPlannerScreen />
      </ThemeProvider>
    );

    const changeDestBtn = view.getByText('🔍 Change Destination');
    await act(async () => {
      fireEvent.press(changeDestBtn);
    });

    const searchInput = view.getByPlaceholderText(/Search Nepal destination/);
    await act(async () => {
      fireEvent.changeText(searchInput, 'Janakpur');
    });

    const janakpurResult = view.getByText('Janakpurdham');
    expect(janakpurResult).toBeTruthy();

    await act(async () => {
      fireEvent.press(janakpurResult);
    });

    // Terai corridor disables Supercurvy with explicit reason
    expect(view.getByText(/Janakpurdham/)).toBeTruthy();
    expect(view.getByText(/Supercurvy \(UNAVAILABLE\)/)).toBeTruthy();
    expect(
      view.getByText(/Not enough bends: Terai flat plains corridor has no mountain twisties/)
    ).toBeTruthy();
  });

  test('handles no search results gracefully against synthetic catalogue', async () => {
    const view = await render(
      <ThemeProvider initialMode="night">
        <TripPlannerScreen />
      </ThemeProvider>
    );

    const changeDestBtn = view.getByText('🔍 Change Destination');
    await act(async () => {
      fireEvent.press(changeDestBtn);
    });

    const searchInput = view.getByPlaceholderText(/Search Nepal destination/);
    await act(async () => {
      fireEvent.changeText(searchInput, 'NonExistentCity123');
    });

    expect(view.getByText('No places found in Nepal fixture catalog.')).toBeTruthy();
  });

  test('discloses Upper Mustang permit restriction when Mustang destination is selected', async () => {
    const view = await render(
      <ThemeProvider initialMode="night">
        <TripPlannerScreen />
      </ThemeProvider>
    );

    const changeDestBtn = view.getByText('🔍 Change Destination');
    await act(async () => {
      fireEvent.press(changeDestBtn);
    });

    const searchInput = view.getByPlaceholderText(/Search Nepal destination/);
    await act(async () => {
      fireEvent.changeText(searchInput, 'Mustang');
    });

    const mustangResult = view.getByText('Lo Manthang (Upper Mustang)');
    await act(async () => {
      fireEvent.press(mustangResult);
    });

    expect(view.getByText('⚠️ PERMIT REQUIRED')).toBeTruthy();
    expect(
      view.getByText(/ACAP & Restricted Area Permit \(RAP\) mandatory north of Kagbeni checkpoint/)
    ).toBeTruthy();
    expect(view.getByText(/Department of Immigration & NTNC Nepal/)).toBeTruthy();
  });

  test('supports adding, reordering (move up/down), and removing waypoints', async () => {
    const view = await render(
      <ThemeProvider initialMode="night">
        <TripPlannerScreen />
      </ThemeProvider>
    );

    // Initial waypoints: Kurintar, Mugling
    expect(view.getByText('Kurintar High-Octane Fuel Checkpoint')).toBeTruthy();
    expect(view.getByText('Mugling Riverside Rider Hub')).toBeTruthy();

    // 1. Add suggested waypoint: Malekhu
    const addMalekhuBtn = view.getByText(/\+ Malekhu Local Highway Rest Stop/);
    await act(async () => {
      fireEvent.press(addMalekhuBtn);
    });
    expect(view.getByText('Malekhu Local Highway Rest Stop')).toBeTruthy();

    // 2. Reorder: Move Malekhu up (was #3, now #2)
    const moveUpBtns = view.getAllByLabelText(/Move stop .* earlier in route order/);
    await act(async () => {
      fireEvent.press(moveUpBtns[moveUpBtns.length - 1]); // Move up last item
    });

    // 3. Remove Kurintar waypoint
    const removeKurintarBtn = view.getByLabelText(/Remove stop Kurintar High-Octane Fuel Checkpoint/);
    await act(async () => {
      fireEvent.press(removeKurintarBtn);
    });
    expect(view.queryByText('Kurintar High-Octane Fuel Checkpoint')).toBeNull();
  });

  test('renders cleanly across all 4 theme modes', async () => {
    const themes: ThemeMode[] = ['night', 'dayGlare', 'dusk', 'blackout'];

    for (const mode of themes) {
      const view = await render(
        <ThemeProvider initialMode={mode}>
          <TripPlannerScreen />
        </ThemeProvider>
      );
      expect(view.getByText('Trip Planner (यात्रा योजना)')).toBeTruthy();
    }
  });
});
