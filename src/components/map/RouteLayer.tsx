/**
 * ============================================================================
 * TACTICAL ROUTE TRACE OVERLAY (R8 / ADR-001)
 * ============================================================================
 *
 * WHY THIS EXISTS:
 * Renders quad-coded route polylines on the map surface using normalized
 * 0-100% canvas coordinates.
 *
 * SEMANTIC RULES (docs/03-color-system.md):
 * - Straight: Glacier Cyan (#22C9EE), solid 5px
 * - Curvy: Volt (#B4FF39), solid 6px with casing
 * - Supercurvy: Ultra Magenta (#C25CFF), dashed 6px
 * - Alternative: Cyan (#0B87A6), dashed 4px
 * - Hazard: Amber/Danger (#F2603C), dashed 5px (NEVER SOS RED)
 * - Detour: Amber (#FFB020), dashed 4px
 * - Lost: Neutral (#7E918C), dashed 4px
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { RouteLayerInput, RouteSemantic } from '../../domain/mapOverlay';
import { useTheme } from '../../design/ThemeProvider';
import { primitive } from '../../design/tokens';

export interface RouteLayerProps {
  routes: RouteLayerInput[];
}

export const RouteLayer: React.FC<RouteLayerProps> = ({ routes }) => {
  const { mode, colors } = useTheme();
  const isDayGlare = mode === 'dayGlare';

  /** Convert normalized (0-100) points into an SVG Path d string */
  const buildSvgPath = (points: { x: number; y: number }[]) => {
    if (points.length < 2) return '';
    const [first, ...rest] = points;
    return `M ${first.x} ${first.y} ` + rest.map((p) => `L ${p.x} ${p.y}`).join(' ');
  };

  /** Determine stroke color and pattern based on route semantic */
  const getSemanticStyle = (semantic: RouteSemantic, isSelected: boolean) => {
    switch (semantic) {
      case 'straight':
        return {
          stroke: primitive.color.route.straight,
          strokeWidth: isSelected ? 5 : 3.5,
          strokeDasharray: undefined,
          opacity: isSelected ? 1.0 : 0.6,
        };
      case 'curvy':
        return {
          stroke: primitive.color.route.curvy,
          strokeWidth: isSelected ? 6 : 4,
          strokeDasharray: undefined,
          opacity: isSelected ? 1.0 : 0.65,
        };
      case 'supercurvy':
        return {
          stroke: primitive.color.route.supercurvy,
          strokeWidth: isSelected ? 6 : 4,
          strokeDasharray: '8, 4',
          opacity: isSelected ? 1.0 : 0.7,
        };
      case 'alternative':
        return {
          stroke: isDayGlare ? primitive.color.cyan[600] : primitive.color.cyan[400],
          strokeWidth: 4,
          strokeDasharray: '6, 4',
          opacity: 0.7,
        };
      case 'hazard':
        return {
          // Strictly warning/danger amber, never SOS red
          stroke: primitive.color.route.hazard,
          strokeWidth: 5,
          strokeDasharray: '5, 3',
          opacity: 0.95,
        };
      case 'detour':
        return {
          stroke: primitive.color.route.detour,
          strokeWidth: 4.5,
          strokeDasharray: '6, 3',
          opacity: 0.9,
        };
      case 'lost':
      default:
        return {
          stroke: primitive.color.route.lost,
          strokeWidth: 4,
          strokeDasharray: '4, 4',
          opacity: 0.6,
        };
    }
  };

  // Render background routes first, then active/selected routes
  const sortedRoutes = [...routes].sort((a, b) => {
    if (a.isSelected === b.isSelected) return 0;
    return a.isSelected ? 1 : -1;
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg height="100%" width="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <G>
          {sortedRoutes.map((route) => {
            const style = getSemanticStyle(route.semantic, route.isSelected);
            const pathData = buildSvgPath(route.points);

            return (
              <G key={route.id}>
                {/* Subtle dark casing for selected routes */}
                {route.isSelected && (
                  <Path
                    d={pathData}
                    fill="none"
                    stroke={colors.background}
                    strokeWidth={style.strokeWidth + 2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeOpacity={0.8}
                  />
                )}
                {/* Main Semantic Route Line */}
                <Path
                  d={pathData}
                  fill="none"
                  stroke={style.stroke}
                  strokeWidth={style.strokeWidth}
                  strokeDasharray={style.strokeDasharray}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeOpacity={style.opacity}
                />
              </G>
            );
          })}
        </G>
      </Svg>
    </View>
  );
};
