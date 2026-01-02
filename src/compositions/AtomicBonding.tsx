import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {RenderQuality} from '../RenderQuality';
import {colors} from '../colors';
import {CornerTag, GridOverlay, SafeBackground, TitleBlock, clamp01} from './_shared';

type Props = {quality?: RenderQuality};

export const AtomicBonding: React.FC<Props> = ({quality = RenderQuality.FINAL}) => {
  const frame = useCurrentFrame();
  const {fps, width, height, durationInFrames} = useVideoConfig();

  const t = frame / (durationInFrames - 1);
  const intro = clamp01(interpolate(frame, [0, 18], [0, 1]));
  const approach = clamp01(interpolate(frame, [28, 110], [0, 1]));
  const bond = clamp01(interpolate(frame, [100, 160], [0, 1]));
  const settle = spring({
    frame: Math.max(0, frame - 140),
    fps,
    config: {damping: 20, stiffness: 120},
    from: 0,
    to: 1,
  });

  const cx = width / 2;
  const cy = height * 0.55;
  const sep = interpolate(approach, [0, 1], [width * 0.34, width * 0.12]);

  const leftX = cx - sep;
  const rightX = cx + sep;

  const orbit = frame * 0.05;
  const electronCount = quality === RenderQuality.DRAFT ? 6 : 10;

  const bondO = interpolate(bond, [0.2, 1], [0, 1], {extrapolateRight: 'clamp'});
  const bondW = interpolate(settle, [0, 1], [2, 6]);

  const energyMinX = width * 0.62;
  const energyMinY = height * 0.84;

  return (
    <AbsoluteFill>
      <SafeBackground variant="lab" />
      <GridOverlay opacity={0.18} />
      <TitleBlock title="Atomic Bonding" subtitle="Orbitals overlap → shared electrons → stable bond" accent={colors.yellow} />

      <svg width={width} height={height} style={{position: 'absolute'}}>
        <defs>
          <radialGradient id="atomA" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="50%" stopColor={colors.cyan} stopOpacity="0.85" />
            <stop offset="100%" stopColor={colors.ink} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="atomB" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="50%" stopColor={colors.magenta} stopOpacity="0.85" />
            <stop offset="100%" stopColor={colors.ink} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="bondG" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.cyan} stopOpacity="0.9" />
            <stop offset="100%" stopColor={colors.magenta} stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* Overlap cloud */}
        <ellipse
          cx={cx}
          cy={cy}
          rx={interpolate(bond, [0, 1], [10, width * 0.14])}
          ry={interpolate(bond, [0, 1], [10, height * 0.09])}
          fill="rgba(0, 212, 255, 0.12)"
          opacity={bondO}
        />

        {/* Bond line */}
        <line
          x1={leftX}
          y1={cy}
          x2={rightX}
          y2={cy}
          stroke="url(#bondG)"
          strokeWidth={bondW}
          opacity={bondO}
          strokeLinecap="round"
        />

        {/* Atoms */}
        <circle cx={leftX} cy={cy} r={78} fill="url(#atomA)" opacity={0.85 * intro} />
        <circle cx={rightX} cy={cy} r={78} fill="url(#atomB)" opacity={0.85 * intro} />
        <circle cx={leftX} cy={cy} r={18} fill="white" opacity={0.28} />
        <circle cx={rightX} cy={cy} r={18} fill="white" opacity={0.28} />

        {/* Electrons */}
        {Array.from({length: electronCount}).map((_, i) => {
          const a = (i / electronCount) * Math.PI * 2 + orbit;
          const rr = 110 + ((i * 19) % 30);
          const xL = leftX + Math.cos(a) * rr * 0.55;
          const yL = cy + Math.sin(a) * rr * 0.35;
          const xR = rightX + Math.cos(-a) * rr * 0.55;
          const yR = cy + Math.sin(-a) * rr * 0.35;

          const pull = bond; // electrons get shared
          const x = interpolate(pull, [0, 1], [i % 2 === 0 ? xL : xR, cx + Math.cos(a) * 30]);
          const y = interpolate(pull, [0, 1], [i % 2 === 0 ? yL : yR, cy + Math.sin(a) * 18]);

          return <circle key={i} cx={x} cy={y} r={4} fill={colors.lime} opacity={0.9} />;
        })}

        {/* Energy well mini-graph */}
        <g opacity={interpolate(t, [0.55, 0.85], [0, 1], {extrapolateRight: 'clamp'})}>
          <rect
            x={width * 0.10}
            y={height * 0.76}
            width={width * 0.80}
            height={160}
            rx={22}
            fill="rgba(0,0,0,0.28)"
            stroke="rgba(255,255,255,0.10)"
          />
          <text
            x={width * 0.14}
            y={height * 0.81}
            fill="rgba(255,255,255,0.84)"
            fontSize={20}
            fontWeight={850}
            fontFamily="system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
          >
            Potential Energy
          </text>

          {Array.from({length: 90}).map((_, i) => {
            const u = i / 90;
            const x = width * 0.14 + u * width * 0.72;
            const y = height * 0.88 - (Math.exp(-Math.pow((u - 0.65) * 4.2, 2)) * 60);
            const y2 =
              height * 0.88 - (Math.exp(-Math.pow(((u + 1 / 90) - 0.65) * 4.2, 2)) * 60);
            return (
              <line
                key={i}
                x1={x}
                y1={y}
                x2={x + width * 0.72 / 90}
                y2={y2}
                stroke={colors.yellow}
                strokeWidth={3}
                opacity={0.85}
              />
            );
          })}

          <circle cx={energyMinX} cy={energyMinY} r={8} fill={colors.lime} opacity={0.95} />
          <text
            x={energyMinX}
            y={energyMinY - 14}
            textAnchor="middle"
            fill={colors.lime}
            fontSize={16}
            fontWeight={900}
            fontFamily="system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
          >
            Stable
          </text>
        </g>
      </svg>

      <CornerTag text="Covalent bond: shared electrons" color={colors.yellow} />
    </AbsoluteFill>
  );
};


