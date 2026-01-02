import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {RenderQuality} from '../RenderQuality';
import {colors} from '../colors';
import {CornerTag, GridOverlay, SafeBackground, TitleBlock, clamp01} from './_shared';

type Props = {quality?: RenderQuality};

export const BigBang: React.FC<Props> = ({quality = RenderQuality.FINAL}) => {
  const frame = useCurrentFrame();
  const {fps, width, height, durationInFrames} = useVideoConfig();

  const t = frame / (durationInFrames - 1);
  const intro = clamp01(interpolate(frame, [0, 20], [0, 1]));
  const inflation = clamp01(interpolate(frame, [28, 88], [0, 1]));
  const particlesT = clamp01(interpolate(frame, [72, 150], [0, 1]));
  const cmbT = clamp01(interpolate(frame, [150, 210], [0, 1]));

  const shock = spring({
    frame: Math.max(0, frame - 28),
    fps,
    config: {damping: 18, stiffness: 220},
    from: 0,
    to: 1,
  });

  const burstR = interpolate(shock, [0, 1], [2, Math.max(width, height) * 0.8]);
  const singularityO = interpolate(frame, [0, 30], [0.9, 0], {extrapolateRight: 'clamp'});

  const count = quality === RenderQuality.DRAFT ? 120 : 220;
  const dots = useMemo(() => {
    return Array.from({length: count}).map((_, i) => {
      const a = (i / count) * Math.PI * 2;
      const r = (0.25 + ((i * 73) % 100) / 100) * 0.85;
      return {a, r};
    });
  }, [count]);

  const noiseDots = useMemo(() => {
    const n = quality === RenderQuality.DRAFT ? 900 : 1500;
    return Array.from({length: n}).map((_, i) => {
      const x = (i * 97) % 1080;
      const y = (i * 223) % 1920;
      const v = ((i * 13) % 100) / 100;
      return {x, y, v};
    });
  }, [quality]);

  const zoom = interpolate(inflation, [0, 1], [1.06, 1]);

  return (
    <AbsoluteFill style={{transform: `scale(${zoom})`}}>
      <SafeBackground variant="space" />
      <GridOverlay opacity={0.16} />
      <TitleBlock title="Birth of the Universe" subtitle="The Big Bang → inflation → first light" accent={colors.magenta} />

      <svg width={width} height={height} style={{position: 'absolute'}}>
        <defs>
          <radialGradient id="bb-core" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="18%" stopColor={colors.yellow} stopOpacity="0.95" />
            <stop offset="45%" stopColor={colors.magenta} stopOpacity="0.65" />
            <stop offset="100%" stopColor={colors.ink} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Singularity */}
        <circle
          cx={width / 2}
          cy={height / 2}
          r={14}
          fill="white"
          opacity={singularityO}
        />

        {/* Inflation ring */}
        <circle
          cx={width / 2}
          cy={height / 2}
          r={burstR}
          fill="url(#bb-core)"
          opacity={0.75 * inflation}
        />

        {/* Particle expansion */}
        {dots.map((d, i) => {
          const rr = burstR * (0.25 + d.r);
          const x = width / 2 + Math.cos(d.a) * rr;
          const y = height / 2 + Math.sin(d.a) * rr;
          const o = 0.1 + 0.9 * particlesT;
          const s = 1.4 + ((i * 17) % 10) / 10;
          const hue = i % 3 === 0 ? colors.cyan : i % 3 === 1 ? colors.magenta : colors.yellow;
          return <circle key={i} cx={x} cy={y} r={s} fill={hue} opacity={o * 0.85} />;
        })}

        {/* First light / CMB-style noise */}
        <g opacity={cmbT}>
          {noiseDots.map((p, i) => {
            const o = 0.05 + 0.22 * p.v;
            const c = p.v > 0.66 ? colors.cyan : p.v > 0.33 ? colors.magenta : colors.yellow;
            // center the deterministic tiling into portrait
            const x = (p.x / 1080) * width;
            const y = (p.y / 1920) * height;
            return <rect key={i} x={x} y={y} width={2} height={2} fill={c} opacity={o} />;
          })}
          <rect x={0} y={0} width={width} height={height} fill="rgba(0,0,0,0.10)" />
        </g>

        {/* Caption */}
        <g opacity={interpolate(t, [0.78, 0.95], [0, 1], {extrapolateRight: 'clamp'})}>
          <rect
            x={width * 0.12}
            y={height * 0.72}
            width={width * 0.76}
            height={130}
            rx={22}
            fill="rgba(0,0,0,0.30)"
            stroke="rgba(255,255,255,0.10)"
          />
          <text
            x={width * 0.16}
            y={height * 0.77}
            fill="rgba(255,255,255,0.90)"
            fontSize={28}
            fontWeight={900}
            fontFamily="system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
          >
            Space expands.
          </text>
          <text
            x={width * 0.16}
            y={height * 0.82}
            fill="rgba(255,255,255,0.72)"
            fontSize={20}
            fontWeight={650}
            fontFamily="system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
          >
            Tiny fluctuations become everything you’ll ever see.
          </text>
        </g>
      </svg>

      <CornerTag text="From hot dense to structured cosmos" color={colors.magenta} />
    </AbsoluteFill>
  );
};


