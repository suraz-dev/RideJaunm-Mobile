import { FixtureMapAdapter } from '../services/map/FixtureMapAdapter';
import { mapFreshKathmanduFixture, mapStaleMustangFixture } from '../fixtures/map.fixture';
import { MapCamera } from '../domain/map';

describe('RideJaunm R7 Provider-Neutral MapAdapter Boundary', () => {
  let adapter: FixtureMapAdapter;

  beforeEach(() => {
    adapter = new FixtureMapAdapter();
  });

  test('initializes with default camera and online network policy', async () => {
    const camera = await adapter.getCamera();
    expect(camera.center.latitude).toBeCloseTo(27.6775);
    expect(camera.center.longitude).toBeCloseTo(85.3486);
    expect(camera.zoom).toBe(12);
    expect(adapter.getNetworkPolicy()).toBe('online');
    expect(adapter.getRenderCount()).toBe(0);
  });

  test('renders map input and retains camera and policy state', async () => {
    await adapter.render(mapFreshKathmanduFixture);

    expect(adapter.getRenderCount()).toBe(1);
    const lastInput = await adapter.getRenderInput();
    expect(lastInput?.baseState).toBe('fresh');
    expect(lastInput?.camera.bearingDegrees).toBe(45);

    const activeCamera = await adapter.getCamera();
    expect(activeCamera.bearingDegrees).toBe(45);
  });

  test('updates camera coordinates and viewport properties programmatically', async () => {
    await adapter.render(mapFreshKathmanduFixture);

    const updatedCamera: MapCamera = {
      center: { latitude: 28.7845, longitude: 83.8567 },
      zoom: 14.0,
      bearingDegrees: 180,
      pitchDegrees: 45,
    };

    await adapter.setCamera(updatedCamera);

    const fetchedCamera = await adapter.getCamera();
    expect(fetchedCamera.center.latitude).toBe(28.7845);
    expect(fetchedCamera.center.longitude).toBe(83.8567);
    expect(fetchedCamera.zoom).toBe(14.0);
    expect(fetchedCamera.bearingDegrees).toBe(180);
    expect(fetchedCamera.pitchDegrees).toBe(45);

    const renderedInput = await adapter.getRenderInput();
    expect(renderedInput?.camera.zoom).toBe(14.0);
  });

  test('updates network caching policy between online and cache_only', async () => {
    expect(adapter.getNetworkPolicy()).toBe('online');

    await adapter.setNetworkPolicy('cache_only');
    expect(adapter.getNetworkPolicy()).toBe('cache_only');

    await adapter.render(mapStaleMustangFixture);
    expect(adapter.getNetworkPolicy()).toBe('cache_only');
  });
});
