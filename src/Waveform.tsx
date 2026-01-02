import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { waveformData } from './data';
import { colors } from './colors';

export const Waveform: React.FC<{
  orientation: 'vertical' | 'horizontal';
}> = ({ orientation }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const isVertical = orientation === 'vertical';

  const containerStyle: React.CSSProperties = {
    backgroundColor: colors.background,
    display: 'flex',
    flexDirection: isVertical ? 'column' : 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2px',
    padding: '40px',
    width: '100%',
    height: '100%',
  };

  const waveIntensity = interpolate(
    frame,
    [0, durationInFrames],
    [0.3, 1],
    {
      extrapolateRight: 'clamp',
    }
  );

  return (
    <AbsoluteFill style={containerStyle}>
      {waveformData.map((baseValue, index) => {
        const phase = (frame * 0.1 + index * 0.1) % (Math.PI * 2);
        const animatedValue = baseValue * (0.5 + 0.5 * Math.sin(phase)) * waveIntensity;

        const barWidth = isVertical ? '100%' : `${100 / waveformData.length}%`;
        const barHeight = isVertical
          ? `${animatedValue * 100}%`
          : '100%';

        const barStyle: React.CSSProperties = {
          backgroundColor: colors.primary,
          width: barWidth,
          height: barHeight,
          borderRadius: '2px',
          minHeight: isVertical ? '2px' : 'auto',
          minWidth: isVertical ? 'auto' : '2px',
        };

        return <div key={index} style={barStyle} />;
      })}
    </AbsoluteFill>
  );
};

