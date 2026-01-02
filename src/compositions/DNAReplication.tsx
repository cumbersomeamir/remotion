import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {RenderQuality} from '../RenderQuality';
import {colors} from '../colors';
import {CornerTag, GridOverlay, SafeBackground, TitleBlock, clamp01} from './_shared';

type Props = {quality?: RenderQuality};

export const DNAReplication: React.FC<Props> = ({quality = RenderQuality.FINAL}) => {
  const frame = useCurrentFrame();
  const {fps, width, height, durationInFrames} = useVideoConfig();

  const intro = clamp01(interpolate(frame, [0, 18], [0, 1]));
  const unzip = clamp01(interpolate(frame, [30, 120], [0, 1]));
  const build = clamp01(interpolate(frame, [90, 200], [0, 1]));

  const twist = frame * 0.04;
  const sep = interpolate(unzip, [0, 1], [34, 160]);

  const polymeraseY = interpolate(build, [0, 1], [height * 0.78, height * 0.34]);
  const polymeraseX = width * 0.50 + Math.sin(frame * 0.03) * 12;

  const pairs = quality === RenderQuality.DRAFT ? 18 : 26;
  const backboneSteps = Array.from({length: pairs});

  const pulse = spring({
    frame: Math.max(0, frame - 26),
    fps,
    config: {damping: 20, stiffness: 100},
    from: 0,
    to: 1,
  });

  return (
    <AbsoluteFill>
      <SafeBackground variant="bio" />
      <GridOverlay opacity={0.14} />
      <TitleBlock title="DNA Replication" subtitle="Unzip → match bases → build the new strand" accent={colors.lime} />

      <svg width={width} height={height} style={{position: 'absolute'}}>
        <defs>
          <linearGradient id="dnaA" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.cyan} stopOpacity="0.9" />
            <stop offset="100%" stopColor={colors.violet} stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="dnaB" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.magenta} stopOpacity="0.9" />
            <stop offset="100%" stopColor={colors.yellow} stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* Backbones + base pairs */}
        {backboneSteps.map((_, i) => {
          const u = i / (pairs - 1);
          const y = height * (0.30 + u * 0.50);

          const wobble = Math.sin(twist + u * Math.PI * 6) * 22;
          const xCenter = width * 0.50 + wobble;

          const leftX = xCenter - sep * 0.55;
          const rightX = xCenter + sep * 0.55;

          const show = clamp01(interpolate(build, [0, 1], [-0.15 + u, 0.35 + u]));
          const baseO = interpolate(show, [0, 1], [0, 1]);

          // original backbone
          const backboneO = interpolate(intro, [0, 1], [0, 1]);

          return (
            <g key={i}>
              <circle cx={leftX} cy={y} r={6} fill="url(#dnaA)" opacity={backboneO} />
              <circle cx={rightX} cy={y} r={6} fill="url(#dnaB)" opacity={backboneO} />

              {/* base pair (appears during build) */}
              <line
                x1={leftX + 8}
                y1={y}
                x2={rightX - 8}
                y2={y}
                stroke={i % 2 === 0 ? colors.lime : colors.yellow}
                strokeWidth={3}
                opacity={0.35 + 0.55 * baseO}
              />
            </g>
          );
        })}

        {/* Unzipping zipper line */}
        <line
          x1={width * 0.50}
          y1={height * 0.28}
          x2={width * 0.50}
          y2={height * 0.82}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={2}
          opacity={0.5 * intro}
        />

        {/* Polymerase */}
        <g opacity={interpolate(build, [0.05, 0.25], [0, 1], {extrapolateRight: 'clamp'})}>
          <circle cx={polymeraseX} cy={polymeraseY} r={28} fill="rgba(0,0,0,0.35)" />
          <circle cx={polymeraseX} cy={polymeraseY} r={22} fill={colors.lime} opacity={0.85} />
          <circle cx={polymeraseX} cy={polymeraseY} r={10} fill="white" opacity={0.18} />
          <text
            x={polymeraseX}
            y={polymeraseY + 56}
            textAnchor="middle"
            fill="rgba(255,255,255,0.82)"
            fontSize={18}
            fontWeight={800}
            fontFamily="system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
          >
            polymerase
          </text>
        </g>

        {/* Completion bar */}
        <g opacity={interpolate(build, [0.1, 0.25], [0, 1], {extrapolateRight: 'clamp'})}>
          <rect
            x={width * 0.16}
            y={height * 0.86}
            width={width * 0.68}
            height={18}
            rx={999}
            fill="rgba(255,255,255,0.10)"
          />
          <rect
            x={width * 0.16}
            y={height * 0.86}
            width={width * 0.68 * build}
            height={18}
            rx={999}
            fill={colors.lime}
            opacity={0.92}
          />
          <text
            x={width * 0.16}
            y={height * 0.84}
            fill="rgba(255,255,255,0.72)"
            fontSize={16}
            fontWeight={800}
            fontFamily="system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
          >
            replication
          </text>
        </g>
      </svg>

      <CornerTag text="Semi-conservative replication" color={colors.lime} />
    </AbsoluteFill>
  );
};


