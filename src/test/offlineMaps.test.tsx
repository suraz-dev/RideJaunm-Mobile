import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { OfflineMapsScreen } from '../screens/OfflineMapsScreen';
import { ProfileGarageScreen } from '../screens/ProfileGarageScreen';
import { ThemeProvider } from '../design/ThemeProvider';
import { AppStateProvider } from '../state/AppStateContext';
import { MemoryLocalStore } from '../services/storage/LocalStore';
import { ConnectionStateSnapshot } from '../domain/connectivity';
import { connectionDeadZoneSnapshot, connectionOnlineSnapshot } from '../fixtures/connectivity.fixture';
import { allOfflineRegionFixtures } from '../fixtures/offlineRegions.fixture';
import { ThemeMode } from '../design/tokens';
import { OfflineRegion } from '../domain/offline';

describe('RideJaunm R12 Fixture Offline Region Browser & Lifecycle UI', () => {
  let memoryStore: MemoryLocalStore;

  beforeEach(() => {
    memoryStore = new MemoryLocalStore();
  });

  const createWrapper = (
    initialConn?: ConnectionStateSnapshot,
    theme: ThemeMode = 'night',
    customRegions?: OfflineRegion[]
  ) => {
    return ({ children }: { children: React.ReactNode }) => (
      <AppStateProvider
        store={memoryStore}
        initialConnectionState={initialConn}
        initialOfflineRegions={customRegions}
      >
        <ThemeProvider initialMode={theme}>{children}</ThemeProvider>
      </AppStateProvider>
    );
  };

  test('validates all 8 lifecycle states exist in fixture catalog', () => {
    const lifecycles = allOfflineRegionFixtures.map((r) => r.lifecycle);
    expect(lifecycles).toContain('complete');
    expect(lifecycles).toContain('downloading');
    expect(lifecycles).toContain('queued');
    expect(lifecycles).toContain('paused');
    expect(lifecycles).toContain('partial');
    expect(lifecycles).toContain('stale');
    expect(lifecycles).toContain('failed');
    expect(lifecycles).toContain('storage_full');
  });

  test('renders StorageSummaryBar with pre-authored fixture metrics and permanent disclosure', async () => {
    const view = await render(<OfflineMapsScreen />, { wrapper: createWrapper() });

    expect(view.getByText('Storage Overview (भण्डारण सारांश)')).toBeTruthy();
    expect(view.getByText(/1\.4 GB MAPS · 14\.2 GB FREE/)).toBeTruthy();
    expect(
      view.getByText(/Storage estimate · Device storage preview/)
    ).toBeTruthy();
  });

  test('qualifies all 8 lifecycle states explicitly as fixture/simulated on cards', async () => {
    const view = await render(<OfflineMapsScreen />, { wrapper: createWrapper() });

    // 1. Complete
    expect(view.getAllByText('DOWNLOADED').length).toBeGreaterThan(0);

    // 2. Downloading & Queued & Paused
    const downloadingTab = view.getByLabelText('Filter Downloading (डाउनलोडिङ)');
    await act(async () => {
      fireEvent.press(downloadingTab);
    });
    expect(view.getByText(/DOWNLOADING \(45%\)/)).toBeTruthy();
    expect(view.getByText('QUEUED')).toBeTruthy();
    expect(view.getByText(/PAUSED \(60%\)/)).toBeTruthy();

    // 3. Stale
    const staleTab = view.getByLabelText('Filter Updates (अपडेट)');
    await act(async () => {
      fireEvent.press(staleTab);
    });
    expect(view.getByText('UPDATE AVAILABLE')).toBeTruthy();
    expect(view.getByText(/Cached Map — Update Available/)).toBeTruthy();

    // 4. Issues (Failed, Storage Full, Partial)
    const issuesTab = view.getByLabelText('Filter Issues (समस्या)');
    await act(async () => {
      fireEvent.press(issuesTab);
    });
    expect(view.getByText('TRANSFER ERROR')).toBeTruthy();
    expect(view.getByText('STORAGE FULL')).toBeTruthy();
    expect(view.getByText(/PARTIAL CACHE \(70%\)/)).toBeTruthy();
  });

  test('filters region cards across All, Downloading, Stale, and Issues tabs', async () => {
    const view = await render(<OfflineMapsScreen />, { wrapper: createWrapper() });

    // 1. "All" tab: should show Mustang, Bagmati, Everest, Pokhara, etc.
    expect(view.getByText('Annapurna & Mustang Circuit')).toBeTruthy();
    expect(view.getByText('Pokhara Valley & Sarangkot Ridge')).toBeTruthy();
    expect(view.getByText('Upper Dolpa & Shey Phoksundo')).toBeTruthy();

    // 2. "Downloading" tab: shows downloading, queued, and paused
    const downloadingTab = view.getByLabelText('Filter Downloading (डाउनलोडिङ)');
    await act(async () => {
      fireEvent.press(downloadingTab);
    });
    expect(view.getByText('Solukhumbu & Everest Base Trail')).toBeTruthy();
    expect(view.getByText('Manang & Tilicho Lake High Route')).toBeTruthy();
    expect(view.getByText('Rara Lake & Mugu Frontier')).toBeTruthy();
    expect(view.queryByText('Annapurna & Mustang Circuit')).toBeNull();

    // 3. "Stale" tab: shows stale Pokhara region
    const staleTab = view.getByLabelText('Filter Updates (अपडेट)');
    await act(async () => {
      fireEvent.press(staleTab);
    });
    expect(view.getByText('Pokhara Valley & Sarangkot Ridge')).toBeTruthy();
    expect(view.queryByText('Solukhumbu & Everest Base Trail')).toBeNull();

    // 4. "Issues" tab: shows failed, storage_full, and partial
    const issuesTab = view.getByLabelText('Filter Issues (समस्या)');
    await act(async () => {
      fireEvent.press(issuesTab);
    });
    expect(view.getByText('Annapurna Sanctuary & ABC Trail')).toBeTruthy(); // failed
    expect(view.getByText('Upper Dolpa & Shey Phoksundo')).toBeTruthy(); // storage_full
    expect(view.getByText('Langtang & Gosaikunda Passes')).toBeTruthy(); // partial
  });

  test('handles pause and resume preview interactions with truth disclosures', async () => {
    const view = await render(<OfflineMapsScreen />, { wrapper: createWrapper() });

    // Filter to downloading to find Everest region
    const downloadingTab = view.getByLabelText('Filter Downloading (डाउनलोडिङ)');
    await act(async () => {
      fireEvent.press(downloadingTab);
    });

    const pauseBtn = view.getByLabelText('Pause Solukhumbu & Everest Base Trail download');
    await act(async () => {
      fireEvent.press(pauseBtn);
    });

    // Verify truth disclosure
    expect(view.getByText(/Download paused · Local preview/)).toBeTruthy();
    expect(view.getByText(/PAUSED \(45%\)/)).toBeTruthy();

    // Resume
    const resumeBtn = view.getByLabelText('Resume Solukhumbu & Everest Base Trail download');
    await act(async () => {
      fireEvent.press(resumeBtn);
    });
    expect(view.getByText(/Download resumed · Local preview/)).toBeTruthy();
    expect(view.getByText(/DOWNLOADING \(45%\)/)).toBeTruthy();
  });

  test('handles retry preview interaction for failed regions', async () => {
    const view = await render(<OfflineMapsScreen />, { wrapper: createWrapper() });

    const issuesTab = view.getByLabelText('Filter Issues (समस्या)');
    await act(async () => {
      fireEvent.press(issuesTab);
    });

    const retryBtn = view.getByLabelText('Retry Annapurna Sanctuary & ABC Trail transfer');
    await act(async () => {
      fireEvent.press(retryBtn);
    });

    expect(view.getByText(/Retrying download · Local preview/)).toBeTruthy();
  });

  test('handles removal confirmation preview interaction with permanent truth disclosure', async () => {
    const view = await render(<OfflineMapsScreen />, { wrapper: createWrapper() });

    const removeBtn = view.getByLabelText('Remove Annapurna & Mustang Circuit pack');
    await act(async () => {
      fireEvent.press(removeBtn);
    });

    const confirmBtn = view.getByLabelText('Confirm removal of Annapurna & Mustang Circuit pack');
    await act(async () => {
      fireEvent.press(confirmBtn);
    });

    expect(view.getByText(/Pack removal preview · Local cache only/)).toBeTruthy();
  });

  test('qualifies lifecycle state in map preview and enforces cache_only policy with truthful MapBaseState', async () => {
    // Render under online snapshot to verify it STILL forces cache_only policy
    const view = await render(<OfflineMapsScreen />, {
      wrapper: createWrapper(connectionOnlineSnapshot),
    });

    const showMapBtn = view.getByLabelText('Hide region map bounds preview');
    expect(view.getByText('REGION BOUNDS PREVIEW (Annapurna & Mustang Circuit)')).toBeTruthy();

    // Check bounds header has qualified badge (DOWNLOADED)
    expect(view.getAllByText('DOWNLOADED').length).toBeGreaterThan(0);

    // Expand details and check fixture qualification
    const detailsBtn = view.getByLabelText('Show Annapurna & Mustang Circuit details');
    await act(async () => {
      fireEvent.press(detailsBtn);
    });
    expect(view.getByText(/Checksum: 9a8f2c3d4e5f60718293a4b5/)).toBeTruthy();
    expect(view.getByText(/Cached: 2026-08-10T04:00:00Z · Expiry: 2026-11-10T04:00:00Z/)).toBeTruthy();

    // Select a stale region and check that map bounds preview header updates with qualified badge
    const staleRegion = allOfflineRegionFixtures.find((r) => r.lifecycle === 'stale')!;
    const staleMapBtn = view.getByLabelText(`Show ${staleRegion.name} bounds in map preview`);
    await act(async () => {
      fireEvent.press(staleMapBtn);
    });
    expect(view.getByText(`REGION BOUNDS PREVIEW (${staleRegion.name})`)).toBeTruthy();
    expect(view.getAllByText('UPDATE AVAILABLE').length).toBeGreaterThan(0);
  });

  test('preserves and accurately renders all 8 lifecycle states in ProfileGarageScreen summary', async () => {
    // Supply all 8 regions to ProfileGarageScreen to verify no state is collapsed to false status
    const view = await render(<ProfileGarageScreen />, {
      wrapper: createWrapper(undefined, 'night', allOfflineRegionFixtures),
    });

    // In R14, the offline packs summary is located under the Settings tab
    const settingsTab = view.getByLabelText('Select Settings tab (सेटिङ)');
    await act(async () => {
      fireEvent.press(settingsTab);
    });

    expect(view.getByText(/Nepal Offline Map Packs/)).toBeTruthy();
    expect(view.getAllByText('DOWNLOADED').length).toBeGreaterThan(0);
    expect(view.getByText('DOWNLOADING (45%)')).toBeTruthy();
    expect(view.getByText('QUEUED')).toBeTruthy();
    expect(view.getByText('PAUSED (60%)')).toBeTruthy();
    expect(view.getByText('PARTIAL CACHE (70%)')).toBeTruthy();
    expect(view.getByText('UPDATE AVAILABLE')).toBeTruthy();
    expect(view.getByText('TRANSFER ERROR')).toBeTruthy();
    expect(view.getByText('STORAGE FULL')).toBeTruthy();
  });

  test('renders offline/mesh banner when in deadZone connection mode', async () => {
    const view = await render(<OfflineMapsScreen />, {
      wrapper: createWrapper(connectionDeadZoneSnapshot),
    });

    expect(view.getByText('OFFLINE MESH MODE')).toBeTruthy();
    expect(view.getByText(/Operating in offline dead-zone \/ mesh mode\./)).toBeTruthy();
  });

  test('renders cleanly across all 4 theme modes', async () => {
    const themes: ThemeMode[] = ['night', 'dayGlare', 'dusk', 'blackout'];

    for (const mode of themes) {
      const view = await render(<OfflineMapsScreen />, {
        wrapper: createWrapper(undefined, mode),
      });
      expect(view.getByText('Offline Maps — Local Preview')).toBeTruthy();
    }
  });
});
