import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { barRaceData } from './data';
import { colors } from './colors';
import { typography } from './typography';

export const BarRace: React.FC<{
  orientation: 'vertical' | 'horizontal';
}> = ({ orientation }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const isVertical = orientation === 'vertical';

  const sortedData = [...barRaceData].sort((a, b) => b.value - a.value);
  const maxValue = Math.max(...sortedData.map((d) => d.value));

  const containerStyle: React.CSSProperties = {
    backgroundColor: colors.background,
    padding: '40px',
    display: 'flex',
    flexDirection: isVertical ? 'column' : 'row',
    gap: isVertical ? '20px' : '15px',
    justifyContent: 'center',
    alignItems: isVertical ? 'stretch' : 'flex-end',
    width: '100%',
    height: '100%',
  };

  return (
    <AbsoluteFill style={containerStyle}>
      {sortedData.map((item, index) => {
        const delay = index * 5;
        const progress = interpolate(
          frame,
          [delay, delay + 30],
          [0, item.value],
          { extrapolateRight: 'clamp' }
        );

        const barWidth = isVertical
          ? '100%'
          : `${(progress / maxValue) * 100}%`;
        const barHeight = isVertical
          ? `${(progress / maxValue) * 100}%`
          : '60px';

        const opacity = interpolate(
          frame,
          [delay, delay + 10],
          [0, 1],
          { extrapolateRight: 'clamp' }
        );

        const barStyle: React.CSSProperties = {
          backgroundColor: colors.primary,
          borderRadius: '8px',
          display: 'flex',
          flexDirection: isVertical ? 'column-reverse' : 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 15px',
          width: barWidth,
          height: barHeight,
          opacity,
          minHeight: isVertical ? '60px' : 'auto',
          minWidth: isVertical ? 'auto' : '100px',
        };

        const labelStyle: React.CSSProperties = {
          fontSize: typography.fontSize.base,
          fontFamily: typography.fontFamily.body,
          fontWeight: typography.fontWeight.semibold,
          color: colors.white,
        };

        const valueStyle: React.CSSProperties = {
          fontSize: typography.fontSize.lg,
          fontFamily: typography.fontFamily.heading,
          fontWeight: typography.fontWeight.bold,
          color: colors.white,
        };

        return (
          <div key={item.name} style={barStyle}>
            <div style={labelStyle}>{item.name}</div>
            <div style={valueStyle}>{Math.round(progress)}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

