/**
 * ============================================================================
 * GLOBAL APP STATE CONTEXT & PERSISTENCE ENGINE (R6-2, RC-2, R9)
 * ============================================================================
 *
 * Central brain of the RideJaunm mobile app. Coordinates:
 * 1. Active route candidates & routing personality modes.
 * 2. Connection transport & GPS telemetry snapshots.
 * 3. Offline map regions downloaded to device.
 * 4. Offline outbox queue synchronization.
 * 5. Emergency SOS safety incident observation states.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  RouteCandidate,
  ConnectionStateSnapshot,
  OfflineRegion,
  QueuedOperation,
  SafetyIncidentSnapshot,
} from '../domain';
import {
  kathmanduToPokharaCurvy,
  kathmanduToPokharaSupercurvy,
  kathmanduToPokharaStraight,
  connectionOnlineSnapshot,
  connectionMeshOnlySnapshot,
  connectionDeadZoneSnapshot,
  allOfflineRegionFixtures,
} from '../fixtures';
import { localStore, LocalStore, StorageReadResult } from '../services/storage/LocalStore';
import {
  DefaultOfflineOperationRepository,
  OfflineOperationRepository,
} from '../services/storage/OfflineOperationRepository';

/** Namespaced keys for all persisted entities */
const STORAGE_KEYS = {
  ACTIVE_ROUTE: 'active_route_v1',
  CONNECTION_MODE: 'connection_mode_v1',
  OFFLINE_REGIONS: 'offline_regions_v1',
  ACTIVE_SAFETY: 'active_safety_observation_v1',
} as const;

/** Shape of the values and dispatch actions exposed by the context */
interface AppStateContextValue {
  isHydrated: boolean;
  activeRoute: RouteCandidate;
  availableRoutes: RouteCandidate[];
  setActiveRoute: (route: RouteCandidate) => Promise<void>;
  connectionState: ConnectionStateSnapshot;
  setConnectionMode: (mode: 'online' | 'meshOnly' | 'deadZone') => Promise<void>;
  offlineRegions: OfflineRegion[];
  setOfflineRegionsState: (regions: OfflineRegion[]) => Promise<void>;
  pendingOperationsCount: number;
  enqueueOperation: (op: QueuedOperation) => Promise<void>;
  activeSosSnapshot?: SafetyIncidentSnapshot;
  setSosSnapshot: (snapshot?: SafetyIncidentSnapshot) => Promise<void>;
  resetAccountData: () => Promise<void>;
  storageFault?: string;
  storageFaults: string[];
}

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

export interface AppStateProviderProps {
  children: ReactNode;
  store?: LocalStore;
  initialConnectionState?: ConnectionStateSnapshot;
}

export const AppStateProvider: React.FC<AppStateProviderProps> = ({
  children,
  store = localStore,
  initialConnectionState = connectionOnlineSnapshot,
}) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeRoute, setActiveRouteState] = useState<RouteCandidate>(kathmanduToPokharaCurvy);
  const [connectionState, setConnectionState] =
    useState<ConnectionStateSnapshot>(initialConnectionState);
  const [offlineRegions, setOfflineRegions] =
    useState<OfflineRegion[]>(allOfflineRegionFixtures);
  const [pendingOps, setPendingOps] = useState<QueuedOperation[]>([]);
  const [activeSosSnapshot, setSosState] = useState<SafetyIncidentSnapshot | undefined>(undefined);
  const [storageFaults, setStorageFaults] = useState<string[]>([]);

  const outboxRepo: OfflineOperationRepository = new DefaultOfflineOperationRepository(store);

  /**
   * Hydration Effect:
   * Restores saved route, connection mode, offline regions, safety observations,
   * and pending outbox operations from local disk.
   */
  useEffect(() => {
    let isMounted = true;

    async function hydrate() {
      await store.hydrate();
      const detectedFaults: string[] = [];

      // 1. Hydrate Active Route
      const routeRes: StorageReadResult<RouteCandidate> =
        await store.read<RouteCandidate>(STORAGE_KEYS.ACTIVE_ROUTE);
      if (routeRes.status === 'found' && isMounted) {
        setActiveRouteState(routeRes.data);
      } else if (routeRes.status === 'corrupted' || routeRes.status === 'read_failed') {
        detectedFaults.push(`route:${routeRes.status}`);
      }

      // 2. Hydrate Connection Mode & GPS Freshness
      const connRes: StorageReadResult<'online' | 'meshOnly' | 'deadZone'> =
        await store.read<'online' | 'meshOnly' | 'deadZone'>(STORAGE_KEYS.CONNECTION_MODE);
      if (connRes.status === 'found' && isMounted) {
        applyConnectionMode(connRes.data);
      } else if (connRes.status === 'corrupted' || connRes.status === 'read_failed') {
        detectedFaults.push(`connection:${connRes.status}`);
      }

      // 3. Hydrate Offline Regions
      const regionRes: StorageReadResult<OfflineRegion[]> =
        await store.read<OfflineRegion[]>(STORAGE_KEYS.OFFLINE_REGIONS);
      if (regionRes.status === 'found' && isMounted) {
        setOfflineRegions(regionRes.data);
      } else if (regionRes.status === 'corrupted' || regionRes.status === 'read_failed') {
        detectedFaults.push(`offline_regions:${regionRes.status}`);
      }

      // 4. Hydrate Active Safety Observation
      const safetyRes: StorageReadResult<SafetyIncidentSnapshot> =
        await store.read<SafetyIncidentSnapshot>(STORAGE_KEYS.ACTIVE_SAFETY);
      if (safetyRes.status === 'found' && isMounted) {
        setSosState(safetyRes.data);
      } else if (safetyRes.status === 'corrupted' || safetyRes.status === 'read_failed') {
        detectedFaults.push(`safety:${safetyRes.status}`);
      }

      // 5. Hydrate Outbox Queue & Detect Outbox Faults
      const outboxRes = await outboxRepo.loadQueueResult();
      if (outboxRes.status === 'found' && isMounted) {
        const pending = outboxRes.data.filter((op) => op.state === 'queued' || op.state === 'sending');
        setPendingOps(pending);
      } else if (outboxRes.status === 'corrupted' || outboxRes.status === 'read_failed') {
        detectedFaults.push(`outbox:${outboxRes.status}`);
      }

      if (isMounted) {
        setStorageFaults(detectedFaults);
        setIsHydrated(true);
      }
    }

    hydrate();

    return () => {
      isMounted = false;
    };
  }, [store]);

  /** Helper to map connection mode string to concrete Nepal fixtures */
  const applyConnectionMode = (mode: 'online' | 'meshOnly' | 'deadZone') => {
    switch (mode) {
      case 'meshOnly':
        setConnectionState(connectionMeshOnlySnapshot);
        break;
      case 'deadZone':
        setConnectionState(connectionDeadZoneSnapshot);
        break;
      case 'online':
      default:
        setConnectionState(connectionOnlineSnapshot);
        break;
    }
  };

  /** Set active route and persist to disk */
  const handleSetActiveRoute = async (route: RouteCandidate) => {
    setActiveRouteState(route);
    await store.write(STORAGE_KEYS.ACTIVE_ROUTE, route);
  };

  /** Set connection mode and persist to disk */
  const handleSetConnectionMode = async (mode: 'online' | 'meshOnly' | 'deadZone') => {
    applyConnectionMode(mode);
    await store.write(STORAGE_KEYS.CONNECTION_MODE, mode);
  };

  /** Set offline regions array and persist to disk */
  const handleSetOfflineRegions = async (regions: OfflineRegion[]) => {
    setOfflineRegions(regions);
    await store.write(STORAGE_KEYS.OFFLINE_REGIONS, regions);
  };

  /** Set or clear SOS safety observation snapshot */
  const handleSetSosSnapshot = async (snapshot?: SafetyIncidentSnapshot) => {
    setSosState(snapshot);
    if (snapshot) {
      await store.write(STORAGE_KEYS.ACTIVE_SAFETY, snapshot);
    } else {
      await store.remove(STORAGE_KEYS.ACTIVE_SAFETY);
    }
  };

  /** Enqueue an offline mutation to the outbox repository */
  const handleEnqueue = async (op: QueuedOperation) => {
    await outboxRepo.enqueue(op);
    const pending = await outboxRepo.listPending();
    setPendingOps(pending);
  };

  /** Reset all local cached account data, wipe outbox, and restore factory defaults */
  const handleResetAccountData = async () => {
    await store.clearAccountScopedData();
    await outboxRepo.clear();
    setPendingOps([]);
    setActiveRouteState(kathmanduToPokharaCurvy);
    setConnectionState(connectionOnlineSnapshot);
    setOfflineRegions(allOfflineRegionFixtures);
    setSosState(undefined);
    setStorageFaults([]);
  };

  return (
    <AppStateContext.Provider
      value={{
        isHydrated,
        activeRoute,
        availableRoutes: [
          kathmanduToPokharaCurvy,
          kathmanduToPokharaSupercurvy,
          kathmanduToPokharaStraight,
        ],
        setActiveRoute: handleSetActiveRoute,
        connectionState,
        setConnectionMode: handleSetConnectionMode,
        offlineRegions,
        setOfflineRegionsState: handleSetOfflineRegions,
        pendingOperationsCount: pendingOps.length,
        enqueueOperation: handleEnqueue,
        activeSosSnapshot,
        setSosSnapshot: handleSetSosSnapshot,
        resetAccountData: handleResetAccountData,
        storageFault: storageFaults.length > 0 ? storageFaults.join(', ') : undefined,
        storageFaults,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = (): AppStateContextValue => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
