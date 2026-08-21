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
  mustangCircuitRegion,
  bagmatiNarayaniRegion,
  everestRegionDownloading,
  dolpaRegionStorageFull,
} from '../fixtures';
import { localStore, LocalStore } from '../services/storage/LocalStore';
import {
  DefaultOfflineOperationRepository,
  OfflineOperationRepository,
} from '../services/storage/OfflineOperationRepository';

interface AppStateContextValue {
  isHydrated: boolean;
  activeRoute: RouteCandidate;
  availableRoutes: RouteCandidate[];
  setActiveRoute: (route: RouteCandidate) => void;
  connectionState: ConnectionStateSnapshot;
  setConnectionMode: (mode: 'online' | 'meshOnly' | 'deadZone') => void;
  offlineRegions: OfflineRegion[];
  pendingOperationsCount: number;
  enqueueOperation: (op: QueuedOperation) => Promise<void>;
  activeSosSnapshot?: SafetyIncidentSnapshot;
  setSosSnapshot: (snapshot?: SafetyIncidentSnapshot) => void;
  resetAccountData: () => Promise<void>;
}

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: ReactNode; store?: LocalStore }> = ({
  children,
  store = localStore,
}) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeRoute, setActiveRoute] = useState<RouteCandidate>(kathmanduToPokharaCurvy);
  const [connectionState, setConnectionState] =
    useState<ConnectionStateSnapshot>(connectionOnlineSnapshot);
  const [offlineRegions, setOfflineRegions] = useState<OfflineRegion[]>([
    mustangCircuitRegion,
    bagmatiNarayaniRegion,
    everestRegionDownloading,
    dolpaRegionStorageFull,
  ]);
  const [pendingOps, setPendingOps] = useState<QueuedOperation[]>([]);
  const [activeSosSnapshot, setSosSnapshot] = useState<SafetyIncidentSnapshot | undefined>(undefined);

  const outboxRepo: OfflineOperationRepository = new DefaultOfflineOperationRepository(store);

  useEffect(() => {
    async function init() {
      await store.hydrate();
      const savedRoute = await store.read<RouteCandidate>('active_route_v1');
      if (savedRoute) setActiveRoute(savedRoute);

      const pending = await outboxRepo.listPending();
      setPendingOps(pending);
      setIsHydrated(true);
    }
    init();
  }, []);

  const handleSetActiveRoute = async (route: RouteCandidate) => {
    setActiveRoute(route);
    await store.write('active_route_v1', route);
  };

  const handleSetConnectionMode = (mode: 'online' | 'meshOnly' | 'deadZone') => {
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

  const handleEnqueue = async (op: QueuedOperation) => {
    await outboxRepo.enqueue(op);
    const pending = await outboxRepo.listPending();
    setPendingOps(pending);
  };

  const handleResetAccountData = async () => {
    await store.clearAccountScopedData();
    await outboxRepo.clear();
    setPendingOps([]);
    setActiveRoute(kathmanduToPokharaCurvy);
    setConnectionState(connectionOnlineSnapshot);
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
        pendingOperationsCount: pendingOps.length,
        enqueueOperation: handleEnqueue,
        activeSosSnapshot,
        setSosSnapshot,
        resetAccountData: handleResetAccountData,
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
