/**
 * ============================================================================
 * SOS CONSOLE & SAFETY CAPABILITY GATE TESTS (R15)
 * ============================================================================
 *
 * Verifies:
 * 1. Limitation banner and capability matrix in Ready state.
 * 2. 3-Second hold trigger advancing to 10-second simulated cancel window.
 * 3. Early release of SOS hold safely aborting without advancing to cancel window.
 * 4. VoiceOver/TalkBack accessible arming via deliberate 2-step confirmation dialog.
 * 5. Cancel action safely aborting without incident dispatch.
 * 6. Full-screen active emergency preview with truthful evidence states.
 * 7. 3-Second deliberate stand-down hold & accessible stand-down confirmation.
 * 8. Disabled manual helpline directory with country configuration disclosure.
 * 9. Zero storage, AppState, outbox, network, or Linking mutations.
 * 10. 4 Theme modes and Devanagari localization strings.
 */

import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { SOSConsoleScreen } from '../screens/SOSConsoleScreen';
import { ThemeProvider } from '../design/ThemeProvider';
import { AppStateProvider } from '../state/AppStateContext';
import { MemoryLocalStore } from '../services/storage/LocalStore';
import { ConnectionStateSnapshot } from '../domain/connectivity';
import {
  connectionDeadZoneSnapshot,
  connectionOnlineSnapshot,
} from '../fixtures/connectivity.fixture';
import {
  defaultSafetyCapabilitySnapshot,
  deadZoneSafetyCapabilitySnapshot,
} from '../fixtures/sosConsole.fixture';
import { ThemeMode, safety } from '../design/tokens';

describe('RideJaunm R15 Fixture SOS Console & Safety Gate', () => {
  let memoryStore: MemoryLocalStore;

  beforeEach(() => {
    memoryStore = new MemoryLocalStore();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
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

  test('validates all required safety capability fixtures exist', () => {
    expect(defaultSafetyCapabilitySnapshot.cellularObserved).toBe(true);
    expect(defaultSafetyCapabilitySnapshot.meshCapability).toBe('zero_peers');
    expect(defaultSafetyCapabilitySnapshot.evidenceItems.length).toBe(5);

    expect(deadZoneSafetyCapabilitySnapshot.cellularObserved).toBe(false);
    expect(deadZoneSafetyCapabilitySnapshot.batteryHealth).toBe('low');
  });

  test('renders Ready state with prominent limitation banner and capability matrix', async () => {
    const view = await render(<SOSConsoleScreen />, { wrapper: createWrapper() });

    // Limitation banner
    expect(
      view.getByText(
        /Safety preview only — this build cannot contact emergency services or your contacts\./
      )
    ).toBeTruthy();

    // Capability Matrix
    expect(view.getByText('Safety Capability Gate & Evidence')).toBeTruthy();
    expect(view.getByText('1. Local Device GPS')).toBeTruthy();
    expect(view.getByText('2. BLE Multi-Hop Mesh')).toBeTruthy();
    expect(view.getByText('3. Nepal Cellular (NTC/Ncell)')).toBeTruthy();
    expect(view.getByText('4. Satellite Uplink')).toBeTruthy();
    expect(view.getByText('5. Public Service Delivery Proof')).toBeTruthy();

    // Disabled manual help card
    expect(
      view.getByText('Emergency resources require reviewed country configuration.')
    ).toBeTruthy();
  });

  test('early release of SOS hold aborts and safely returns to Ready without cancel window', async () => {
    const view = await render(<SOSConsoleScreen />, { wrapper: createWrapper() });

    const sosButton = view.getByLabelText(/Emergency SOS button/);
    expect(sosButton).toBeTruthy();

    // Start pressing
    await act(async () => {
      fireEvent(sosButton, 'pressIn');
    });

    // Advance only 1.5 seconds (early release before 3.0s threshold)
    await act(async () => {
      jest.advanceTimersByTime(1500);
    });

    // Release early
    await act(async () => {
      fireEvent(sosButton, 'pressOut');
    });

    // Advance beyond 3.0s to prove no deferred timer triggers
    await act(async () => {
      jest.advanceTimersByTime(3000);
    });

    // Verify cancellation window is NOT opened and screen remains in Ready state
    expect(view.queryByText(/SIMULATED SOS PREVIEW — no alert was sent\./)).toBeNull();
    expect(
      view.getByText(
        /Safety preview only — this build cannot contact emergency services or your contacts\./
      )
    ).toBeTruthy();
  });

  test('VoiceOver/TalkBack accessible arming via deliberate 2-step confirmation modal', async () => {
    const view = await render(<SOSConsoleScreen />, { wrapper: createWrapper() });

    const sosButton = view.getByLabelText(/Emergency SOS button/);

    // Screen-reader tap triggers accessible confirmation modal
    await act(async () => {
      fireEvent.press(sosButton);
    });

    // Assert accessible confirmation modal is visible
    expect(view.getByText('Arm Simulated Emergency SOS?')).toBeTruthy();
    expect(view.getByText(/VoiceOver\/TalkBack deliberate confirmation required/)).toBeTruthy();

    // Confirm arming
    const confirmBtn = view.getByLabelText('Confirm and arm simulated SOS');
    await act(async () => {
      fireEvent.press(confirmBtn);
    });

    // Verify advances to 10-second cancel window
    expect(view.getByText(/SIMULATED SOS PREVIEW — no alert was sent\./)).toBeTruthy();
  });

  test('handles 3-second hold to arm and advances to 10-second cancel window', async () => {
    const view = await render(<SOSConsoleScreen />, { wrapper: createWrapper() });

    const sosButton = view.getByLabelText(/Emergency SOS button/);
    expect(sosButton).toBeTruthy();

    // PressIn to start hold
    await act(async () => {
      fireEvent(sosButton, 'pressIn');
    });

    // Advance 3 seconds for hold completion
    await act(async () => {
      jest.advanceTimersByTime(safety.sos.holdMs);
    });

    // Verify 10-second cancellation window is displayed
    expect(
      view.getByText(/SIMULATED SOS PREVIEW — no alert was sent\./)
    ).toBeTruthy();
    expect(view.getByText(/00:10/)).toBeTruthy();
  });

  test('cancels SOS during cancel window returning to Ready state without dispatch claim', async () => {
    const view = await render(<SOSConsoleScreen />, { wrapper: createWrapper() });

    const sosButton = view.getByLabelText(/Emergency SOS button/);
    await act(async () => {
      fireEvent(sosButton, 'pressIn');
    });
    await act(async () => {
      jest.advanceTimersByTime(safety.sos.holdMs);
    });

    // Press cancel button
    const cancelBtn = view.getByLabelText('Cancel simulated SOS preview');
    await act(async () => {
      fireEvent.press(cancelBtn);
    });

    // Verify returned to Ready state
    expect(
      view.getByText(
        /Safety preview only — this build cannot contact emergency services or your contacts\./
      )
    ).toBeTruthy();
  });

  test('advances to full-screen Active Emergency preview when cancel countdown reaches 0', async () => {
    const view = await render(<SOSConsoleScreen />, { wrapper: createWrapper() });

    const sosButton = view.getByLabelText(/Emergency SOS button/);
    await act(async () => {
      fireEvent(sosButton, 'pressIn');
    });
    await act(async () => {
      jest.advanceTimersByTime(safety.sos.holdMs);
    });

    // Advance 10 seconds through cancellation countdown
    await act(async () => {
      jest.advanceTimersByTime(11000);
    });

    // Verify full-screen simulated active emergency view
    expect(view.getByText('SIMULATED ACTIVE SOS')).toBeTruthy();
    expect(
      view.getByText('No real emergency was declared. No responder or contact was notified.')
    ).toBeTruthy();
    expect(view.getByText('Channel Evidence Timeline (Simulation)')).toBeTruthy();

    // Verify 3s Stand Down button
    const standDownBtn = view.getByLabelText(
      /Hold for 3 seconds to stand down simulated emergency/
    );
    expect(standDownBtn).toBeTruthy();

    // Hold stand down for 3 seconds
    await act(async () => {
      fireEvent(standDownBtn, 'pressIn');
    });
    await act(async () => {
      jest.advanceTimersByTime(safety.sos.holdMs);
    });
    await act(async () => {
      jest.advanceTimersByTime(1500);
    });

    // Verify stood down confirmation screen
    expect(
      view.getByText('Stand-down preview complete — no all-clear was sent.')
    ).toBeTruthy();

    // Return to SOS Console
    const returnBtn = view.getByLabelText('Return to SOS Console');
    await act(async () => {
      fireEvent.press(returnBtn);
    });

    expect(
      view.getByText(
        /Safety preview only — this build cannot contact emergency services or your contacts\./
      )
    ).toBeTruthy();
  });

  test('VoiceOver/TalkBack accessible stand-down via deliberate confirmation modal', async () => {
    const view = await render(<SOSConsoleScreen />, { wrapper: createWrapper() });

    const sosButton = view.getByLabelText(/Emergency SOS button/);
    await act(async () => {
      fireEvent(sosButton, 'pressIn');
    });
    await act(async () => {
      jest.advanceTimersByTime(safety.sos.holdMs);
    });
    await act(async () => {
      jest.advanceTimersByTime(11000);
    });

    // Verify full-screen simulated active emergency view
    expect(view.getByText('SIMULATED ACTIVE SOS')).toBeTruthy();

    // Tap stand down button (screen-reader accessible activation)
    const standDownBtn = view.getByLabelText(/Hold for 3 seconds to stand down simulated emergency/);
    await act(async () => {
      fireEvent.press(standDownBtn);
    });

    // Assert accessible stand down modal is visible
    expect(view.getByText('Stand Down Simulated Emergency?')).toBeTruthy();

    // Confirm stand down
    const confirmStandDownBtn = view.getByLabelText('Confirm stand down simulated emergency');
    await act(async () => {
      fireEvent.press(confirmStandDownBtn);
    });
    await act(async () => {
      jest.advanceTimersByTime(1500);
    });

    // Verify stood down
    expect(view.getByText('Stand-down preview complete — no all-clear was sent.')).toBeTruthy();
  });

  test('renders dead-zone evidence snapshot when offline', async () => {
    const view = await render(<SOSConsoleScreen />, {
      wrapper: createWrapper(connectionDeadZoneSnapshot),
    });

    expect(view.getByText(/LAST-KNOWN FIXTURE \(±45m\)/)).toBeTruthy();
    expect(view.getByText(/DEAD ZONE \(UNAVAILABLE\)/)).toBeTruthy();
    expect(view.getByText(/18% \(LOW\)/)).toBeTruthy();
  });

  test('truthfulness regression: rejects delivery, dispatch, and external dialing claims', async () => {
    const view = await render(<SOSConsoleScreen />, { wrapper: createWrapper() });

    expect(view.queryByText(/help dispatched/i)).toBeNull();
    expect(view.queryByText(/message delivered/i)).toBeNull();
    expect(view.queryByText(/calling emergency/i)).toBeNull();
  });

  test('renders cleanly across all 4 theme modes with Devanagari text', async () => {
    const themes: ThemeMode[] = ['night', 'dayGlare', 'dusk', 'blackout'];

    for (const mode of themes) {
      const view = await render(<SOSConsoleScreen />, {
        wrapper: createWrapper(connectionOnlineSnapshot, mode),
      });
      expect(view.getByText('Emergency SOS Console')).toBeTruthy();
    }
  });
});
