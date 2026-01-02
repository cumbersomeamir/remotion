import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors} from '../colors';

export const SafeBackground: React.FC<{variant?: 'space' | 'lab' | 'market' | 'bio'}> = ({
  variant = 'space',
}) => {
  const bg =
    variant === 'lab'
      ? `radial-gradient(1200px 1200px at 50% 20%, rgba(0, 212, 255, 0.18), ${colors.ink} 60%)`
      : variant === 'market'
        ? `radial-gradient(1100px 1100px at 50% 15%, rgba(123, 47, 247, 0.16), ${colors.ink2} 62%)`
        : variant === 'bio'
          ? `radial-gradient(1200px 1200px at 50% 20%, rgba(0, 255, 136, 0.14), ${colors.ink2} 60%)`
          : `radial-gradient(1400px 1400px at 50% 15%, rgba(255, 45, 170, 0.10), ${colors.ink} 62%)`;

  return <AbsoluteFill style={{background: bg}} />;
};

export const GridOverlay: React.FC<{opacity?: number}> = ({opacity = 0.22}) => {
  return (
    <AbsoluteFill
      style={{
        backgroundImage:
          'linear-gradient(rgba(0, 212, 255, 0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 255, 0.16) 1px, transparent 1px)',
        backgroundSize: '64px 64px',
        opacity,
        mixBlendMode: 'screen',
      }}
    />
  );
};

export const TitleBlock: React.FC<{
  title: string;
  subtitle?: string;
  accent?: string;
}> = ({title, subtitle, accent = colors.cyan}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const enter = spring({
    frame,
    fps,
    config: {damping: 24, stiffness: 120},
    from: 0,
    to: 1,
  });

  const opacity = interpolate(frame, [0, 18], [0, 1], {extrapolateRight: 'clamp'});
  const y = interpolate(enter, [0, 1], [28, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 96,
        left: 64,
        right: 64,
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      <div style={{display: 'flex', alignItems: 'baseline', gap: 14}}>
        <div
          style={{
            width: 10,
            height: 40,
            borderRadius: 999,
            background: accent,
            boxShadow: `0 0 0 1px rgba(255,255,255,0.06) inset`,
          }}
        />
        <div
          style={{
            fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
            fontWeight: 900,
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
            fontSize: 74,
            color: 'rgba(255,255,255,0.96)',
          }}
        >
          {title}
        </div>
      </div>
      {subtitle ? (
        <div
          style={{
            marginTop: 14,
            marginLeft: 24,
            maxWidth: 900,
            fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
            fontWeight: 600,
            fontSize: 26,
            color: 'rgba(255,255,255,0.72)',
          }}
        >
          {subtitle}
        </div>
      ) : null}
    </div>
  );
};

export const CornerTag: React.FC<{text: string; color?: string}> = ({text, color = colors.dim}) => {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 48,
        left: 64,
        padding: '10px 14px',
        borderRadius: 14,
        border: `1px solid rgba(255,255,255,0.10)`,
        background: 'rgba(0,0,0,0.20)',
        color: 'rgba(255,255,255,0.84)',
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
        fontSize: 16,
        fontWeight: 700,
        letterSpacing: '0.02em',
        boxShadow: `0 0 0 1px rgba(0,0,0,0.25) inset`,
      }}
    >
      <span style={{color}}>{text}</span>
    </div>
  );
};

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));


