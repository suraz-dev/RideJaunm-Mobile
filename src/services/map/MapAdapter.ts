/**
 * ============================================================================
 * PROVIDER-NEUTRAL MAP ADAPTER BOUNDARY (ADR-001 / R7)
 * ============================================================================
 *
 * WHY THIS EXISTS:
 * Defines the contract that any map engine implementation (Fixture, MapLibre, Mapbox)
 * must implement. Screens and navigation HUD components communicate ONLY through
 * this interface, guaranteeing zero tight-coupling to proprietary or native map SDKs.
 */

import { MapCamera, MapNetworkPolicy, MapRenderInput } from '../../domain/map';

export interface MapAdapter {
  /** Render or update the visual map frame using a typed input */
  render(input: MapRenderInput): Promise<void>;

  /** Programmatically animate or set the camera position and zoom */
  setCamera(camera: MapCamera): Promise<void>;

  /** Retrieve the current active camera position and zoom */
  getCamera(): Promise<MapCamera>;

  /** Change the active network caching policy ('online' vs 'cache_only') */
  setNetworkPolicy(policy: MapNetworkPolicy): Promise<void>;

  /** Retrieve the last rendered input (for inspection / tests) */
  getRenderInput(): Promise<MapRenderInput | undefined>;
}
