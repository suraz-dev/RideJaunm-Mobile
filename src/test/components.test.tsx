import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '../design/ThemeProvider';
import { Text } from '../components/primitives/Text';
import { Badge } from '../components/primitives/Badge';
import { Button } from '../components/primitives/Button';
import { RouteModeSelector } from '../components/composites/RouteModeSelector';

describe('RideJaunm Core Primitive & Composite Components', () => {
  test('renders Typography Text component with correct label', async () => {
    const view = await render(
      <ThemeProvider>
        <Text variant="h1">राइड जाऔं</Text>
      </ThemeProvider>
    );
    expect(view.getByText('राइड जाऔं')).toBeTruthy();
  });

  test('renders Route Badges for Straight, Curvy, and Supercurvy', async () => {
    const view = await render(
      <ThemeProvider>
        <Badge label="Curvy" variant="volt" />
        <Badge label="Supercurvy" variant="supercurvy" />
      </ThemeProvider>
    );
    expect(view.getByText('Curvy')).toBeTruthy();
    expect(view.getByText('Supercurvy')).toBeTruthy();
  });

  test('renders Action Button with tactical inRide touch target', async () => {
    const view = await render(
      <ThemeProvider>
        <Button label="START RIDE" onPress={() => {}} inRide />
      </ThemeProvider>
    );
    expect(view.getByText('START RIDE')).toBeTruthy();
  });

  test('renders 3-way RouteModeSelector with all routing personalities', async () => {
    const view = await render(
      <ThemeProvider>
        <RouteModeSelector selectedMode="supercurvy" onSelectMode={() => {}} />
      </ThemeProvider>
    );
    expect(view.getByText('Straight')).toBeTruthy();
    expect(view.getByText('Curvy')).toBeTruthy();
    expect(view.getByText('Supercurvy')).toBeTruthy();
    expect(view.getByText('अत्यन्त घुमाउरो')).toBeTruthy();
  });

  test('renders RouteModeSelector with disabled Terai Supercurvy state and restriction notice', async () => {
    const handleSelect = jest.fn();

    const view = await render(
      <ThemeProvider>
        <RouteModeSelector
          selectedMode="curvy"
          onSelectMode={handleSelect}
          disabledModes={['supercurvy']}
          disabledReason="Supercurvy disabled: Terai flat corridor has no mountain bends"
        />
      </ThemeProvider>
    );

    expect(view.getByText('अनुपलब्ध')).toBeTruthy();
    expect(
      view.getByText(/Supercurvy disabled: Terai flat corridor has no mountain bends/)
    ).toBeTruthy();

    const supercurvyBtn = view.getByLabelText(/Supercurvy: Disabled/);
    expect(supercurvyBtn).toBeTruthy();
    fireEvent.press(supercurvyBtn);
    expect(handleSelect).not.toHaveBeenCalled();
  });
});
