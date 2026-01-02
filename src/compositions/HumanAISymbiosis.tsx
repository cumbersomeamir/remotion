import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {RenderQuality} from '../RenderQuality';
import {colors} from '../colors';
import {CornerTag, GridOverlay, SafeBackground, TitleBlock, clamp01} from './_shared';

type Props = {quality?: RenderQuality};

export const HumanAISymbiosis: React.FC<Props> = ({quality = RenderQuality.FINAL}) => {
  const frame = useCurrentFrame();
  const {fps, width, height, durationInFrames} = useVideoConfig();

  const intro = clamp01(interpolate(frame, [0, 18], [0, 1]));
  const merge = clamp01(interpolate(frame, [48, 200], [0, 1]));
  const lockIn = spring({
    frame: Math.max(0, frame - 190),
    fps,
    config: {damping: 18, stiffness: 140},
    from: 0,
    to: 1,
  });

  const nodes = useMemo(() => {
    const n = quality === RenderQuality.DRAFT ? 36 : 56;
    return Array.from({length: n}).map((_, i) => {
      const a = (i / n) * Math.PI * 2;
      const r = 0.15 + ((i * 61) % 100) / 100;
      return {a, r};
    });
  }, [quality]);

  const cx = width / 2;
  const cy = height * 0.56;
  const humanX = interpolate(merge, [0, 1], [cx - width * 0.16, cx - width * 0.06]);
  const aiX = interpolate(merge, [0, 1], [cx + width * 0.16, cx + width * 0.06]);

  const handshakeO = interpolate(merge, [0.55, 0.85], [0, 1], {extrapolateRight: 'clamp'});
  const haloO = interpolate(lockIn, [0, 1], [0.0, 0.45]);

  return (
    <AbsoluteFill>
      <SafeBackground variant="lab" />
      <GridOverlay opacity={0.14} />
      <TitleBlock
        title="Human–AI Symbiosis"
        subtitle="Augmentation → collaboration → shared capability"
        accent={colors.lime}
      />

      <svg width={width} height={height} style={{position: 'absolute'}}>
        <defs>
          <radialGradient id="halo" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor={colors.lime} stopOpacity="0.35" />
            <stop offset="40%" stopColor={colors.cyan} stopOpacity="0.18" />
            <stop offset="100%" stopColor={colors.ink} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="bridge" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.cyan} stopOpacity="0.9" />
            <stop offset="50%" stopColor={colors.lime} stopOpacity="0.9" />
            <stop offset="100%" stopColor={colors.violet} stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* Halo */}
        <circle cx={cx} cy={cy} r={Math.min(width, height) * 0.32} fill="url(#halo)" opacity={haloO} />

        {/* Human silhouette (minimal) */}
        <g opacity={0.95 * intro}>
          <circle cx={humanX} cy={cy - 170} r={44} fill="rgba(255,255,255,0.88)" />
          <rect x={humanX - 54} y={cy - 120} width={108} height={210} rx={54} fill="rgba(255,255,255,0.16)" />
          <rect x={humanX - 94} y={cy - 80} width={188} height={28} rx={14} fill="rgba(255,255,255,0.14)" />
        </g>

        {/* AI core */}
        <g opacity={0.95 * intro}>
          <rect x={aiX - 60} y={cy - 190} width={120} height={120} rx={26} fill="rgba(0,212,255,0.22)" />
          <circle cx={aiX} cy={cy - 130} r={26} fill={colors.cyan} opacity={0.9} />
          <rect x={aiX - 78} y={cy - 52} width={156} height={168} rx={34} fill="rgba(123,47,247,0.18)" />
        </g>

        {/* AI network nodes */}
        <g opacity={interpolate(merge, [0, 0.2], [0, 1], {extrapolateRight: 'clamp'})}>
          {nodes.map((n, i) => {
            const rr = n.r * Math.min(width, height) * 0.28;
            const x0 = aiX + Math.cos(n.a + frame * 0.01) * rr;
            const y0 = cy - 70 + Math.sin(n.a + frame * 0.01) * rr * 0.6;
            const toHuman = interpolate(merge, [0, 1], [0, 1]);
            const x = interpolate(toHuman, [0, 1], [x0, lerp(x0, humanX + 24, 0.35)]);
            const y = interpolate(toHuman, [0, 1], [y0, lerp(y0, cy - 40, 0.25)]);
            const o = 0.25 + 0.45 * Math.sin(frame * 0.06 + i);
            return <circle key={i} cx={x} cy={y} r={4} fill={colors.cyan} opacity={o} />;
          })}
        </g>

        {/* Bridge */}
        <line
          x1={humanX + 66}
          y1={cy - 30}
          x2={aiX - 66}
          y2={cy - 30}
          stroke="url(#bridge)"
          strokeWidth={interpolate(merge, [0, 1], [2, 8])}
          opacity={interpolate(merge, [0.2, 0.95], [0, 0.9], {extrapolateRight: 'clamp'})}
          strokeLinecap="round"
        />

        {/* Handshake glyph */}
        <g opacity={handshakeO}>
          <rect x={cx - 80} y={cy - 62} width={160} height={64} rx={18} fill="rgba(0,0,0,0.30)" stroke="rgba(255,255,255,0.10)" />
          <text
            x={cx}
            y={cy - 18}
            textAnchor="middle"
            fill={colors.lime}
            fontSize={22}
            fontWeight={950}
            fontFamily="system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
            style={{letterSpacing: '0.06em'}}
          >
            SYMBIOSIS
          </text>
        </g>
      </svg>

      <CornerTag text="Tools become teammates" color={colors.lime} />
    </AbsoluteFill>
  );
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}


