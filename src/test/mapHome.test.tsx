import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { RideHomeScreen } from '../screens/RideHomeScreen';
import { ThemeProvider } from '../design/ThemeProvider';
import { AppStateProvider } from '../state/AppStateContext';
import { MemoryLocalStore } from '../services/storage/LocalStore';

describe('RideJaunm R9 Map Home & Local Ride Mode Lifecycle', () => {
  let memoryStore: MemoryLocalStore;

  beforeEach(() => {
    memoryStore = new MemoryLocalStore();
  });

  const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
      <AppStateProvider store={memoryStore}>
        <ThemeProvider initialMode="night">{children}</ThemeProvider>
      </AppStateProvider>
    );
  };

  test('renders RideHomeScreen with default route and truthful HUD', async () => {
    const view = await render(<RideHomeScreen />, { wrapper: createWrapper() });

    expect(view.getByText('START RIDE (राइड सुरु)')).toBeTruthy();
    expect(view.getByText('GPS LOCKED')).toBeTruthy();
    expect(view.getByText(/N 27.6775° · E 85.3486°/)).toBeTruthy();
  });

  test('cycles local Ride Mode through idle -> active_fixture -> ended -> idle', async () => {
    const view = await render(<RideHomeScreen />, { wrapper: createWrapper() });

    const actionBtn = view.getByText('START RIDE (राइड सुरु)');
    expect(actionBtn).toBeTruthy();

    // 1. Idle -> Active
    await act(async () => {
      fireEvent.press(actionBtn);
    });
    expect(view.getByText('END RIDE (राइड समाप्त)')).toBeTruthy();

    // 2. Active -> Ended
    const endBtn = view.getByText('END RIDE (राइड समाप्त)');
    await act(async () => {
      fireEvent.press(endBtn);
    });
    expect(view.getByText('RIDE ENDED · RESET (सम्पन्न)')).toBeTruthy();

    // 3. Ended -> Reset to Idle
    const resetBtn = view.getByText('RIDE ENDED · RESET (सम्पन्न)');
    await act(async () => {
      fireEvent.press(resetBtn);
    });
    expect(view.getByText('START RIDE (राइड सुरु)')).toBeTruthy();
  });

  test('renders rider position marker when GPS is locked and allows follow mode toggle', async () => {
    const view = await render(<RideHomeScreen />, { wrapper: createWrapper() });

    // Rider marker is rendered on map
    expect(view.getByText('You (तपाईं)')).toBeTruthy();

    // Follow button is enabled
    const followBtn = view.getByLabelText(/Tap to enable camera follow on rider position/);
    expect(followBtn).toBeTruthy();

    await act(async () => {
      fireEvent.press(followBtn);
    });

    expect(view.getByLabelText(/Follow mode active/)).toBeTruthy();
  });

  test('resets camera to origin and disables follow mode when Recenter is pressed', async () => {
    const view = await render(<RideHomeScreen />, { wrapper: createWrapper() });

    const followBtn = view.getByLabelText(/Tap to enable camera follow on rider position/);
    await act(async () => {
      fireEvent.press(followBtn);
    });
    expect(view.getByLabelText(/Follow mode active/)).toBeTruthy();

    const recenterBtn = view.getByLabelText(/Recenter map to route start/);
    await act(async () => {
      fireEvent.press(recenterBtn);
    });

    expect(view.getByLabelText(/Tap to enable camera follow on rider position/)).toBeTruthy();
  });
});
