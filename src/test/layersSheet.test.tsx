import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LayersSheet } from '../components/map/LayersSheet';
import { ThemeProvider } from '../design/ThemeProvider';

describe('RideJaunm R8 Layers Sheet Component', () => {
  test('renders LayersSheet with toggles and triggers dismiss callback', async () => {
    const handleClose = jest.fn();
    const handleToggleHazards = jest.fn();
    const handleToggleTopo = jest.fn();

    const view = await render(
      <ThemeProvider initialMode="night">
        <LayersSheet
          visible={true}
          onClose={handleClose}
          showHazards={true}
          onToggleHazards={handleToggleHazards}
          showTopography={true}
          onToggleTopography={handleToggleTopo}
        />
      </ThemeProvider>
    );

    expect(view.getByText(/Map Layers/)).toBeTruthy();
    expect(view.getByText(/Himalayan Elevation Contours/)).toBeTruthy();
    expect(view.getByText(/Monsoon Hazard Markers/)).toBeTruthy();
    expect(view.getByText(/Emergency Heli Landing Zones/)).toBeTruthy();

    const closeBtn = view.getByText(/CLOSE LAYERS/);
    expect(closeBtn).toBeTruthy();
    fireEvent.press(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
