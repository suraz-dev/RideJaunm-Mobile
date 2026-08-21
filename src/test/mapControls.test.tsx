import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { MapControls } from '../components/map/MapControls';
import { ThemeProvider } from '../design/ThemeProvider';

describe('RideJaunm R8 Map Controls', () => {
  test('renders all 5 map control buttons with accessible labels and triggers callbacks', async () => {
    const handleResetCompass = jest.fn();
    const handleTogglePitch = jest.fn();
    const handleRecenter = jest.fn();
    const handleOpenLayers = jest.fn();
    const handleZoomIn = jest.fn();
    const handleZoomOut = jest.fn();

    const view = await render(
      <ThemeProvider initialMode="night">
        <MapControls
          bearingDegrees={45}
          pitchDegrees={0}
          onResetCompass={handleResetCompass}
          onTogglePitch={handleTogglePitch}
          onRecenter={handleRecenter}
          onOpenLayers={handleOpenLayers}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
        />
      </ThemeProvider>
    );

    const compassBtn = view.getByLabelText(/Compass: Heading 45 degrees/);
    const pitchBtn = view.getByLabelText(/Pitch perspective: currently 0 degrees/);
    const layersBtn = view.getByLabelText(/Map Layers: Tap to toggle/);
    const recenterBtn = view.getByLabelText(/Recenter map to route start/);
    const zoomInBtn = view.getByLabelText('Zoom In');
    const zoomOutBtn = view.getByLabelText('Zoom Out');

    expect(compassBtn).toBeTruthy();
    expect(pitchBtn).toBeTruthy();
    expect(layersBtn).toBeTruthy();
    expect(recenterBtn).toBeTruthy();
    expect(zoomInBtn).toBeTruthy();
    expect(zoomOutBtn).toBeTruthy();

    await act(async () => {
      fireEvent.press(compassBtn);
    });
    expect(handleResetCompass).toHaveBeenCalledTimes(1);

    await act(async () => {
      fireEvent.press(pitchBtn);
    });
    expect(handleTogglePitch).toHaveBeenCalledTimes(1);

    await act(async () => {
      fireEvent.press(layersBtn);
    });
    expect(handleOpenLayers).toHaveBeenCalledTimes(1);

    await act(async () => {
      fireEvent.press(recenterBtn);
    });
    expect(handleRecenter).toHaveBeenCalledTimes(1);

    await act(async () => {
      fireEvent.press(zoomInBtn);
    });
    expect(handleZoomIn).toHaveBeenCalledTimes(1);

    await act(async () => {
      fireEvent.press(zoomOutBtn);
    });
    expect(handleZoomOut).toHaveBeenCalledTimes(1);
  });
});
