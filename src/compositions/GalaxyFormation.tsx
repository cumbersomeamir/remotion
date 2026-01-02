import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {RenderQuality} from '../RenderQuality';
import {colors} from '../colors';
import {CornerTag, GridOverlay, SafeBackground, TitleBlock, clamp01} from './_shared';

type Props = {quality?: RenderQuality};

export const GalaxyFormation: React.FC<Props> = ({quality = RenderQuality.FINAL}) => {
  const frame = useCurrentFrame();
  const {fps, width, height, durationInFrames} = useVideoConfig();

  const intro = clamp01(interpolate(frame, [0, 20], [0, 1]));
  const spin = clamp01(interpolate(frame, [30, 210], [0, 1]));
  const settle = spring({
    frame: Math.max(0, frame - 160),
    fps,
    config: {damping: 18, stiffness: 90},
    from: 0,
    to: 1,
  });

  const count = quality === RenderQuality.DRAFT ? 260 : 420;
  const stars = useMemo(() => {
    return Array.from({length: count}).map((_, i) => {
      const a = (i / count) * Math.PI * 2;
      const r = 0.05 + ((i * 37) % 1000) / 1000;
      const arm = i % 3;
      return {a, r, arm};
    });
  }, [count]);

  const cx = width / 2;
  const cy = height * 0.55;

  const coreR = interpolate(settle, [0, 1], [26, 70]);
  const haloO = interpolate(spin, [0, 1], [0.25, 0.12]);

  return (
    <AbsoluteFill>
      <SafeBackground variant="space" />
      <GridOverlay opacity={0.14} />
      <TitleBlock title="Formation of Galaxies" subtitle="Gravity + rotation → disks, arms, and glowing cores" accent={colors.violet} />

      <svg width={width} height={height} style={{position: 'absolute'}}>
        <defs>
          <radialGradient id="gal-core" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="35%" stopColor={colors.cyan} stopOpacity="0.85" />
            <stop offset="70%" stopColor={colors.violet} stopOpacity="0.35" />
            <stop offset="100%" stopColor={colors.ink} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="gal-halo" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor={colors.cyan} stopOpacity="0.10" />
            <stop offset="100%" stopColor={colors.ink} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* halo */}
        <ellipse cx={cx} cy={cy} rx={width * 0.42} ry={height * 0.30} fill="url(#gal-halo)" opacity={haloO} />

        {/* spiral stars */}
        {stars.map((s, i) => {
          const armPhase = (s.arm / 3) * Math.PI * 2;
          const twist = interpolate(spin, [0, 1], [0.0, 5.2]);
          const angle = s.a + armPhase + s.r * twist;
          const radius = s.r * Math.min(width, height) * 0.36;
          const flat = interpolate(spin, [0, 1], [0.85, 0.28]); // collapses into a disk
          const x = cx + Math.cos(angle + frame * 0.01) * radius;
          const y = cy + Math.sin(angle + frame * 0.01) * radius * flat;
          const o = 0.2 + 0.8 * spin;
          const c = i % 7 === 0 ? colors.yellow : i % 5 === 0 ? colors.magenta : 'rgba(255,255,255,0.85)';
          const r = i % 11 === 0 ? 2.4 : 1.6;
          return <circle key={i} cx={x} cy={y} r={r} fill={c} opacity={o * 0.85} />;
        })}

        {/* core */}
        <circle cx={cx} cy={cy} r={coreR} fill="url(#gal-core)" opacity={0.95 * intro} />
        <circle cx={cx} cy={cy} r={coreR * 0.35} fill="white" opacity={0.24 * intro} />

        {/* arm highlight lines (subtle) */}
        {Array.from({length: 3}).map((_, a) => {
          const rr = Math.min(width, height) * 0.32;
          const base = (a / 3) * Math.PI * 2 + frame * 0.01;
          const x1 = cx + Math.cos(base) * rr * 0.3;
          const y1 = cy + Math.sin(base) * rr * 0.3 * 0.28;
          const x2 = cx + Math.cos(base + 0.6) * rr;
          const y2 = cy + Math.sin(base + 0.6) * rr * 0.28;
          return (
            <line
              key={a}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={colors.violet}
              strokeWidth={2}
              opacity={0.18 * spin}
            />
          );
        })}
      </svg>

      <CornerTag text="Spiral arms from density waves" color={colors.violet} />
    </AbsoluteFill>
  );
};


