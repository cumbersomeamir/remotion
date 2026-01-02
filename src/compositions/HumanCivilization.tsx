import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {RenderQuality} from '../RenderQuality';
import {colors} from '../colors';
import {story} from '../data';
import {CornerTag, GridOverlay, SafeBackground, TitleBlock, clamp01} from './_shared';

type Props = {quality?: RenderQuality};

export const HumanCivilization: React.FC<Props> = ({quality = RenderQuality.FINAL}) => {
  const frame = useCurrentFrame();
  const {fps, width, height, durationInFrames} = useVideoConfig();

  const intro = clamp01(interpolate(frame, [0, 18], [0, 1]));
  const t = clamp01(interpolate(frame, [28, durationInFrames - 28], [0, 1]));

  const skylineRise = spring({
    frame: Math.max(0, frame - 28),
    fps,
    config: {damping: 20, stiffness: 90},
    from: 0,
    to: 1,
  });

  const blocks = Array.from({length: quality === RenderQuality.DRAFT ? 22 : 30}).map((_, i) => {
    const base = (i * 73) % 100;
    const w = 28 + (base % 28);
    const h = 80 + ((base * 7) % 260);
    const x = width * 0.10 + (i * (width * 0.80)) / (quality === RenderQuality.DRAFT ? 22 : 30);
    return {x, w, h};
  });

  const stage = Math.min(story.civilizationStages.length - 1, Math.floor(t * story.civilizationStages.length));

  return (
    <AbsoluteFill>
      <SafeBackground variant="market" />
      <GridOverlay opacity={0.12} />
      <TitleBlock
        title="Rise of Human Civilization"
        subtitle="Tools → cities → industry → networks"
        accent={colors.cyan}
      />

      {/* Skyline */}
      <svg width={width} height={height} style={{position: 'absolute'}}>
        <defs>
          <linearGradient id="skyline" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(0,212,255,0.30)" />
            <stop offset="60%" stopColor="rgba(123,47,247,0.14)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.55)" />
          </linearGradient>
          <linearGradient id="lights" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.lime} stopOpacity="0.9" />
            <stop offset="50%" stopColor={colors.cyan} stopOpacity="0.9" />
            <stop offset="100%" stopColor={colors.magenta} stopOpacity="0.9" />
          </linearGradient>
        </defs>

        <rect x={0} y={height * 0.58} width={width} height={height * 0.42} fill="url(#skyline)" opacity={0.95} />

        {blocks.map((b, i) => {
          const local = clamp01(interpolate(t, [i / blocks.length - 0.1, i / blocks.length + 0.35], [0, 1]));
          const rise = b.h * skylineRise * local;
          const y = height * 0.88 - rise;
          const o = 0.4 + 0.6 * local;
          return (
            <g key={i} opacity={o}>
              <rect x={b.x} y={y} width={b.w} height={rise} fill="rgba(0,0,0,0.60)" stroke="rgba(255,255,255,0.06)" />
              {Array.from({length: Math.max(2, Math.floor(rise / 38))}).map((_, r) => (
                <rect
                  key={r}
                  x={b.x + 6}
                  y={y + 10 + r * 28}
                  width={Math.max(6, b.w - 12)}
                  height={6}
                  fill="url(#lights)"
                  opacity={0.10 + 0.18 * Math.sin(frame * 0.06 + i + r)}
                />
              ))}
            </g>
          );
        })}

        {/* Network arcs */}
        {Array.from({length: 6}).map((_, i) => {
          const a = (i / 6) * Math.PI;
          const x1 = width * 0.12;
          const y1 = height * 0.80;
          const x2 = width * 0.88;
          const y2 = height * 0.80;
          const mx = width * 0.50 + Math.cos(a) * 30;
          const my = height * 0.66 - Math.sin(a) * 140;
          const draw = clamp01(interpolate(t, [0.55, 0.95], [0, 1]));
          const o = 0.06 + 0.12 * draw;
          return (
            <path
              key={i}
              d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
              fill="none"
              stroke={colors.cyan}
              strokeWidth={2}
              opacity={o}
            />
          );
        })}
      </svg>

      {/* Timeline chips */}
      <div
        style={{
          position: 'absolute',
          left: 64,
          right: 64,
          top: height * 0.28,
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          justifyContent: 'center',
          opacity: interpolate(frame, [18, 30], [0, 1], {extrapolateRight: 'clamp'}),
        }}
      >
        {story.civilizationStages.map((s, i) => {
          const active = i <= stage;
          return (
            <div
              key={s.label}
              style={{
                padding: '10px 14px',
                borderRadius: 999,
                border: `1px solid rgba(255,255,255,${active ? 0.22 : 0.10})`,
                background: active ? 'rgba(0,0,0,0.30)' : 'rgba(0,0,0,0.18)',
                color: active ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.55)',
                fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
                fontWeight: 850,
                fontSize: 16,
                letterSpacing: '-0.01em',
                boxShadow: active ? `0 0 0 2px ${colors.cyan} inset` : 'none',
              }}
            >
              <span style={{opacity: 0.75, marginRight: 10}}>{s.year}</span>
              <span>{s.label}</span>
            </div>
          );
        })}
      </div>

      <CornerTag text="Civilization: compounding networks" color={colors.cyan} />
    </AbsoluteFill>
  );
};


