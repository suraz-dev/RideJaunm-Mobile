/**
 * ============================================================================
 * TRIP PLANNER & ROUTE COMPARISON SCREEN (R10)
 * ============================================================================
 *
 * Coordinates:
 * 1. Local Nepal place search against synthetic fixture catalog.
 * 2. Solo vs Group planning intent (with read-only R11 squad handoff).
 * 3. 3-Way Route Candidate comparison (Straight, Curvy, Supercurvy).
 * 4. Explicit handling of Terai/Flat and Upper Mustang permit restrictions.
 * 5. Intermediate waypoint editor (add, remove, reorder).
 * 6. Truthful fixture disclosures across all 4 theme modes.
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
import { useTheme } from '../design/ThemeProvider';
import { primitive } from '../design/tokens';
import {
  PlanningMode,
  PlannerPlace,
  PlannerWaypoint,
  PlannerRouteCandidate,
} from '../domain/tripPlanner';
import {
  nepalPlacesFixtureCatalog,
  kathmanduToPokharaPlannerCandidates,
  teraiCorridorPlannerCandidates,
  upperMustangPermitPlannerCandidates,
  suggestedWaypointsCatalog,
} from '../fixtures/tripPlanner.fixture';

export const TripPlannerScreen: React.FC = () => {
  const { colors, mode } = useTheme();
  const isDayGlare = mode === 'dayGlare';

  // Planning intent: Solo vs Group (R10: read-only handoff)
  const [planningMode, setPlanningMode] = useState<PlanningMode>('solo');

  // Origin & Destination State
  const [originPlace] = useState<PlannerPlace>(nepalPlacesFixtureCatalog[0]); // Kathmandu
  const [destinationPlace, setDestinationPlace] = useState<PlannerPlace>(nepalPlacesFixtureCatalog[1]); // Pokhara

  // Place Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Waypoints State
  const [waypoints, setWaypoints] = useState<PlannerWaypoint[]>([
    suggestedWaypointsCatalog[0], // Kurintar
    suggestedWaypointsCatalog[1], // Mugling
  ]);

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

  // Selected Candidate (defaults to Curvy)
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(
    kathmanduToPokharaPlannerCandidates[0].id
  );

  const selectedCandidate = useMemo(() => {
    return candidateList.find((c) => c.id === selectedCandidateId) || candidateList[0];
  }, [candidateList, selectedCandidateId]);

  // Search Results against synthetic catalog
  const searchResults: PlannerPlace[] = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    return nepalPlacesFixtureCatalog.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        (p.nameNepali && p.nameNepali.includes(query)) ||
        (p.region && p.region.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  // Destination Selection
  const handleSelectDestination = (place: PlannerPlace) => {
    setDestinationPlace(place);
    setSearchQuery('');
    setIsSearching(false);
    // Reset selection to Curvy candidate of the new route
    if (place.id === 'place-janakpur' || place.id === 'place-biratnagar') {
      setSelectedCandidateId(teraiCorridorPlannerCandidates[0].id);
    } else if (place.id === 'place-mustang') {
      setSelectedCandidateId(upperMustangPermitPlannerCandidates[0].id);
    } else {
      setSelectedCandidateId(kathmanduToPokharaPlannerCandidates[0].id);
    }
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

      {/* Group Mode Read-Only R11 Handoff Card */}
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
          <Badge label="TASK R11 HANDOFF PREVIEW" variant="supercurvy" size="sm" />
          <Text variant="bodyLarge" style={{ color: colors.text, fontWeight: '700', marginTop: primitive.spacing[2] }}>
            Himalayan Ridge Riders Squad (3 Members)
          </Text>
          <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 11, marginTop: 2 }}>
            Lead: Bikash · Sweep: Rabin · Follower: Suraj
          </Text>
          <Text variant="bodySmall" muted style={{ marginTop: primitive.spacing[2] }}>
            Group roster, member invites, and live rally coordination will be activated in Task R11.
          </Text>
        </View>
      )}

      {/* 2. Destination Search & Route Corridor Card */}
      <View style={[styles.corridorCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {/* Origin Display */}
        <View style={styles.corridorRow}>
          <Text variant="bodySmall" muted style={{ fontSize: 10, letterSpacing: 0.5 }}>
            ORIGIN (सुरुवात)
          </Text>
          <Text variant="bodyLarge" style={{ color: colors.text, fontWeight: '700' }}>
            {originPlace.name} {originPlace.nameNepali && `(${originPlace.nameNepali})`}
          </Text>
          <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10 }}>
            {originPlace.region}
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />

        {/* Destination Search / Selection */}
        <View style={styles.corridorRow}>
          <View style={styles.destHeaderRow}>
            <Text variant="bodySmall" muted style={{ fontSize: 10, letterSpacing: 0.5 }}>
              DESTINATION (गन्तव्य)
            </Text>
            <TouchableOpacity onPress={() => setIsSearching(!isSearching)} style={styles.searchToggleBtn}>
              <Text variant="mono" style={{ color: primitive.color.cyan[400], fontSize: 11 }}>
                {isSearching ? '✕ Close Search' : '🔍 Change Destination'}
              </Text>
            </TouchableOpacity>
          </View>

          {!isSearching ? (
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
              <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10, marginTop: 4 }}>
                Searching synthetic Nepal places catalogue only (No remote geocoder)
              </Text>

              {/* Search Results List */}
              {searchQuery.trim().length > 0 && (
                <View style={[styles.resultsList, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                  {searchResults.length === 0 ? (
                    <View style={styles.resultItem}>
                      <Text variant="bodySmall" muted>
                        No places found in Nepal fixture catalog.
                      </Text>
                    </View>
                  ) : (
                    searchResults.map((place) => (
                      <TouchableOpacity
                        key={place.id}
                        style={[styles.resultItem, { borderBottomColor: colors.borderSubtle }]}
                        onPress={() => handleSelectDestination(place)}
                        accessible
                        accessibilityRole="button"
                        accessibilityLabel={`Select destination: ${place.name}`}
                      >
                        <Text variant="bodyLarge" style={{ color: colors.text, fontWeight: '600' }}>
                          {place.name}
                        </Text>
                        <Text variant="mono" style={{ color: colors.textSubtle, fontSize: 10 }}>
                          {place.region} · {place.nameNepali}
                        </Text>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}
            </View>
          )}
        </View>
      </View>

      {/* 3. 3-Way Route Candidates Comparison */}
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

      {/* 4. Waypoint Editor */}
      <WaypointEditor
        waypoints={waypoints}
        suggestedWaypoints={suggestedWaypointsCatalog}
        onAddWaypoint={handleAddWaypoint}
        onRemoveWaypoint={handleRemoveWaypoint}
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
      />

      {/* 5. Trip Summary & Action Button */}
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
          label="PREVIEW FIXTURE ROUTE (पूर्वावलोकन)"
          onPress={() => {}}
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
    minHeight: 36,
    justifyContent: 'center',
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
