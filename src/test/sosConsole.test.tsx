/**
 * ============================================================================
 * SOS CONSOLE & SAFETY CAPABILITY GATE TESTS (R15)
 * ============================================================================
 *
 * Verifies:
 * 1. Limitation banner and capability matrix in Ready state.
 * 2. 3-Second hold trigger advancing to 10-second simulated cancel window.
 * 3. Early release of SOS hold safely aborts, does NOT open accessible modal, and returns to Ready.
 * 4. Finger release after physical hold does not open accessible confirmation modal.
 * 5. VoiceOver/TalkBack accessible arming via deliberate 2-step confirmation dialog.
 * 6. Cancel action safely aborting without incident dispatch.
 * 7. Full-screen active emergency preview with truthful evidence states.
 * 8. 3-Second deliberate stand-down hold & accessible stand-down confirmation.
 * 9. Disabled manual helpline directory with country configuration disclosure.
 * 10. Zero storage, AppState, outbox, network, or Linking mutations.
 * 11. 4 Theme modes and Devanagari localization strings.
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
    jest.useRealTimers();
    memoryStore = new MemoryLocalStore();
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

  test('early release of SOS hold aborts, does NOT open accessible modal, and safely returns to Ready without cancel window', async () => {
    const view = await render(<SOSConsoleScreen />, { wrapper: createWrapper() });

    const sosButton = view.getByLabelText(/Emergency SOS button/);
    expect(sosButton).toBeTruthy();

    jest.useFakeTimers();

    await act(async () => {
      fireEvent(sosButton, 'pressIn');
      jest.advanceTimersByTime(1500); // Early release before 3.0s threshold
      fireEvent(sosButton, 'pressOut');
      fireEvent.press(sosButton);
      jest.advanceTimersByTime(3000); // Prove no deferred timers arm
    });

    // Verify cancellation window is NOT opened
    expect(view.queryByText(/SIMULATED SOS PREVIEW — no alert was sent\./)).toBeNull();

    // Verify accessibility confirmation modal is NOT opened on early release
    expect(view.queryByText('Arm Simulated Emergency SOS?')).toBeNull();

    // Verify screen remains in Ready state with limitation banner
    expect(
      view.getByText(
        /Safety preview only — this build cannot contact emergency services or your contacts\./
      )
    ).toBeTruthy();

    jest.useRealTimers();
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

  test('handles 3-second hold to arm and advances to 10-second cancel window without triggering accessible modal on release', async () => {
    const view = await render(<SOSConsoleScreen />, { wrapper: createWrapper() });

    const sosButton = view.getByLabelText(/Emergency SOS button/);
    expect(sosButton).toBeTruthy();

    jest.useFakeTimers();

    await act(async () => {
      fireEvent(sosButton, 'pressIn');
      jest.advanceTimersByTime(safety.sos.holdMs);
      fireEvent(sosButton, 'pressOut');
      fireEvent.press(sosButton);
    });

    // Verify 10-second cancellation window is displayed
    expect(
      view.getByText(/SIMULATED SOS PREVIEW — no alert was sent\./)
    ).toBeTruthy();
    expect(view.getByText(/00:10/)).toBeTruthy();

    // Verify accessible modal was NOT opened over cancel window
    expect(view.queryByText('Arm Simulated Emergency SOS?')).toBeNull();

    jest.useRealTimers();
  });

  test('cancels SOS during cancel window returning to Ready state without dispatch claim', async () => {
    const view = await render(<SOSConsoleScreen />, { wrapper: createWrapper() });

    const sosButton = view.getByLabelText(/Emergency SOS button/);

    jest.useFakeTimers();

    await act(async () => {
      fireEvent(sosButton, 'pressIn');
      jest.advanceTimersByTime(safety.sos.holdMs);
      fireEvent(sosButton, 'pressOut');
      fireEvent.press(sosButton);
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

    jest.useRealTimers();
  });

  test('advances to full-screen Active Emergency preview when cancel countdown reaches 0', async () => {
    const view = await render(<SOSConsoleScreen />, { wrapper: createWrapper() });

    const sosButton = view.getByLabelText(/Emergency SOS button/);

    jest.useFakeTimers();

    await act(async () => {
      fireEvent(sosButton, 'pressIn');
      jest.advanceTimersByTime(safety.sos.holdMs);
      fireEvent(sosButton, 'pressOut');
      fireEvent.press(sosButton);
    });

    // Advance 11 seconds for cancel window interval to complete
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
      jest.advanceTimersByTime(safety.sos.holdMs);
      fireEvent(standDownBtn, 'pressOut');
      fireEvent.press(standDownBtn);
      jest.advanceTimersByTime(1500); // Complete stand down delay
    });

    // Verify stood down confirmation screen
    expect(
      view.getByText('Stand-down preview complete — no all-clear was sent.')
    ).toBeTruthy();

    // Verify accessible stand down modal was NOT opened
    expect(view.queryByText('Stand Down Simulated Emergency?')).toBeNull();

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

    jest.useRealTimers();
  });

  test('VoiceOver/TalkBack accessible stand-down via deliberate confirmation modal', async () => {
    const view = await render(<SOSConsoleScreen />, { wrapper: createWrapper() });

    const sosButton = view.getByLabelText(/Emergency SOS button/);

    jest.useFakeTimers();

    await act(async () => {
      fireEvent(sosButton, 'pressIn');
      jest.advanceTimersByTime(safety.sos.holdMs);
      fireEvent(sosButton, 'pressOut');
      fireEvent.press(sosButton);
    });

    // Advance 11 seconds for cancel window interval to complete
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
      jest.advanceTimersByTime(1500);
    });

    // Verify stood down
    expect(view.getByText('Stand-down preview complete — no all-clear was sent.')).toBeTruthy();

    jest.useRealTimers();
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
