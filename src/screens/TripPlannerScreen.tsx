/**
 * ============================================================================
 * TRIP PLANNER & ROUTE COMPARISON SCREEN (R10 & R11)
 * ============================================================================
 *
 * Coordinates:
 * 1. Editable Origin & Destination search against synthetic Nepal fixture catalog.
 * 2. Visible PlannerSearchState (idle, searching_fixture, results, no_results, offline_cached).
 * 3. Solo vs Group planning intent (with interactive R11 squad readiness handoff).
 * 4. 3-Way Route Candidate comparison (Straight, Curvy, Supercurvy).
 * 5. Explicit handling of Terai/Flat and Upper Mustang permit restrictions.
 * 6. Intermediate waypoint editor (add, remove with confirmation, reorder).
 * 7. Fixture Map Surface Preview connected directly to candidate selection.
 * 8. Minimum 48dp touch targets and truthful disclosures across all 4 themes.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Text } from '../components/primitives/Text';
import { Badge } from '../components/primitives/Badge';
import { Button } from '../components/primitives/Button';
import { CandidateComparisonCard } from '../components/planner/CandidateComparisonCard';
import { WaypointEditor } from '../components/planner/WaypointEditor';
import { MapSurface } from '../components/map/MapSurface';
import { RouteLayer } from '../components/map/RouteLayer';
import { MarkerLayer } from '../components/map/MarkerLayer';
import { TripReadinessScreen } from './TripReadinessScreen';
import { useTheme } from '../design/ThemeProvider';
import { useAppState } from '../state/AppStateContext';
import { primitive } from '../design/tokens';
import {
  PlanningMode,
  PlannerSearchState,
  PlannerPlace,
  PlannerWaypoint,
  PlannerRouteCandidate,
} from '../domain/tripPlanner';
import { MapRenderInput } from '../domain/map';
import { RouteLayerInput, MapMarker } from '../domain/mapOverlay';
import {
  nepalPlacesFixtureCatalog,
  kathmanduToPokharaPlannerCandidates,
  teraiCorridorPlannerCandidates,
  upperMustangPermitPlannerCandidates,
  suggestedWaypointsCatalog,
} from '../fixtures/tripPlanner.fixture';
import {
  curvyRouteTraceFixture,
  straightRouteTraceFixture,
  supercurvyRouteTraceFixture,
} from '../fixtures/routeOverlays.fixture';

export interface TripPlannerScreenProps {
  forceOfflineSearchState?: boolean;
}

export const TripPlannerScreen: React.FC<TripPlannerScreenProps> = ({
  forceOfflineSearchState = false,
}) => {
  const { colors, mode } = useTheme();
  const { connectionState } = useAppState();
  const isDayGlare = mode === 'dayGlare';

  // Planning intent: Solo vs Group (R11 squad handoff)
  const [planningMode, setPlanningMode] = useState<PlanningMode>('solo');
  const [showReadinessScreen, setShowReadinessScreen] = useState(false);

  // Editable Origin & Destination State
  const [originPlace, setOriginPlace] = useState<PlannerPlace>(nepalPlacesFixtureCatalog[0]); // Kathmandu
  const [destinationPlace, setDestinationPlace] = useState<PlannerPlace>(nepalPlacesFixtureCatalog[1]); // Pokhara

  // Place Search State
  const [searchTarget, setSearchTarget] = useState<'origin' | 'destination' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Waypoints State
  const [waypoints, setWaypoints] = useState<PlannerWaypoint[]>([
    suggestedWaypointsCatalog[0], // Kurintar
    suggestedWaypointsCatalog[1], // Mugling
  ]);

  // Fixture Map Preview Toggle
  const [showMapPreview, setShowMapPreview] = useState(true);

  const isOffline =
    forceOfflineSearchState ||
    connectionState.mode === 'deadZone' ||
    connectionState.mode === 'meshOnly';

  // Derive candidate list based on destination (Kathmandu-Pokhara, Terai, or Mustang)
  const candidateList: PlannerRouteCandidate[] = useMemo(() => {
    if (destinationPlace.id === 'place-janakpur' || destinationPlace.id === 'place-biratnagar') {
      return teraiCorridorPlannerCandidates;
    }
    if (destinationPlace.id === 'place-mustang') {
      return upperMustangPermitPlannerCandidates;
    }
    return kathmanduToPokharaPlannerCandidates;
  }, [destinationPlace]);

  // Selected Candidate (Curvy is the initial default)
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(() => {
    const defaultCand =
      kathmanduToPokharaPlannerCandidates.find(
        (c) => c.profile === 'curvy' && c.availability !== 'unavailable'
      ) || kathmanduToPokharaPlannerCandidates[0];
    return defaultCand.id;
  });

  const selectedCandidate = useMemo(() => {
    return candidateList.find((c) => c.id === selectedCandidateId) || candidateList[0];
  }, [candidateList, selectedCandidateId]);

  // Search Results against synthetic catalog
  const searchResults: PlannerPlace[] = useMemo(() => {
    if (!searchQuery.trim()) {
      return isOffline ? nepalPlacesFixtureCatalog : [];
    }
    const query = searchQuery.toLowerCase().trim();
    return nepalPlacesFixtureCatalog.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        (p.nameNepali && p.nameNepali.includes(query)) ||
        (p.region && p.region.toLowerCase().includes(query))
    );
  }, [searchQuery, isOffline]);

  // Explicit PlannerSearchState derivation
  const searchState: PlannerSearchState = useMemo(() => {
    if (searchTarget === null) return 'idle';
    if (isOffline) return 'offline_cached';
    if (searchQuery.trim().length === 0) return 'searching_fixture';
    if (searchResults.length > 0) return 'results';
    return 'no_results';
  }, [searchTarget, isOffline, searchQuery, searchResults]);

  // Place selection handler for both Origin and Destination
  const handleSelectPlace = (place: PlannerPlace) => {
    if (searchTarget === 'origin') {
      setOriginPlace(place);
    } else if (searchTarget === 'destination') {
      setDestinationPlace(place);
      const nextCandidates =
        place.id === 'place-janakpur' || place.id === 'place-biratnagar'
          ? teraiCorridorPlannerCandidates
          : place.id === 'place-mustang'
          ? upperMustangPermitPlannerCandidates
          : kathmanduToPokharaPlannerCandidates;

      const defaultCurvy =
        nextCandidates.find((c) => c.profile === 'curvy' && c.availability !== 'unavailable') ||
        nextCandidates[0];
      setSelectedCandidateId(defaultCurvy.id);
    }
    setSearchQuery('');
    setSearchTarget(null);
  };

  // Waypoint operations
  const handleAddWaypoint = (suggested: PlannerWaypoint) => {
    const newWp: PlannerWaypoint = {
      ...suggested,
      id: `wp-${Date.now()}`,
      order: waypoints.length + 1,
      state: 'selected',
    };
    setWaypoints([...waypoints, newWp]);
  };

  const handleRemoveWaypoint = (id: string) => {
    const filtered = waypoints.filter((w) => w.id !== id);
    const reindexed = filtered.map((w, idx) => ({ ...w, order: idx + 1 }));
    setWaypoints(reindexed);
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const next = [...waypoints];
    const temp = next[index];
    next[index] = next[index - 1];
    next[index - 1] = temp;
    const reindexed = next.map((w, idx) => ({ ...w, order: idx + 1 }));
    setWaypoints(reindexed);
  };

  const handleMoveDown = (index: number) => {
    if (index >= waypoints.length - 1) return;
    const next = [...waypoints];
    const temp = next[index];
    next[index] = next[index + 1];
    next[index + 1] = temp;
    const reindexed = next.map((w, idx) => ({ ...w, order: idx + 1 }));
    setWaypoints(reindexed);
  };

  // Dynamic Map Render Input & Overlays connected to selected candidate profile
  const activeRouteTrace: RouteLayerInput = useMemo(() => {
    switch (selectedCandidate.profile) {
      case 'supercurvy':
        return supercurvyRouteTraceFixture;
      case 'straight':
        return straightRouteTraceFixture;
      case 'curvy':
      default:
        return curvyRouteTraceFixture;
    }
  }, [selectedCandidate.profile]);

  const mapRenderInput: MapRenderInput = useMemo(() => {
    return {
      camera: {
        center: { latitude: 27.7172, longitude: 85.324 },
        zoom: 9.5,
        bearingDegrees: 0,
        pitchDegrees: 0,
      },
      networkPolicy: isOffline ? 'cache_only' : 'online',
      baseState: 'fresh',
      coverage: { isCovered: true },
      provenance: {
        source: 'OpenStreetMap Vector Contours (Synthetic Fixture)',
        sourceVersion: 'OSM-NP-2026.08.15',
        licence: 'Open Database Licence (ODbL) 1.0',
        attribution: '© OpenStreetMap contributors',
      },
    };
  }, [isOffline]);

  const previewMarkers: MapMarker[] = useMemo(() => {
    const list: MapMarker[] = [
      {
        id: 'marker-origin',
        kind: 'origin',
        position: { x: 18, y: 78 },
        label: originPlace.name,
      },
      {
        id: 'marker-destination',
        kind: 'destination',
        position: { x: 82, y: 22 },
        label: destinationPlace.name,
      },
    ];

    waypoints.forEach((wp, idx) => {
      list.push({
        id: wp.id,
        kind: 'waypoint',
        position: { x: 30 + idx * 20, y: 60 - idx * 15 },
        label: wp.place.name,
      });
    });

    return list;
  }, [originPlace, destinationPlace, waypoints]);

  // If readiness screen is active, render it
  if (showReadinessScreen) {
    return <TripReadinessScreen onBackToPlanner={() => setShowReadinessScreen(false)} />;
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Screen Title */}
      <Text variant="h1" style={{ color: colors.text }}>
        Trip Planner (यात्रा योजना)
      </Text>
      <Text variant="bodyMedium" muted style={styles.subtitle}>
        Deterministic route candidates across Nepal's passes, highways, and valleys.
      </Text>

      {/* 1. Solo vs Group Planning Intent Switcher */}
      <View
        style={[styles.modeSwitcher, { backgroundColor: colors.surface, borderColor: colors.border }]}
        accessibilityRole="radiogroup"
        accessibilityLabel="Planning mode selection: Solo or Squad"
      >
        <TouchableOpacity
          style={[
            styles.modeTab,
            {
              backgroundColor: planningMode === 'solo' ? colors.surfaceElevated : 'transparent',
              borderColor: planningMode === 'solo' ? primitive.color.volt[400] : 'transparent',
            },
          ]}
          onPress={() => setPlanningMode('solo')}
          accessible
          accessibilityRole="radio"
          accessibilityState={{ selected: planningMode === 'solo' }}
          accessibilityLabel="Solo Ride: Individual rider planning"
        >
          <Text
            variant="bodySmall"
            style={{
              color: planningMode === 'solo' ? colors.text : colors.textMuted,
              fontWeight: planningMode === 'solo' ? '700' : '500',
            }}
          >
            🏍️ Solo Ride (एकल)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modeTab,
            {
              backgroundColor: planningMode === 'group_fixture' ? colors.surfaceElevated : 'transparent',
              borderColor: planningMode === 'group_fixture' ? primitive.color.route.supercurvy : 'transparent',
            },
          ]}
          onPress={() => setPlanningMode('group_fixture')}
          accessible
          accessibilityRole="radio"
          accessibilityState={{ selected: planningMode === 'group_fixture' }}
          accessibilityLabel="Squad Ride: Group fixture preview"
        >
          <Text
            variant="bodySmall"
            style={{
              color: planningMode === 'group_fixture' ? colors.text : colors.textMuted,
              fontWeight: planningMode === 'group_fixture' ? '700' : '500',
            }}
          >
            👥 Squad Ride (R11 Preview)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Group Mode R11 Readiness Handoff Card */}
      {planningMode === 'group_fixture' && (
        <View
          style={[
            styles.squadNoticeCard,
            {
              backgroundColor: isDayGlare ? primitive.color.snow[50] : colors.surfaceCard,
              borderColor: primitive.color.route.supercurvy,
            },
          ]}
        >
          <Badge label="TASK R11 SQUAD READINESS" variant="supercurvy" size="sm" />
          <Text variant="bodyLarge" style={{ color: colors.text, fontWeight: '700', marginTop: primitive.spacing[2] }}>
            Himalayan Ridge Riders Squad (4 Members)
          </Text>
          <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 11, marginTop: 2 }}>
            Lead: Bikash · Sweep: Rabin · Riders: Suraj, Anish
          </Text>
          <Text variant="bodySmall" muted style={{ marginTop: primitive.spacing[2] }}>
            Inspect squad roster, assign local planning roles, and verify multi-factor pre-ride trip readiness.
          </Text>

          <Button
            label="OPEN SQUAD READINESS PREVIEW (तयारी पूर्वावलोकन)"
            onPress={() => setShowReadinessScreen(true)}
            variant="secondary"
            style={{ marginTop: primitive.spacing[3], minHeight: 48 }}
          />
        </View>
      )}

      {/* 2. Destination & Origin Search Card */}
      <View style={[styles.corridorCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {/* Origin Row with Editable Search */}
        <View style={styles.corridorRow}>
          <View style={styles.destHeaderRow}>
            <Text variant="bodySmall" muted style={{ fontSize: 10, letterSpacing: 0.5 }}>
              ORIGIN (सुरुवात)
            </Text>
            <TouchableOpacity
              onPress={() => {
                setSearchTarget(searchTarget === 'origin' ? null : 'origin');
                setSearchQuery('');
              }}
              style={styles.searchToggleBtn}
              accessible
              accessibilityRole="button"
              accessibilityLabel={searchTarget === 'origin' ? 'Close origin search' : 'Change trip origin location'}
            >
              <Text variant="mono" style={{ color: primitive.color.cyan[400], fontSize: 12, fontWeight: '600' }}>
                {searchTarget === 'origin' ? '✕ Close' : '🔍 Change Origin'}
              </Text>
            </TouchableOpacity>
          </View>

          {searchTarget !== 'origin' ? (
            <>
              <Text variant="bodyLarge" style={{ color: colors.text, fontWeight: '700' }}>
                {originPlace.name} {originPlace.nameNepali && `(${originPlace.nameNepali})`}
              </Text>
              <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10 }}>
                {originPlace.region}
              </Text>
            </>
          ) : (
            <View style={styles.searchBox}>
              <TextInput
                style={[
                  styles.searchInput,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder="Search Nepal origin (e.g. Kathmandu, Biratnagar)..."
                placeholderTextColor={colors.textSubtle}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
                accessible
                accessibilityLabel="Search Nepal origin places fixture catalog"
              />

              {/* Visible Offline Catalogue State */}
              {searchState === 'offline_cached' && (
                <View
                  style={[
                    styles.searchStatusBanner,
                    {
                      backgroundColor: isDayGlare ? primitive.color.snow[50] : colors.surfaceCard,
                      borderColor: primitive.color.semantic.warning,
                    },
                  ]}
                >
                  <Badge label="OFFLINE FIXTURE CATALOGUE" variant="warning" size="sm" />
                  <Text variant="bodySmall" style={{ color: colors.text, marginTop: 4, fontWeight: '600' }}>
                    Offline Mode · Searching local pre-loaded synthetic Nepal places only
                  </Text>
                  <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10, marginTop: 2 }}>
                    No cellular network connection · Operating from local fixture storage
                  </Text>
                </View>
              )}

              {/* Search Results List */}
              <View style={[styles.resultsList, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                {searchState === 'no_results' ? (
                  <View style={styles.resultItem}>
                    <Badge label="NO MATCHES" variant="neutral" size="sm" />
                    <Text variant="bodySmall" muted style={{ marginTop: 4 }}>
                      No places found in Nepal fixture catalog.
                    </Text>
                  </View>
                ) : (
                  searchResults.map((place) => (
                    <TouchableOpacity
                      key={place.id}
                      style={[styles.resultItem, { borderBottomColor: colors.borderSubtle }]}
                      onPress={() => handleSelectPlace(place)}
                      accessible
                      accessibilityRole="button"
                      accessibilityLabel={`Select origin: ${place.name}`}
                    >
                      <View style={styles.resultItemHeader}>
                        <Text variant="bodyLarge" style={{ color: colors.text, fontWeight: '600' }}>
                          {place.name}
                        </Text>
                        <Badge
                          label={place.source === 'offline_fixture_catalog' ? 'OFFLINE PACK' : 'FIXTURE'}
                          variant={place.source === 'offline_fixture_catalog' ? 'cyan' : 'neutral'}
                          size="sm"
                        />
                      </View>
                      <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10, marginTop: 2 }}>
                        {place.region} · {place.nameNepali}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </View>
          )}
        </View>

        <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />

        {/* Destination Row with Editable Search */}
        <View style={styles.corridorRow}>
          <View style={styles.destHeaderRow}>
            <Text variant="bodySmall" muted style={{ fontSize: 10, letterSpacing: 0.5 }}>
              DESTINATION (गन्तव्य)
            </Text>
            <TouchableOpacity
              onPress={() => {
                setSearchTarget(searchTarget === 'destination' ? null : 'destination');
                setSearchQuery('');
              }}
              style={styles.searchToggleBtn}
              accessible
              accessibilityRole="button"
              accessibilityLabel={searchTarget === 'destination' ? 'Close destination search' : 'Change trip destination location'}
            >
              <Text variant="mono" style={{ color: primitive.color.cyan[400], fontSize: 12, fontWeight: '600' }}>
                {searchTarget === 'destination' ? '✕ Close' : '🔍 Change Destination'}
              </Text>
            </TouchableOpacity>
          </View>

          {searchTarget !== 'destination' ? (
            <>
              <Text variant="bodyLarge" style={{ color: primitive.color.volt[400], fontWeight: '700' }}>
                {destinationPlace.name} {destinationPlace.nameNepali && `(${destinationPlace.nameNepali})`}
              </Text>
              <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10 }}>
                {destinationPlace.region}
              </Text>
            </>
          ) : (
            <View style={styles.searchBox}>
              <TextInput
                style={[
                  styles.searchInput,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder="Search Nepal destination (e.g. Pokhara, Mustang, Janakpur)..."
                placeholderTextColor={colors.textSubtle}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
                accessible
                accessibilityLabel="Search Nepal places fixture catalog"
              />

              {/* Visible Offline Catalogue State */}
              {searchState === 'offline_cached' && (
                <View
                  style={[
                    styles.searchStatusBanner,
                    {
                      backgroundColor: isDayGlare ? primitive.color.snow[50] : colors.surfaceCard,
                      borderColor: primitive.color.semantic.warning,
                    },
                  ]}
                >
                  <Badge label="OFFLINE FIXTURE CATALOGUE" variant="warning" size="sm" />
                  <Text variant="bodySmall" style={{ color: colors.text, marginTop: 4, fontWeight: '600' }}>
                    Offline Mode · Searching local pre-loaded synthetic Nepal places only
                  </Text>
                  <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10, marginTop: 2 }}>
                    No cellular network connection · Operating from local fixture storage
                  </Text>
                </View>
              )}

              {/* Search Results List */}
              <View style={[styles.resultsList, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                {searchState === 'no_results' ? (
                  <View style={styles.resultItem}>
                    <Badge label="NO MATCHES" variant="neutral" size="sm" />
                    <Text variant="bodySmall" muted style={{ marginTop: 4 }}>
                      No places found in Nepal fixture catalog.
                    </Text>
                  </View>
                ) : (
                  searchResults.map((place) => (
                    <TouchableOpacity
                      key={place.id}
                      style={[styles.resultItem, { borderBottomColor: colors.borderSubtle }]}
                      onPress={() => handleSelectPlace(place)}
                      accessible
                      accessibilityRole="button"
                      accessibilityLabel={`Select destination: ${place.name}`}
                    >
                      <View style={styles.resultItemHeader}>
                        <Text variant="bodyLarge" style={{ color: colors.text, fontWeight: '600' }}>
                          {place.name}
                        </Text>
                        <Badge
                          label={place.source === 'offline_fixture_catalog' ? 'OFFLINE PACK' : 'FIXTURE'}
                          variant={place.source === 'offline_fixture_catalog' ? 'cyan' : 'neutral'}
                          size="sm"
                        />
                      </View>
                      <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10, marginTop: 2 }}>
                        {place.region} · {place.nameNepali}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </View>
          )}
        </View>
      </View>

      {/* 3. Connected Fixture Map Trace Preview Surface */}
      {showMapPreview && (
        <View style={styles.mapPreviewWrapper}>
          <View style={styles.mapPreviewHeader}>
            <Text variant="bodySmall" muted style={{ fontWeight: '700', letterSpacing: 0.5 }}>
              SYNTHETIC FIXTURE ROUTE TRACE PREVIEW
            </Text>
            <Badge label={selectedCandidate.profile.toUpperCase()} variant="volt" size="sm" />
          </View>
          <View style={[styles.mapContainer, { borderColor: colors.border }]}>
            <MapSurface input={mapRenderInput} style={{ flex: 1 }}>
              <RouteLayer routes={[{ ...activeRouteTrace, isSelected: true }]} />
              <MarkerLayer markers={previewMarkers} />
            </MapSurface>
          </View>
          <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10, marginTop: 4 }}>
            Synthetic Map Trace · Pre-computed Nepal fixture data (OpenStreetMap contributors)
          </Text>
        </View>
      )}

      {/* 4. 3-Way Route Candidates Comparison */}
      <View style={styles.candidatesSection}>
        <View style={styles.sectionTitleRow}>
          <Text variant="h2" style={{ color: colors.text }}>
            Route Candidates (मार्ग विकल्पहरू)
          </Text>
          <Badge label="3 PERSONALITIES" variant="volt" size="sm" />
        </View>
        <Text variant="bodySmall" muted style={{ marginBottom: primitive.spacing[3] }}>
          Curvy is the balanced default. Compare distance, duration, bends, and terrain.
        </Text>

        {candidateList.map((candidate) => (
          <CandidateComparisonCard
            key={candidate.id}
            candidate={candidate}
            isSelected={selectedCandidate.id === candidate.id}
            onSelect={(cand) => setSelectedCandidateId(cand.id)}
          />
        ))}
      </View>

      {/* 5. Waypoint Editor */}
      <WaypointEditor
        waypoints={waypoints}
        suggestedWaypoints={suggestedWaypointsCatalog}
        onAddWaypoint={handleAddWaypoint}
        onRemoveWaypoint={handleRemoveWaypoint}
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
      />

      {/* 6. Trip Summary & Action Button */}
      <View style={[styles.summaryCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
        <View style={styles.summaryHeader}>
          <Text variant="bodySmall" muted style={{ fontWeight: '700', letterSpacing: 0.5 }}>
            SELECTED TRIP PLAN SUMMARY
          </Text>
          <Badge label={selectedCandidate.profile.toUpperCase()} variant="volt" size="sm" />
        </View>
        <Text variant="h3" style={{ color: colors.text, marginTop: primitive.spacing[1] }}>
          {selectedCandidate.name}
        </Text>
        <Text variant="mono" style={{ color: colors.interactive, fontSize: 13, marginTop: 4 }}>
          {selectedCandidate.distanceKm} KM · {Math.floor(selectedCandidate.durationMinutes / 60)}h {selectedCandidate.durationMinutes % 60}m · {waypoints.length} Stops
        </Text>
        <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10, marginTop: primitive.spacing[2] }}>
          Deterministic fixture planning · No real routing or cellular downloads performed.
        </Text>

        <Button
          label={showMapPreview ? 'HIDE FIXTURE MAP (नक्सा लुकाउनुहोस्)' : 'PREVIEW FIXTURE ROUTE (पूर्वावलोकन)'}
          onPress={() => setShowMapPreview(!showMapPreview)}
          variant="primary"
          style={{ marginTop: primitive.spacing[4], minHeight: 48 }}
        />
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
  subtitle: {
    marginTop: primitive.spacing[1],
    marginBottom: primitive.spacing[4],
  },
  modeSwitcher: {
    flexDirection: 'row',
    borderRadius: primitive.radius.lg,
    padding: primitive.spacing[1],
    borderWidth: 1,
    marginBottom: primitive.spacing[4],
  },
  modeTab: {
    flex: 1,
    paddingVertical: primitive.spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: primitive.radius.md,
    borderWidth: 1.5,
    minHeight: 48,
  },
  squadNoticeCard: {
    padding: primitive.spacing[4],
    borderRadius: primitive.radius.lg,
    borderWidth: 1,
    marginBottom: primitive.spacing[4],
  },
  corridorCard: {
    borderRadius: primitive.radius.lg,
    padding: primitive.spacing[4],
    borderWidth: 1,
    marginBottom: primitive.spacing[4],
  },
  corridorRow: {
    marginVertical: 2,
  },
  destHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  searchToggleBtn: {
    minHeight: 48,
    minWidth: 48,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: primitive.spacing[2],
  },
  divider: {
    height: 1,
    marginVertical: primitive.spacing[3],
  },
  searchBox: {
    marginTop: primitive.spacing[2],
  },
  searchInput: {
    padding: primitive.spacing[3],
    borderRadius: primitive.radius.md,
    borderWidth: 1,
    fontSize: 14,
    minHeight: 48,
  },
  searchStatusBanner: {
    marginTop: primitive.spacing[2],
    padding: primitive.spacing[3],
    borderRadius: primitive.radius.md,
    borderWidth: 1,
  },
  resultsList: {
    marginTop: primitive.spacing[2],
    borderRadius: primitive.radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  resultItem: {
    padding: primitive.spacing[3],
    borderBottomWidth: 1,
    minHeight: 48,
    justifyContent: 'center',
  },
  resultItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mapPreviewWrapper: {
    marginBottom: primitive.spacing[4],
  },
  mapPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: primitive.spacing[2],
  },
  mapContainer: {
    height: 220,
    borderRadius: primitive.radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  candidatesSection: {
    marginVertical: primitive.spacing[3],
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  summaryCard: {
    padding: primitive.spacing[4],
    borderRadius: primitive.radius.lg,
    borderWidth: 1,
    marginTop: primitive.spacing[4],
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
