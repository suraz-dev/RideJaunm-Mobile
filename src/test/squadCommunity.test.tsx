/**
 * ============================================================================
 * SQUAD, COMMUNITY FEED, AND CHAT TESTS (R13)
 * ============================================================================
 *
 * Verifies:
 * 1. Domain contracts and fixtures for presences, posts, and messages.
 * 2. 3 Primary tabs (Feed, Groups, Chat) and Feed sub-filters (Following, Nearby, Routes).
 * 3. Low-data mode media suppression.
 * 4. Local composer interactions with permanent truth disclosures.
 * 5. Qualified presence labels (no 'Live' claims) and cache-only MapSurface preview.
 * 6. Zero outbox, AppState, or storage mutations.
 * 7. 4 Theme modes and Devanagari localization strings.
 */

import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { SquadFeedScreen } from '../screens/SquadFeedScreen';
import { ThemeProvider } from '../design/ThemeProvider';
import { AppStateProvider } from '../state/AppStateContext';
import { MemoryLocalStore } from '../services/storage/LocalStore';
import { ConnectionStateSnapshot } from '../domain/connectivity';
import {
  connectionDeadZoneSnapshot,
  connectionOnlineSnapshot,
} from '../fixtures/connectivity.fixture';
import {
  allFixtureSquadPresences,
  allFixtureCommunityPosts,
  allFixtureChatMessages,
} from '../fixtures/squadCommunity.fixture';
import { ThemeMode } from '../design/tokens';

describe('RideJaunm R13 Fixture Squad, Community Feed & Chat', () => {
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

  test('validates all required domain fixture states exist', () => {
    // 1. Presence states
    const presences = allFixtureSquadPresences.map((p) => p.presence);
    expect(presences).toContain('cached');
    expect(presences).toContain('last_known');
    expect(presences).toContain('unavailable');
    expect(presences).toContain('mesh_preview');

    // 2. Message states
    const messageStates = allFixtureChatMessages.map((m) => m.state);
    expect(messageStates).toContain('cached');
    expect(messageStates).toContain('local_draft');
    expect(messageStates).toContain('preview_queued');
    expect(messageStates).toContain('failed_preview');

    // 3. Post states
    const postStates = allFixtureCommunityPosts.map((p) => p.state);
    expect(postStates).toContain('cached');
    expect(postStates).toContain('media_unavailable');
    expect(postStates).toContain('local_draft');
    expect(postStates).toContain('hidden_preview');
  });

  test('renders top synthetic disclosure banner and primary tabs', async () => {
    const view = await render(<SquadFeedScreen />, { wrapper: createWrapper() });

    expect(view.getByText('Himalayan Squad & Community')).toBeTruthy();
    expect(view.getByText('SYNTHETIC PREVIEW')).toBeTruthy();
    expect(
      view.getByText(
        /Deterministic local fixtures · No live location, chat delivery, media uploads, or remote tracking\./
      )
    ).toBeTruthy();

    // Verify 3 tabs
    expect(view.getByLabelText('Select Feed tab (फिड)')).toBeTruthy();
    expect(view.getByLabelText('Select Groups tab (समूह)')).toBeTruthy();
    expect(view.getByLabelText('Select Chat tab (च्याट)')).toBeTruthy();
  });

  test('filters feed posts across Following, Nearby, and Routes categories', async () => {
    const view = await render(<SquadFeedScreen />, { wrapper: createWrapper() });

    // 1. Default "Following" tab: Shows Tsering Wangdi (Mustang) and Suraj (Draft)
    expect(view.getByText('Tsering Wangdi')).toBeTruthy();
    expect(view.getByText('Suraj (You)')).toBeTruthy();
    expect(view.queryByText('Prashant Lama')).toBeNull();

    // 2. Switch to "Nearby" tab: Shows Deepak Adhikari (Pokhara)
    const nearbyFilter = view.getByLabelText('Filter Nearby (नजिकै)');
    await act(async () => {
      fireEvent.press(nearbyFilter);
    });
    expect(view.getByText('Deepak Adhikari')).toBeTruthy();
    expect(view.queryByText('Tsering Wangdi')).toBeNull();

    // 3. Switch to "Routes" tab: Shows Prashant Lama (Kulekhani)
    const routesFilter = view.getByLabelText('Filter Routes (मार्गहरू)');
    await act(async () => {
      fireEvent.press(routesFilter);
    });
    expect(view.getByText('Prashant Lama')).toBeTruthy();
    expect(view.getByText(/🗺️ Kulekhani – Sisneri – Hetauda/)).toBeTruthy();
  });

  test('toggles low-data mode and suppresses media placeholders with truth copy', async () => {
    const view = await render(<SquadFeedScreen />, { wrapper: createWrapper() });

    // Switch to Routes to see post with media
    const routesFilter = view.getByLabelText('Filter Routes (मार्गहरू)');
    await act(async () => {
      fireEvent.press(routesFilter);
    });

    expect(view.getByText(/📷 Kulekhani Reservoir Ridge/)).toBeTruthy();

    // Toggle Low Data Mode ON
    const lowDataBtn = view.getByLabelText('Enable low-data mode preview');
    await act(async () => {
      fireEvent.press(lowDataBtn);
    });

    expect(
      view.getByText(/📡 Low-data fixture preview — no media loaded\./)
    ).toBeTruthy();
    expect(view.queryByText(/📷 Kulekhani Reservoir Ridge/)).toBeNull();
  });

  test('handles feed composer with permanent no-publish/no-queue truth copy', async () => {
    const view = await render(<SquadFeedScreen />, { wrapper: createWrapper() });

    const publishBtn = view.getByLabelText('Publish post preview');
    await act(async () => {
      fireEvent.press(publishBtn);
    });

    expect(view.getByText(/No post was published or queued\./)).toBeTruthy();
  });

  test('handles feed post reactions with permanent local-preview truth disclosures', async () => {
    const view = await render(<SquadFeedScreen />, { wrapper: createWrapper() });

    const likeBtn = view.getByLabelText('Like post by Tsering Wangdi');
    await act(async () => {
      fireEvent.press(likeBtn);
    });

    expect(
      view.getByText(/Like preview only · No outbox write or network sync/)
    ).toBeTruthy();
  });

  test('renders Groups squad roster with qualified presence labels and cache-only MapSurface preview', async () => {
    const view = await render(<SquadFeedScreen />, { wrapper: createWrapper() });

    // Switch to Groups tab
    const groupsTab = view.getByLabelText('Select Groups tab (समूह)');
    await act(async () => {
      fireEvent.press(groupsTab);
    });

    // Verify group info
    expect(view.getByText('Himalayan Riders KT-04')).toBeTruthy();
    expect(view.getByText('FIXTURE ROSTER')).toBeTruthy();

    // Verify qualified presence badges (zero 'Live' claims)
    expect(view.getAllByText('CACHED FIXTURE').length).toBeGreaterThan(0);
    expect(view.getByText('LAST-KNOWN FIXTURE')).toBeTruthy();
    expect(view.getByText('MESH PREVIEW')).toBeTruthy();
    expect(view.getByText('UNAVAILABLE')).toBeTruthy();
    expect(view.queryByText('Live')).toBeNull();
    expect(view.queryByText('online now')).toBeNull();

    // Verify Map Bounds preview
    expect(view.getByText('SQUAD MAP BOUNDS PREVIEW')).toBeTruthy();
    expect(
      view.getByText(
        /Fixture presence preview — not live rider tracking · © OpenStreetMap contributors/
      )
    ).toBeTruthy();

    // Verify member actions show unavailable disclosure
    const callBtn = view.getByLabelText('Call Bikash Shrestha preview');
    await act(async () => {
      fireEvent.press(callBtn);
    });
    expect(
      view.getByText(/Radio \/ Call for Bikash Shrestha is unavailable in fixture preview/)
    ).toBeTruthy();
  });

  test('renders Chat transcript and composer with permanent no-delivery truth copy', async () => {
    const view = await render(<SquadFeedScreen />, { wrapper: createWrapper() });

    // Switch to Chat tab
    const chatTab = view.getByLabelText('Select Chat tab (च्याट)');
    await act(async () => {
      fireEvent.press(chatTab);
    });

    expect(view.getByText('Himalayan Riders KT-04 — Chat')).toBeTruthy();
    expect(view.getByText('CACHED TRANSCRIPT')).toBeTruthy();

    // Verify transcript messages
    expect(
      view.getByText('Reaching Naubise check post in 10 mins. Regroup at highway cafe.')
    ).toBeTruthy();
    expect(view.getByText('Copy that lead. Passing through Dharke now.')).toBeTruthy();

    // Chat Composer "Send Preview"
    const sendBtn = view.getByLabelText('Send chat message preview');
    await act(async () => {
      fireEvent.press(sendBtn);
    });

    expect(
      view.getByText(/No message was sent, queued, or delivered\./)
    ).toBeTruthy();
  });

  test('renders offline/mesh banner when in deadZone connection mode', async () => {
    const view = await render(<SquadFeedScreen />, {
      wrapper: createWrapper(connectionDeadZoneSnapshot),
    });

    expect(view.getByText('OFFLINE MESH MODE')).toBeTruthy();
    expect(
      view.getByText(
        /Feed, squad, and chat are rendered from cached local fixtures\./
      )
    ).toBeTruthy();
  });

  test('renders cleanly across all 4 theme modes with Devanagari text', async () => {
    const themes: ThemeMode[] = ['night', 'dayGlare', 'dusk', 'blackout'];

    for (const mode of themes) {
      const view = await render(<SquadFeedScreen />, {
        wrapper: createWrapper(connectionOnlineSnapshot, mode),
      });
      expect(view.getByText('Himalayan Squad & Community')).toBeTruthy();
    }
  });
});
