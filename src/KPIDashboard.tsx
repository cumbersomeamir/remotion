import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { kpiData } from './data';
import { colors } from './colors';
import { typography } from './typography';

export const KPIDashboard: React.FC<{
  orientation: 'vertical' | 'horizontal';
}> = ({ orientation }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const isVertical = orientation === 'vertical';

  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const scale = interpolate(frame, [0, 15], [0.8, 1], {
    extrapolateRight: 'clamp',
  });

  const revenueProgress = interpolate(
    frame,
    [10, durationInFrames * 0.4],
    [0, kpiData.revenue],
    { extrapolateRight: 'clamp' }
  );

  const usersProgress = interpolate(
    frame,
    [15, durationInFrames * 0.5],
    [0, kpiData.users],
    { extrapolateRight: 'clamp' }
  );

  const growthProgress = interpolate(
    frame,
    [20, durationInFrames * 0.6],
    [0, kpiData.growth],
    { extrapolateRight: 'clamp' }
  );

  const retentionProgress = interpolate(
    frame,
    [25, durationInFrames * 0.7],
    [0, kpiData.retention],
    { extrapolateRight: 'clamp' }
  );

  const containerStyle: React.CSSProperties = {
    backgroundColor: colors.background,
    padding: isVertical ? '40px 30px' : '30px 40px',
    display: 'flex',
    flexDirection: isVertical ? 'column' : 'row',
    gap: isVertical ? '30px' : '20px',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: colors.white,
    borderRadius: '12px',
    padding: isVertical ? '30px' : '25px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    flex: isVertical ? 'none' : 1,
    minWidth: isVertical ? '100%' : '200px',
    opacity,
    transform: `scale(${scale})`,
  };

  const valueStyle: React.CSSProperties = {
    fontSize: isVertical ? typography.fontSize['4xl'] : typography.fontSize['3xl'],
    fontFamily: typography.fontFamily.heading,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    margin: '10px 0',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.body,
    color: colors.text,
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  };

  const formatNumber = (num: number, isPercent = false) => {
    if (isPercent) {
      return `${num.toFixed(1)}%`;
    }
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toFixed(0);
  };

  return (
    <AbsoluteFill style={containerStyle}>
      <div style={cardStyle}>
        <div style={labelStyle}>Revenue</div>
        <div style={valueStyle}>{formatNumber(revenueProgress)}</div>
      </div>
      <div style={cardStyle}>
        <div style={labelStyle}>Users</div>
        <div style={valueStyle}>{formatNumber(usersProgress)}</div>
      </div>
      <div style={cardStyle}>
        <div style={labelStyle}>Growth</div>
        <div style={valueStyle}>{formatNumber(growthProgress, true)}</div>
      </div>
      <div style={cardStyle}>
        <div style={labelStyle}>Retention</div>
        <div style={valueStyle}>{formatNumber(retentionProgress, true)}</div>
      </div>
    </AbsoluteFill>
  );
};

