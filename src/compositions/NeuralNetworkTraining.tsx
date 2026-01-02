import React, {useMemo} from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {RenderQuality} from '../RenderQuality';
import {colors} from '../colors';
import {CornerTag, GridOverlay, SafeBackground, TitleBlock, clamp01} from './_shared';

type Props = {quality?: RenderQuality};

type Node = {x: number; y: number; layer: number};

export const NeuralNetworkTraining: React.FC<Props> = ({quality = RenderQuality.FINAL}) => {
  const frame = useCurrentFrame();
  const {fps, width, height, durationInFrames} = useVideoConfig();

  const intro = clamp01(interpolate(frame, [0, 24], [0, 1]));
  const training = clamp01(interpolate(frame, [40, 200], [0, 1]));
  const outro = clamp01(interpolate(frame, [210, durationInFrames - 1], [0, 1]));

  const scaleIn = spring({frame, fps, config: {damping: 20, stiffness: 110}, from: 0.98, to: 1});

  const nodes = useMemo(() => {
    const layers = [5, 7, 5, 3];
    const xs = layers.map((_, i) => (width * (0.18 + (0.64 * i) / (layers.length - 1))));
    const out: Node[] = [];
    layers.forEach((count, li) => {
      for (let i = 0; i < count; i++) {
        const y = height * (0.30 + (0.46 * (i + 1)) / (count + 1));
        out.push({x: xs[li], y, layer: li});
      }
    });
    return out;
  }, [height, width]);

  const layerIndexStarts = useMemo(() => {
    const layers = [5, 7, 5, 3];
    const starts: number[] = [];
    let acc = 0;
    for (const c of layers) {
      starts.push(acc);
      acc += c;
    }
    return {layers, starts};
  }, []);

  const pulseT = training;
  const pulseX = interpolate(pulseT, [0, 1], [width * 0.18, width * 0.82]);

  const datapoints = useMemo(() => {
    const count = quality === RenderQuality.DRAFT ? 90 : 150;
    const pts = Array.from({length: count}).map((_, i) => {
      const a = (i / count) * Math.PI * 2;
      const r = 1 - (i % 11) / 12;
      return {
        x: width * 0.14 + Math.cos(a) * width * 0.07 * r,
        y: height * 0.55 + Math.sin(a) * height * 0.10 * r,
      };
    });
    return pts;
  }, [height, quality, width]);

  const loss = (t: number) => {
    // smooth exponential-ish decay
    const d = Math.pow(1 - t, 2.2);
    return 0.12 + 0.85 * d;
  };

  const lossNow = loss(training);

  const stampOpacity = interpolate(outro, [0.15, 0.6], [0, 1], {extrapolateRight: 'clamp'});
  const stampScale = spring({
    frame: Math.max(0, frame - 210),
    fps,
    config: {damping: 16, stiffness: 180},
    from: 0.9,
    to: 1,
  });

  return (
    <AbsoluteFill style={{transform: `scale(${scaleIn})`}}>
      <SafeBackground variant="lab" />
      <GridOverlay opacity={0.20} />
      <TitleBlock
        title="Training a Neural Network"
        subtitle="Forward pass → loss → backprop → update. Repeat until it learns."
        accent={colors.cyan}
      />

      {/* Data cloud */}
      <svg width={width} height={height} style={{position: 'absolute'}}>
        <defs>
          <linearGradient id="nn-line" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.cyan} stopOpacity="0.35" />
            <stop offset="50%" stopColor={colors.violet} stopOpacity="0.35" />
            <stop offset="100%" stopColor={colors.lime} stopOpacity="0.35" />
          </linearGradient>
        </defs>

        {datapoints.map((p, i) => {
          const wave = 0.6 + 0.4 * Math.sin((frame * 0.06 + i) % (Math.PI * 2));
          const o = interpolate(intro, [0, 1], [0, 0.9 * wave]);
          return (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={2.2}
              fill={colors.cyan}
              opacity={o}
            />
          );
        })}

        {/* Network connections */}
        {nodes.map((from, fi) => {
          const fromLayer = from.layer;
          const nextLayer = fromLayer + 1;
          if (nextLayer >= layerIndexStarts.layers.length) return null;
          const nextStart = layerIndexStarts.starts[nextLayer];
          const nextCount = layerIndexStarts.layers[nextLayer];

          // limit connections for speed
          const step = quality === RenderQuality.DRAFT ? 2 : 1;
          const lines = [];
          for (let j = 0; j < nextCount; j += step) {
            const to = nodes[nextStart + j];
            if (!to) continue;
            const active = Math.abs(pulseX - to.x) < 90;
            const baseO = 0.14 + 0.06 * Math.sin((frame * 0.05 + fi + j) % (Math.PI * 2));
            lines.push(
              <line
                key={`${fi}-${j}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={active ? colors.lime : 'url(#nn-line)'}
                strokeWidth={active ? 2.6 : 1.2}
                opacity={interpolate(intro, [0, 1], [0, baseO])}
              />
            );
          }
          return <g key={fi}>{lines}</g>;
        })}

        {/* Nodes */}
        {nodes.map((n, i) => {
          const isPulsed = Math.abs(pulseX - n.x) < 70;
          const r = isPulsed ? 10 : 7;
          const o = isPulsed ? 0.95 : 0.75;
          return (
            <g key={i}>
              <circle cx={n.x} cy={n.y} r={r} fill={isPulsed ? colors.lime : colors.cyan} opacity={o} />
              <circle cx={n.x} cy={n.y} r={r * 0.5} fill="white" opacity={0.15} />
            </g>
          );
        })}

        {/* Loss chart */}
        <g>
          <rect
            x={width * 0.12}
            y={height * 0.76}
            width={width * 0.76}
            height={height * 0.14}
            fill="rgba(0,0,0,0.25)"
            stroke="rgba(255,255,255,0.10)"
            strokeWidth={1}
            rx={18}
          />
          {Array.from({length: 8}).map((_, i) => (
            <line
              key={i}
              x1={width * 0.14 + (i * width * 0.72) / 7}
              y1={height * 0.78}
              x2={width * 0.14 + (i * width * 0.72) / 7}
              y2={height * 0.88}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
            />
          ))}

          {/* curve */}
          {Array.from({length: 90}).map((_, i) => {
            const t0 = i / 90;
            const t1 = (i + 1) / 90;
            const x0 = width * 0.14 + t0 * width * 0.72;
            const x1 = width * 0.14 + t1 * width * 0.72;
            const y0 = height * 0.88 - loss(t0) * height * 0.09;
            const y1 = height * 0.88 - loss(t1) * height * 0.09;
            const draw = clamp01(interpolate(training, [0.05, 0.95], [0, 1]));
            if (t1 > draw) return null;
            return (
              <line
                key={i}
                x1={x0}
                y1={y0}
                x2={x1}
                y2={y1}
                stroke={colors.magenta}
                strokeWidth={3}
                opacity={0.9}
              />
            );
          })}

          {/* dot */}
          <circle
            cx={width * 0.14 + training * width * 0.72}
            cy={height * 0.88 - lossNow * height * 0.09}
            r={8}
            fill={colors.lime}
            opacity={0.95}
          />

          <text
            x={width * 0.16}
            y={height * 0.805}
            fill="rgba(255,255,255,0.78)"
            fontSize={20}
            fontWeight={800}
            fontFamily="system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
          >
            Loss ↓
          </text>
        </g>
      </svg>

      {/* Trained stamp */}
      <div
        style={{
          position: 'absolute',
          right: 64,
          bottom: 120,
          transform: `rotate(-10deg) scale(${stampScale})`,
          opacity: stampOpacity,
          border: `3px solid ${colors.lime}`,
          borderRadius: 18,
          padding: '14px 18px',
          color: colors.lime,
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
          fontWeight: 900,
          letterSpacing: '0.10em',
          textTransform: 'uppercase',
          background: 'rgba(0,0,0,0.25)',
        }}
      >
        Trained
      </div>

      <CornerTag text="Gradient descent in motion" color={colors.lime} />
    </AbsoluteFill>
  );
};


