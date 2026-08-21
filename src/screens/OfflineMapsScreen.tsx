/**
 * ============================================================================
 * OFFLINE MAPS & REGION BROWSER SCREEN (R12)
 * ============================================================================
 *
 * Coordinates:
 * 1. Pre-authored storage capacity summary and segmented visual bar.
 * 2. 4-Tab filter selector (All, Downloading, Stale, Issues) using accessible tab semantics.
 * 3. Inspection of all 8 lifecycle states (queued, downloading, paused, partial, complete, stale, failed, storage_full).
 * 4. Component-local interactive previews (pause/resume, retry, remove confirmation).
 * 5. Embedded MapSurface bounds preview with OpenStreetMap attribution and unconditional cache_only policy.
 * 6. Offline/mesh connection banner awareness.
 * 7. 48dp minimum touch targets across all 4 themes (Night, Day Glare, Dusk, Blackout).
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Text } from '../components/primitives/Text';
import { Badge } from '../components/primitives/Badge';
import { StorageSummaryBar } from '../components/offline/StorageSummaryBar';
import { OfflineRegionCard } from '../components/offline/OfflineRegionCard';
import { MapSurface } from '../components/map/MapSurface';
import { MarkerLayer } from '../components/map/MarkerLayer';
import { useTheme } from '../design/ThemeProvider';
import { useAppState } from '../state/AppStateContext';
import { primitive } from '../design/tokens';
import { OfflineRegion, OfflinePackLifecycle } from '../domain/offline';
import { MapRenderInput } from '../domain/map';
import { MapMarker } from '../domain/mapOverlay';
import { allOfflineRegionFixtures } from '../fixtures/offlineRegions.fixture';

export type OfflineFilterTab = 'all' | 'downloading' | 'stale' | 'issues';

export interface OfflineMapsScreenProps {
  onBackToMain?: () => void;
}

export const OfflineMapsScreen: React.FC<OfflineMapsScreenProps> = ({
  onBackToMain,
}) => {
  const { colors, mode } = useTheme();
  const { connectionState } = useAppState();
  const isDayGlare = mode === 'dayGlare';

  // State: List of regions (cloned on mount for isolated component-local state)
  const [regions, setRegions] = useState<OfflineRegion[]>(() =>
    allOfflineRegionFixtures.map((r) => ({ ...r }))
  );
  const [activeTab, setActiveTab] = useState<OfflineFilterTab>('all');
  const [selectedRegionId, setSelectedRegionId] = useState<string>(
    allOfflineRegionFixtures[0].id
  );
  const [showMapBoundsPreview, setShowMapBoundsPreview] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const isOffline =
    connectionState.mode === 'deadZone' || connectionState.mode === 'meshOnly';

  // Filter tabs definition
  const filterTabs: { tab: OfflineFilterTab; label: string; labelNepali: string }[] = [
    { tab: 'all', label: 'All', labelNepali: 'सबै' },
    { tab: 'downloading', label: 'Downloading', labelNepali: 'डाउनलोड' },
    { tab: 'stale', label: 'Stale', labelNepali: 'पुरानो' },
    { tab: 'issues', label: 'Issues', labelNepali: 'समस्याहरू' },
  ];

  // Filtered regions list
  const filteredRegions = useMemo(() => {
    switch (activeTab) {
      case 'downloading':
        return regions.filter(
          (r) =>
            r.lifecycle === 'downloading' ||
            r.lifecycle === 'queued' ||
            r.lifecycle === 'paused'
        );
      case 'stale':
        return regions.filter((r) => r.lifecycle === 'stale');
      case 'issues':
        return regions.filter(
          (r) =>
            r.lifecycle === 'failed' ||
            r.lifecycle === 'storage_full' ||
            r.lifecycle === 'partial'
        );
      case 'all':
      default:
        return regions;
    }
  }, [regions, activeTab]);

  // Selected region for map preview
  const selectedRegion = useMemo(() => {
    return regions.find((r) => r.id === selectedRegionId) || regions[0];
  }, [regions, selectedRegionId]);

  // Lifecycle state transition handler (local state only)
  const handleLifecycleChange = (
    regionId: string,
    nextLifecycle: OfflinePackLifecycle
  ) => {
    setRegions((prev) =>
      prev.map((r) => (r.id === regionId ? { ...r, lifecycle: nextLifecycle } : r))
    );
  };

  // Map preview inputs — strictly unconditional cache_only network policy for R12 fixture preview
  const mapRenderInput: MapRenderInput = useMemo(() => {
    const centerLat =
      (selectedRegion.bounds.minLat + selectedRegion.bounds.maxLat) / 2;
    const centerLng =
      (selectedRegion.bounds.minLng + selectedRegion.bounds.maxLng) / 2;

    return {
      camera: {
        center: { latitude: centerLat, longitude: centerLng },
        zoom: 8.5,
        bearingDegrees: 0,
        pitchDegrees: 0,
      },
      networkPolicy: 'cache_only',
      baseState: selectedRegion.lifecycle === 'partial' ? 'partial' : 'fresh',
      coverage: { isCovered: selectedRegion.lifecycle === 'complete' },
      provenance: {
        source: 'OpenStreetMap Vector Contours (Offline Region Fixture)',
        sourceVersion: 'OSM-NP-2026.08.15',
        licence: 'Open Database Licence (ODbL) 1.0',
        attribution: '© OpenStreetMap contributors',
      },
    };
  }, [selectedRegion]);

  const previewMarkers: MapMarker[] = useMemo(() => {
    return [
      {
        id: `marker-${selectedRegion.id}-min`,
        kind: 'origin',
        position: { x: 25, y: 75 },
        label: `${selectedRegion.name} (SW)`,
      },
      {
        id: `marker-${selectedRegion.id}-max`,
        kind: 'destination',
        position: { x: 75, y: 25 },
        label: `${selectedRegion.name} (NE)`,
      },
    ];
  }, [selectedRegion]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Return Button */}
      {onBackToMain && (
        <TouchableOpacity
          style={[styles.backBtn, { borderColor: colors.borderSubtle }]}
          onPress={onBackToMain}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Back to main navigation"
        >
          <Text variant="mono" style={{ color: primitive.color.cyan[400], fontSize: 13, fontWeight: '600' }}>
            ← Back to Main Navigation
          </Text>
        </TouchableOpacity>
      )}

      {/* Screen Title & Subtitle */}
      <Text variant="h1" style={{ color: colors.text }}>
        Offline Maps — Fixture Preview
      </Text>
      <Text variant="bodyMedium" muted style={styles.subtitle}>
        Simulated map region packs, storage management, and offline lifecycle inspection.
      </Text>

      {/* Offline/Mesh Mode Banner */}
      {isOffline && (
        <View
          style={[
            styles.offlineBanner,
            {
              backgroundColor: isDayGlare ? primitive.color.snow[50] : colors.surfaceCard,
              borderColor: primitive.color.semantic.warning,
            },
          ]}
        >
          <Badge label="OFFLINE MESH MODE" variant="warning" size="sm" />
          <Text variant="bodySmall" style={{ color: colors.text, marginTop: 4, fontWeight: '600' }}>
            Operating in offline dead-zone / mesh mode.
          </Text>
          <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10, marginTop: 2 }}>
            No network downloads available. All offline region metadata is rendered from local fixture storage.
          </Text>
        </View>
      )}

      {/* Action Notice Message */}
      {actionNotice && (
        <View
          style={[
            styles.noticeBox,
            {
              backgroundColor: isDayGlare ? primitive.color.snow[50] : colors.surfaceElevated,
              borderColor: primitive.color.cyan[400],
            },
          ]}
        >
          <Text variant="mono" style={{ color: primitive.color.cyan[400], fontSize: 11, fontWeight: '700' }}>
            ℹ️ {actionNotice}
          </Text>
        </View>
      )}

      {/* 1. Storage Summary Bar */}
      <StorageSummaryBar />

      {/* 2. Optional Map Bounds Preview Surface */}
      {showMapBoundsPreview && (
        <View style={styles.mapPreviewSection}>
          <View style={styles.mapPreviewHeader}>
            <Text variant="bodySmall" muted style={{ fontWeight: '700', letterSpacing: 0.5 }}>
              REGION BOUNDS PREVIEW ({selectedRegion.name})
            </Text>
            <Badge label={selectedRegion.lifecycle.toUpperCase()} variant="volt" size="sm" />
          </View>
          <View style={[styles.mapContainer, { borderColor: colors.border }]}>
            <MapSurface input={mapRenderInput} style={{ flex: 1 }}>
              <MarkerLayer markers={previewMarkers} />
            </MapSurface>
          </View>
          <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10, marginTop: 4 }}>
            Synthetic Bounding Box Preview · OpenStreetMap contributors
          </Text>
        </View>
      )}

      {/* 3. Filter Tabs (All, Downloading, Stale, Issues) */}
      <View
        style={[styles.filterTablist, { backgroundColor: colors.surface, borderColor: colors.border }]}
        accessibilityRole="tablist"
        accessibilityLabel="Offline map pack filter categories"
      >
        {filterTabs.map((t) => {
          const isTabActive = activeTab === t.tab;
          return (
            <TouchableOpacity
              key={t.tab}
              style={[
                styles.filterTab,
                {
                  backgroundColor: isTabActive ? colors.surfaceElevated : 'transparent',
                  borderColor: isTabActive ? primitive.color.volt[400] : 'transparent',
                },
              ]}
              onPress={() => setActiveTab(t.tab)}
              accessible
              accessibilityRole="tab"
              accessibilityState={{ selected: isTabActive }}
              accessibilityLabel={`Filter ${t.label} (${t.labelNepali})`}
            >
              <Text
                variant="bodySmall"
                style={{
                  color: isTabActive ? colors.text : colors.textMuted,
                  fontWeight: isTabActive ? '700' : '500',
                  fontSize: 12,
                }}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 4. Regions List */}
      <View style={styles.regionsList}>
        <View style={styles.listHeaderRow}>
          <Text variant="h2" style={{ color: colors.text }}>
            Nepal Map Packs ({filteredRegions.length})
          </Text>
          <TouchableOpacity
            style={styles.toggleMapBtn}
            onPress={() => setShowMapBoundsPreview(!showMapBoundsPreview)}
            accessible
            accessibilityRole="button"
            accessibilityLabel={showMapBoundsPreview ? 'Hide region map bounds preview' : 'Show region map bounds preview'}
          >
            <Text variant="mono" style={{ color: primitive.color.cyan[400], fontSize: 11, fontWeight: '600' }}>
              {showMapBoundsPreview ? '✕ Hide Map' : '🗺️ Show Map Preview'}
            </Text>
          </TouchableOpacity>
        </View>

        {filteredRegions.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: colors.surfaceCard, borderColor: colors.borderSubtle }]}>
            <Text variant="bodyMedium" muted style={{ textAlign: 'center' }}>
              No offline map packs match the selected filter.
            </Text>
          </View>
        ) : (
          filteredRegions.map((region) => (
            <OfflineRegionCard
              key={region.id}
              region={region}
              isSelected={selectedRegion.id === region.id}
              onSelect={(r) => {
                setSelectedRegionId(r.id);
                setShowMapBoundsPreview(true);
              }}
              onLifecycleChange={handleLifecycleChange}
              onActionNotice={(msg) => setActionNotice(msg)}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: primitive.spacing[4],
    paddingTop: 56,
    paddingBottom: 120,
  },
  backBtn: {
    minHeight: 48,
    justifyContent: 'center',
    marginBottom: primitive.spacing[3],
  },
  subtitle: {
    marginTop: primitive.spacing[1],
    marginBottom: primitive.spacing[4],
  },
  offlineBanner: {
    padding: primitive.spacing[3],
    borderRadius: primitive.radius.md,
    borderWidth: 1,
    marginBottom: primitive.spacing[4],
  },
  noticeBox: {
    padding: primitive.spacing[3],
    borderRadius: primitive.radius.md,
    borderWidth: 1,
    marginBottom: primitive.spacing[4],
  },
  mapPreviewSection: {
    marginBottom: primitive.spacing[4],
  },
  mapPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: primitive.spacing[2],
  },
  mapContainer: {
    height: 200,
    borderRadius: primitive.radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  filterTablist: {
    flexDirection: 'row',
    borderRadius: primitive.radius.lg,
    padding: 3,
    borderWidth: 1,
    marginBottom: primitive.spacing[4],
  },
  filterTab: {
    flex: 1,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: primitive.radius.md,
    borderWidth: 1.5,
  },
  regionsList: {
    marginBottom: primitive.spacing[4],
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: primitive.spacing[3],
  },
  toggleMapBtn: {
    minHeight: 48,
    minWidth: 48,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: primitive.spacing[2],
  },
  emptyBox: {
    padding: primitive.spacing[4],
    borderRadius: primitive.radius.md,
    borderWidth: 1,
    marginTop: primitive.spacing[2],
  },
});
