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
 * 5. Embedded MapSurface bounds preview with OpenStreetMap attribution, unconditional cache_only policy,
 *    and truthful MapBaseState mapping (stale, partial, error, unavailable, fresh).
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
import { Icon } from '../components/primitives/Icon';
import { StorageSummaryBar } from '../components/offline/StorageSummaryBar';
import { OfflineRegionCard } from '../components/offline/OfflineRegionCard';
import { MapSurface } from '../components/map/MapSurface';
import { MarkerLayer } from '../components/map/MarkerLayer';
import { useTheme } from '../design/ThemeProvider';
import { useAppState } from '../state/AppStateContext';
import { primitive } from '../design/tokens';
import { OfflineRegion, OfflinePackLifecycle } from '../domain/offline';
import { MapRenderInput, MapBaseState, MapCoverage } from '../domain/map';
import { MapMarker } from '../domain/mapOverlay';
import { allOfflineRegionFixtures } from '../fixtures/offlineRegions.fixture';

export type OfflineFilterTab = 'all' | 'downloading' | 'stale' | 'issues';

export interface OfflineMapsScreenProps {
  onBackToMain?: () => void;
}

export const OfflineMapsScreen: React.FC<OfflineMapsScreenProps> = ({ onBackToMain }) => {
  const { colors, mode } = useTheme();
  const { connectionState } = useAppState();
  const isOffline =
    connectionState.mode === 'deadZone' || connectionState.mode === 'meshOnly';
  const isDayGlare = mode === 'dayGlare';

  // 1. Component-local state for active filter tab
  const [activeTab, setActiveTab] = useState<OfflineFilterTab>('all');

  // 2. Component-local state for offline region items
  const [regions, setRegions] = useState<OfflineRegion[]>(() =>
    allOfflineRegionFixtures.map((r) => ({ ...r }))
  );

  // 3. Component-local selected region for map preview
  const [selectedRegionId, setSelectedRegionId] = useState<string>(
    allOfflineRegionFixtures[0].id
  );

  // 4. Component-local toggle for map bounds preview surface
  const [showMapBoundsPreview, setShowMapBoundsPreview] = useState<boolean>(true);

  // 5. Action notice toast
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const selectedRegion = useMemo(() => {
    return regions.find((r) => r.id === selectedRegionId) ?? regions[0];
  }, [regions, selectedRegionId]);

  const handleLifecycleChange = (id: string, newLifecycle: OfflinePackLifecycle) => {
    setRegions((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          let progress = r.progressPercentage;
          if (newLifecycle === 'downloading' && (progress === undefined || progress === 0)) {
            progress = 35;
          }
          return { ...r, lifecycle: newLifecycle, progressPercentage: progress };
        }
        return r;
      })
    );
  };

  const handleSelectRegion = (region: OfflineRegion) => {
    setSelectedRegionId(region.id);
    setActionNotice(`Focused bounds for ${region.name}`);
  };

  const filterTabs: { tab: OfflineFilterTab; label: string; labelNepali: string }[] = [
    { tab: 'all', label: 'All Packs', labelNepali: 'सबै' },
    { tab: 'downloading', label: 'Downloading', labelNepali: 'डाउनलोडिङ' },
    { tab: 'stale', label: 'Updates', labelNepali: 'अपडेट' },
    { tab: 'issues', label: 'Issues', labelNepali: 'समस्या' },
  ];

  const filteredRegions = useMemo(() => {
    switch (activeTab) {
      case 'downloading':
        return regions.filter(
          (r) => r.lifecycle === 'downloading' || r.lifecycle === 'queued' || r.lifecycle === 'paused'
        );
      case 'stale':
        return regions.filter((r) => r.lifecycle === 'stale');
      case 'issues':
        return regions.filter(
          (r) => r.lifecycle === 'failed' || r.lifecycle === 'storage_full' || r.lifecycle === 'partial'
        );
      case 'all':
      default:
        return regions;
    }
  }, [regions, activeTab]);

  const getLifecycleBadgeVariant = (lifecycle: OfflinePackLifecycle) => {
    switch (lifecycle) {
      case 'complete':
        return 'volt';
      case 'downloading':
        return 'cyan';
      case 'queued':
        return 'neutral';
      case 'paused':
      case 'partial':
      case 'stale':
      case 'failed':
      case 'storage_full':
      default:
        return 'warning';
    }
  };

  const getLifecycleLabel = (lifecycle: OfflinePackLifecycle, progress?: number) => {
    switch (lifecycle) {
      case 'complete':
        return 'DOWNLOADED';
      case 'downloading':
        return `DOWNLOADING (${progress ?? 0}%)`;
      case 'queued':
        return 'QUEUED';
      case 'paused':
        return `PAUSED (${progress ?? 0}%)`;
      case 'partial':
        return `PARTIAL CACHE (${progress ?? 0}%)`;
      case 'stale':
        return 'UPDATE AVAILABLE';
      case 'failed':
        return 'TRANSFER ERROR';
      case 'storage_full':
        return 'STORAGE FULL';
    }
  };

  // Truthful mapping from offline pack lifecycle to MapSurface base state and coverage
  const getMapBaseStateAndCoverage = (
    lifecycle: OfflinePackLifecycle
  ): { baseState: MapBaseState; coverage: MapCoverage } => {
    switch (lifecycle) {
      case 'complete':
        return { baseState: 'fresh', coverage: { isCovered: true } };
      case 'downloading':
        return {
          baseState: 'fresh',
          coverage: { isCovered: false, missingAreaLabel: 'Downloading Sector' },
        };
      case 'queued':
        return {
          baseState: 'unavailable',
          coverage: { isCovered: false, missingAreaLabel: 'Queued Sector' },
        };
      case 'paused':
        return {
          baseState: 'partial',
          coverage: { isCovered: false, missingAreaLabel: 'Paused Sector' },
        };
      case 'partial':
        return {
          baseState: 'partial',
          coverage: {
            isCovered: false,
            missingAreaLabel: 'Gosaikunda High Altitude Sector (Above 4,300m)',
          },
        };
      case 'stale':
        return {
          baseState: 'stale',
          coverage: { isCovered: true, missingAreaLabel: 'Expired local cache' },
        };
      case 'failed':
        return {
          baseState: 'error',
          coverage: { isCovered: false, missingAreaLabel: 'Transfer Fault' },
        };
      case 'storage_full':
        return {
          baseState: 'unavailable',
          coverage: { isCovered: false, missingAreaLabel: 'Device Storage Full' },
        };
    }
  };

  // Map preview inputs — strictly unconditional cache_only network policy and truthful baseState
  const mapRenderInput: MapRenderInput = useMemo(() => {
    const centerLat =
      (selectedRegion.bounds.minLat + selectedRegion.bounds.maxLat) / 2;
    const centerLng =
      (selectedRegion.bounds.minLng + selectedRegion.bounds.maxLng) / 2;
    const { baseState, coverage } = getMapBaseStateAndCoverage(selectedRegion.lifecycle);

    return {
      camera: {
        center: { latitude: centerLat, longitude: centerLng },
        zoom: 8.5,
        bearingDegrees: 0,
        pitchDegrees: 0,
      },
      networkPolicy: 'cache_only',
      baseState,
      coverage,
      provenance: {
        source: 'OpenStreetMap Vector Contours (Offline Region)',
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
      {/* Back to Navigation affordance */}
      {onBackToMain && (
        <TouchableOpacity
          style={styles.backBtn}
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
        Offline Maps — Local Preview
      </Text>
      <Text variant="bodyMedium" muted style={styles.subtitle}>
        Offline map packs, storage management, and local cache status.
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
            No network connection. Operating from local offline storage.
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
          <View style={styles.noticeRow}>
            <Icon name="info" size={12} color={primitive.color.cyan[400]} style={{ marginRight: 6 }} />
            <Text variant="mono" style={{ color: primitive.color.cyan[400], fontSize: 11, fontWeight: '700' }}>
              {actionNotice}
            </Text>
          </View>
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
            <Badge
              label={getLifecycleLabel(selectedRegion.lifecycle, selectedRegion.progressPercentage)}
              variant={getLifecycleBadgeVariant(selectedRegion.lifecycle)}
              size="sm"
            />
          </View>
          <View style={[styles.mapContainer, { borderColor: colors.border }]}>
            <MapSurface input={mapRenderInput} style={{ flex: 1 }}>
              <MarkerLayer markers={previewMarkers} />
            </MapSurface>
          </View>
          <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10, marginTop: 4 }}>
            Local Bounding Box Preview · OpenStreetMap contributors
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
            <View style={styles.toggleBtnRow}>
              <Icon name={showMapBoundsPreview ? 'x' : 'navigation'} size={12} color={primitive.color.cyan[400]} style={{ marginRight: 4 }} />
              <Text variant="mono" style={{ color: primitive.color.cyan[400], fontSize: 11, fontWeight: '600' }}>
                {showMapBoundsPreview ? 'Hide Map' : 'Show Map Preview'}
              </Text>
            </View>
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
  noticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
