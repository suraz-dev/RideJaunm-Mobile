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

describe('RideJaunm R12 Fixture Offline Region Browser & Lifecycle UI', () => {
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
      view.getByText(/Pre-authored storage simulation · Does not read real device flash capacity\./)
    ).toBeTruthy();
  });

  test('qualifies all 8 lifecycle states explicitly as fixture/simulated on cards', async () => {
    const view = await render(<OfflineMapsScreen />, { wrapper: createWrapper() });

    // 1. Complete
    expect(view.getAllByText('COMPLETE (FIXTURE)').length).toBeGreaterThan(0);

    // 2. Downloading & Queued & Paused
    const downloadingTab = view.getByLabelText('Filter Downloading (डाउनलोड)');
    await act(async () => {
      fireEvent.press(downloadingTab);
    });
    expect(view.getByText(/DOWNLOADING PREVIEW \(45%\)/)).toBeTruthy();
    expect(view.getByText('QUEUED (FIXTURE)')).toBeTruthy();
    expect(view.getByText(/PAUSED PREVIEW \(60%\)/)).toBeTruthy();

    // 3. Stale
    const staleTab = view.getByLabelText('Filter Stale (पुरानो)');
    await act(async () => {
      fireEvent.press(staleTab);
    });
    expect(view.getByText('STALE (FIXTURE UPDATE PREVIEW)')).toBeTruthy();
    expect(view.getByText(/⚠️ Stale Fixture State — Future Update Preview/)).toBeTruthy();

    // 4. Issues (Failed, Storage Full, Partial)
    const issuesTab = view.getByLabelText('Filter Issues (समस्याहरू)');
    await act(async () => {
      fireEvent.press(issuesTab);
    });
    expect(view.getByText('FAILED (SIMULATED)')).toBeTruthy();
    expect(view.getByText('STORAGE FULL (FIXTURE)')).toBeTruthy();
    expect(view.getByText(/PARTIAL PREVIEW \(70%\)/)).toBeTruthy();
  });

  test('filters region cards across All, Downloading, Stale, and Issues tabs', async () => {
    const view = await render(<OfflineMapsScreen />, { wrapper: createWrapper() });

    // 1. "All" tab: should show Mustang, Bagmati, Everest, Pokhara, etc.
    expect(view.getByText('Annapurna & Mustang Circuit')).toBeTruthy();
    expect(view.getByText('Pokhara Valley & Sarangkot Ridge')).toBeTruthy();
    expect(view.getByText('Upper Dolpa & Shey Phoksundo')).toBeTruthy();

    // 2. "Downloading" tab: shows downloading, queued, and paused
    const downloadingTab = view.getByLabelText('Filter Downloading (डाउनलोड)');
    await act(async () => {
      fireEvent.press(downloadingTab);
    });
    expect(view.getByText('Solukhumbu & Everest Base Trail')).toBeTruthy();
    expect(view.getByText('Manang & Tilicho Lake High Route')).toBeTruthy();
    expect(view.getByText('Rara Lake & Mugu Frontier')).toBeTruthy();
    expect(view.queryByText('Annapurna & Mustang Circuit')).toBeNull();

    // 3. "Stale" tab: shows stale Pokhara region
    const staleTab = view.getByLabelText('Filter Stale (पुरानो)');
    await act(async () => {
      fireEvent.press(staleTab);
    });
    expect(view.getByText('Pokhara Valley & Sarangkot Ridge')).toBeTruthy();
    expect(view.queryByText('Solukhumbu & Everest Base Trail')).toBeNull();

    // 4. "Issues" tab: shows failed, storage_full, and partial
    const issuesTab = view.getByLabelText('Filter Issues (समस्याहरू)');
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
    const downloadingTab = view.getByLabelText('Filter Downloading (डाउनलोड)');
    await act(async () => {
      fireEvent.press(downloadingTab);
    });

    const pauseBtn = view.getByLabelText('Pause Solukhumbu & Everest Base Trail fixture download preview');
    await act(async () => {
      fireEvent.press(pauseBtn);
    });

    // Verify truth disclosure
    expect(view.getByText(/Paused preview · No real download transfer active/)).toBeTruthy();
    expect(view.getByText(/PAUSED PREVIEW \(45%\)/)).toBeTruthy();

    // Resume
    const resumeBtn = view.getByLabelText('Resume Solukhumbu & Everest Base Trail fixture download preview');
    await act(async () => {
      fireEvent.press(resumeBtn);
    });
    expect(view.getByText(/Resumed preview · Simulated progress only/)).toBeTruthy();
    expect(view.getByText(/DOWNLOADING PREVIEW \(45%\)/)).toBeTruthy();
  });

  test('handles retry preview interaction for failed regions', async () => {
    const view = await render(<OfflineMapsScreen />, { wrapper: createWrapper() });

    const issuesTab = view.getByLabelText('Filter Issues (समस्याहरू)');
    await act(async () => {
      fireEvent.press(issuesTab);
    });

    const retryBtn = view.getByLabelText('Retry Annapurna Sanctuary & ABC Trail simulated transfer');
    await act(async () => {
      fireEvent.press(retryBtn);
    });

    expect(view.getByText(/Retry preview only — no download started/)).toBeTruthy();
  });

  test('handles removal confirmation preview interaction with permanent truth disclosure', async () => {
    const view = await render(<OfflineMapsScreen />, { wrapper: createWrapper() });

    const removeBtn = view.getByLabelText('Remove Annapurna & Mustang Circuit fixture preview');
    await act(async () => {
      fireEvent.press(removeBtn);
    });

    const confirmBtn = view.getByLabelText('Confirm removal of Annapurna & Mustang Circuit fixture preview');
    await act(async () => {
      fireEvent.press(confirmBtn);
    });

    expect(view.getByText(/Removal preview only — no region was deleted/)).toBeTruthy();
  });

  test('forces MapSurface preview to unconditional cache_only network policy and displays fixture details', async () => {
    // Render under online snapshot to verify it STILL forces cache_only policy
    const view = await render(<OfflineMapsScreen />, {
      wrapper: createWrapper(connectionOnlineSnapshot),
    });

    expect(view.queryByText('REGION BOUNDS PREVIEW (Annapurna & Mustang Circuit)')).toBeNull();

    const showMapBtn = view.getByLabelText('Show region map bounds preview');
    await act(async () => {
      fireEvent.press(showMapBtn);
    });

    expect(view.getByText('REGION BOUNDS PREVIEW (Annapurna & Mustang Circuit)')).toBeTruthy();

    // Expand details and check fixture qualification
    const detailsBtn = view.getByLabelText('Show Annapurna & Mustang Circuit fixture details');
    await act(async () => {
      fireEvent.press(detailsBtn);
    });
    expect(view.getByText(/Checksum: 9a8f2c3d4e5f60718293a4b5/)).toBeTruthy();
    expect(view.getByText(/Fixture timestamp: 2026-08-10T04:00:00Z · Fixture expiry: 2026-11-10T04:00:00Z/)).toBeTruthy();
  });

  test('renders ProfileGarageScreen with explicit fixture labels for offline map packs', async () => {
    const view = await render(<ProfileGarageScreen />, { wrapper: createWrapper() });

    expect(view.getByText(/Nepal Offline Map Packs — Fixture Preview/)).toBeTruthy();
    expect(view.getAllByText('COMPLETE (FIXTURE)').length).toBeGreaterThan(0);
    expect(view.getByText('DOWNLOADING PREVIEW (45%)')).toBeTruthy();
    expect(view.getByText('QUEUED (FIXTURE)')).toBeTruthy();
    expect(view.getAllByText('STORAGE FULL (FIXTURE)').length).toBeGreaterThan(0);
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
      expect(view.getByText('Offline Maps — Fixture Preview')).toBeTruthy();
    }
  });
});
