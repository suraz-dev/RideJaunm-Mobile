/**
 * ============================================================================
 * DETERMINISTIC FIXTURE MAP ADAPTER (R7)
 * ============================================================================
 *
 * WHY THIS EXISTS:
 * In-memory deterministic implementation of `MapAdapter` used in unit tests
 * and simulator builds before native renderer integration.
 *
 * It maintains camera viewport state, network caching policy, and render call
 * histories safely without requiring network connectivity, API keys, or map SDKs.
 */

import { MapCamera, MapNetworkPolicy, MapRenderInput } from '../../domain/map';
import { MapAdapter } from './MapAdapter';

export class FixtureMapAdapter implements MapAdapter {
  private currentCamera: MapCamera;
  private currentPolicy: MapNetworkPolicy;
  private lastRenderInput?: MapRenderInput;
  private renderCallCount = 0;

  constructor(
    initialCamera: MapCamera = {
      center: { latitude: 27.6775, longitude: 85.3486 },
      zoom: 12,
      bearingDegrees: 0,
      pitchDegrees: 0,
    },
    initialPolicy: MapNetworkPolicy = 'online'
  ) {
    this.currentCamera = { ...initialCamera };
    this.currentPolicy = initialPolicy;
  }

  async render(input: MapRenderInput): Promise<void> {
    this.lastRenderInput = { ...input };
    this.currentCamera = { ...input.camera };
    this.currentPolicy = input.networkPolicy;
    this.renderCallCount += 1;
  }

  async setCamera(camera: MapCamera): Promise<void> {
    this.currentCamera = { ...camera };
    if (this.lastRenderInput) {
      this.lastRenderInput.camera = { ...camera };
    }
  }

  async getCamera(): Promise<MapCamera> {
    return { ...this.currentCamera };
  }

  async setNetworkPolicy(policy: MapNetworkPolicy): Promise<void> {
    this.currentPolicy = policy;
    if (this.lastRenderInput) {
      this.lastRenderInput.networkPolicy = policy;
    }
  }

  async getRenderInput(): Promise<MapRenderInput | undefined> {
    return this.lastRenderInput ? { ...this.lastRenderInput } : undefined;
  }

  getRenderCount(): number {
    return this.renderCallCount;
  }

  getNetworkPolicy(): MapNetworkPolicy {
    return this.currentPolicy;
  }
}
