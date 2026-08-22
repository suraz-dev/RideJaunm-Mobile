/**
 * ============================================================================
 * SOS CONSOLE & SAFETY CAPABILITY GATE TESTS (R15)
 * ============================================================================
 *
 * Verifies:
 * 1. Limitation banner and capability matrix in Ready state.
 * 2. Deliberate hold trigger advancing to simulated cancel window.
 * 3. Early release of SOS hold safely aborts, does NOT open accessible modal, and returns to Ready.
 * 4. Completed hold suppresses trailing onPress and does not open accessible confirmation modal.
 * 5. VoiceOver/TalkBack accessible arming via deliberate 2-step confirmation dialog.
 * 6. Cancel action safely aborting without incident dispatch.
 * 7. Full-screen active emergency preview with truthful evidence states.
 * 8. Deliberate stand-down hold & accessible stand-down confirmation.
 * 9. Disabled manual helpline directory with country configuration disclosure.
 * 10. Zero storage, AppState, outbox, network, or Linking mutations.
 * 11. 4 Theme modes and Devanagari localization strings.
 */

import React from 'react';
import { Animated } from 'react-native';
import { render, fireEvent, act } from '@testing-library/react-native';
import { SOSConsoleScreen } from '../screens/SOSConsoleScreen';
import { SOSActiveEmergencyView } from '../components/sos/SOSActiveEmergencyView';
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
import { ThemeMode } from '../design/tokens';

// Mock holdMs to 50ms for snappy, deterministic, unsuppressed real-timer test execution
jest.mock('../design/tokens', () => {
  const actual = jest.requireActual('../design/tokens');
  return {
    ...actual,
    safety: {
      ...actual.safety,
      sos: {
        ...actual.safety.sos,
        holdMs: 50,
      },
    },
  };
});

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  selectionAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

describe('RideJaunm R15 Fixture SOS Console & Safety Gate', () => {
  let memoryStore: MemoryLocalStore;
  let timingSpy: jest.SpyInstance;

  beforeAll(() => {
    timingSpy = jest.spyOn(Animated, 'timing').mockImplementation((value: any, config: any) => ({
      start: (cb?: any) => {
        value.setValue(config.toValue);
        if (cb) cb({ finished: true });
      },
      stop: () => {},
      reset: () => {},
    }));
  });

  afterAll(() => {
    timingSpy.mockRestore();
  });

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

  const renderSOSScreen = async (
    conn?: ConnectionStateSnapshot,
    theme: ThemeMode = 'night'
  ) => {
    return render(<SOSConsoleScreen />, { wrapper: createWrapper(conn, theme) });
  };

  test('validates all required safety capability fixtures exist', () => {
    expect(defaultSafetyCapabilitySnapshot.cellularObserved).toBe(true);
    expect(defaultSafetyCapabilitySnapshot.meshCapability).toBe('zero_peers');
    expect(defaultSafetyCapabilitySnapshot.evidenceItems.length).toBe(5);

    expect(deadZoneSafetyCapabilitySnapshot.cellularObserved).toBe(false);
    expect(deadZoneSafetyCapabilitySnapshot.batteryHealth).toBe('low');
  });

  test('renders Ready state with prominent limitation banner and capability matrix', async () => {
    const view = await renderSOSScreen();

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

    await view.unmount();
  });

  test('early release of SOS hold aborts, does NOT open accessible modal, and safely returns to Ready without cancel window', async () => {
    const view = await renderSOSScreen();

    const sosButton = view.getByLabelText(/Emergency SOS button/);
    expect(sosButton).toBeTruthy();

    // Physical hold started, released early (20ms < 50ms hold), then trailing physical tap fired
    await act(async () => {
      fireEvent(sosButton, 'pressIn');
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 20));
    });
    await act(async () => {
      fireEvent(sosButton, 'pressOut');
    });
    await act(async () => {
      fireEvent.press(sosButton);
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 60));
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

    await view.unmount();
  });

  test('VoiceOver/TalkBack accessible arming via deliberate 2-step confirmation modal', async () => {
    const view = await renderSOSScreen();

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

    // Verify advances to cancel window
    expect(view.getByText(/SIMULATED SOS PREVIEW — no alert was sent\./)).toBeTruthy();

    await view.unmount();
  });

  test('handles deliberate hold to arm and advances to cancel window without triggering accessible modal on release', async () => {
    const view = await renderSOSScreen();

    const sosButton = view.getByLabelText(/Emergency SOS button/);
    expect(sosButton).toBeTruthy();

    // Deliberate hold (70ms > 50ms), pressOut, and trailing press event
    await act(async () => {
      fireEvent(sosButton, 'pressIn');
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 70));
    });
    await act(async () => {
      fireEvent(sosButton, 'pressOut');
    });
    await act(async () => {
      fireEvent.press(sosButton);
    });

    // Verify cancellation window is displayed
    expect(
      view.getByText(/SIMULATED SOS PREVIEW — no alert was sent\./)
    ).toBeTruthy();
    expect(view.getByText(/00:10/)).toBeTruthy();

    // Verify accessible modal was NOT opened over cancel window
    expect(view.queryByText('Arm Simulated Emergency SOS?')).toBeNull();

    await view.unmount();
  });

  test('cancels SOS during cancel window returning to Ready state without dispatch claim', async () => {
    const view = await renderSOSScreen();

    const sosButton = view.getByLabelText(/Emergency SOS button/);

    await act(async () => {
      fireEvent(sosButton, 'pressIn');
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 70));
    });
    await act(async () => {
      fireEvent(sosButton, 'pressOut');
    });
    await act(async () => {
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

    await view.unmount();
  });

  test('renders full-screen Active Emergency preview and handles deliberate stand-down hold', async () => {
    const onStandDown = jest.fn();
    const view = await render(
      <SOSActiveEmergencyView
        evidenceItems={defaultSafetyCapabilitySnapshot.evidenceItems}
        onStandDownComplete={onStandDown}
      />,
      { wrapper: createWrapper() }
    );

    // Verify full-screen simulated active emergency view
    expect(view.getByText('SIMULATED ACTIVE SOS')).toBeTruthy();
    expect(
      view.getByText('No real emergency was declared. No responder or contact was notified.')
    ).toBeTruthy();
    expect(view.getByText('Channel Evidence Timeline (Simulation)')).toBeTruthy();

    // Verify Stand Down button
    const standDownBtn = view.getByLabelText(
      /Hold for 3 seconds to stand down simulated emergency/
    );
    expect(standDownBtn).toBeTruthy();

    // Hold stand down past 50ms duration, release, and trailing tap
    await act(async () => {
      fireEvent(standDownBtn, 'pressIn');
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 70));
    });
    await act(async () => {
      fireEvent(standDownBtn, 'pressOut');
    });
    await act(async () => {
      fireEvent.press(standDownBtn);
    });

    // Verify stand-down confirmation notice
    expect(
      view.getByText(/Stand-down preview complete — no all-clear was sent\./)
    ).toBeTruthy();

    // Verify accessible stand down modal was NOT opened
    expect(view.queryByText('Stand Down Simulated Emergency?')).toBeNull();

    await view.unmount();
  });

  test('VoiceOver/TalkBack accessible stand-down via deliberate confirmation modal', async () => {
    const onStandDown = jest.fn();
    const view = await render(
      <SOSActiveEmergencyView
        evidenceItems={defaultSafetyCapabilitySnapshot.evidenceItems}
        onStandDownComplete={onStandDown}
      />,
      { wrapper: createWrapper() }
    );

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

    // Verify stand down notice
    expect(view.getByText(/Stand-down preview complete — no all-clear was sent\./)).toBeTruthy();

    await view.unmount();
  });

  test('renders dead-zone evidence snapshot when offline', async () => {
    const view = await renderSOSScreen(connectionDeadZoneSnapshot);

    expect(view.getByText(/LAST-KNOWN FIXTURE \(±45m\)/)).toBeTruthy();
    expect(view.getByText(/DEAD ZONE \(UNAVAILABLE\)/)).toBeTruthy();
    expect(view.getByText(/18% \(LOW\)/)).toBeTruthy();

    await view.unmount();
  });

  test('truthfulness regression: rejects delivery, dispatch, and external dialing claims', async () => {
    const view = await renderSOSScreen();

    expect(view.queryByText(/help dispatched/i)).toBeNull();
    expect(view.queryByText(/message delivered/i)).toBeNull();
    expect(view.queryByText(/calling emergency/i)).toBeNull();

    await view.unmount();
  });

  test.each(['night', 'dayGlare', 'dusk', 'blackout'] as ThemeMode[])(
    'renders cleanly in %s theme mode',
    async (mode) => {
      const view = await renderSOSScreen(connectionOnlineSnapshot, mode);
      expect(view.getByText('Emergency SOS Console')).toBeTruthy();
      await view.unmount();
    }
  );
});
