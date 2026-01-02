import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {RenderQuality} from '../RenderQuality';
import {colors} from '../colors';
import {story} from '../data';
import {CornerTag, GridOverlay, SafeBackground, TitleBlock, clamp01} from './_shared';

type Props = {quality?: RenderQuality};

type Candle = {o: number; h: number; l: number; c: number};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const keyframePrice = (t: number) => {
  const k = story.marketKeyframes;
  for (let i = 0; i < k.length - 1; i++) {
    const a = k[i];
    const b = k[i + 1];
    if (t >= a.t && t <= b.t) {
      const u = (t - a.t) / (b.t - a.t);
      return {price: lerp(a.price, b.price, u), vol: lerp(a.vol, b.vol, u)};
    }
  }
  return {price: k[k.length - 1].price, vol: k[k.length - 1].vol};
};

export const FinancialMarkets: React.FC<Props> = ({quality = RenderQuality.FINAL}) => {
  const frame = useCurrentFrame();
  const {width, height, durationInFrames} = useVideoConfig();

  const t = frame / (durationInFrames - 1);
  const intro = clamp01(interpolate(frame, [0, 18], [0, 1]));
  const live = clamp01(interpolate(frame, [24, durationInFrames - 18], [0, 1]));

  const candleCount = quality === RenderQuality.DRAFT ? 36 : 52;
  const candles: Candle[] = useMemo(() => {
    const out: Candle[] = [];
    let p = 100;
    for (let i = 0; i < candleCount; i++) {
      const u = i / (candleCount - 1);
      const {price, vol} = keyframePrice(u);
      const drift = (price - p) * 0.6;
      const noise = Math.sin(i * 1.7) * 1.2 + Math.cos(i * 0.9) * 0.8;
      const delta = drift * 0.15 + noise * (0.6 + vol * 1.8);
      const o = p;
      const c = p + delta;
      const hi = Math.max(o, c) + (0.8 + vol * 6) * (0.4 + (i % 7) / 10);
      const lo = Math.min(o, c) - (0.8 + vol * 6) * (0.4 + (i % 5) / 10);
      out.push({o, h: hi, l: lo, c});
      p = c;
    }
    return out;
  }, [candleCount]);

  const view = candles.slice(0, Math.max(2, Math.floor(2 + live * (candleCount - 1))));
  const prices = view.flatMap((c) => [c.o, c.h, c.l, c.c]);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const pad = (max - min) * 0.12 + 1;
  const minV = min - pad;
  const maxV = max + pad;

  const chart = {
    x: width * 0.10,
    y: height * 0.30,
    w: width * 0.80,
    h: height * 0.46,
  };

  const yOf = (v: number) => chart.y + chart.h - ((v - minV) / (maxV - minV)) * chart.h;

  const last = view[view.length - 1];
  const lastPrice = last.c;
  const lastVol = keyframePrice(live).vol;
  const volatilityGlow = interpolate(lastVol, [0.15, 0.75], [0.15, 0.55], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill>
      <SafeBackground variant="market" />
      <GridOverlay opacity={0.14} />
      <TitleBlock
        title="Financial Markets Reacting"
        subtitle="Orders hit → price moves → volatility spikes"
        accent={colors.lime}
      />

      <svg width={width} height={height} style={{position: 'absolute'}}>
        <defs>
          <linearGradient id="up" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colors.lime} stopOpacity="0.95" />
            <stop offset="100%" stopColor={colors.cyan} stopOpacity="0.65" />
          </linearGradient>
          <linearGradient id="down" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colors.magenta} stopOpacity="0.95" />
            <stop offset="100%" stopColor={colors.orange} stopOpacity="0.65" />
          </linearGradient>
        </defs>

        {/* chart frame */}
        <rect
          x={chart.x}
          y={chart.y}
          width={chart.w}
          height={chart.h}
          rx={24}
          fill="rgba(0,0,0,0.26)"
          stroke="rgba(255,255,255,0.12)"
        />

        {/* grid lines */}
        {Array.from({length: 6}).map((_, i) => (
          <line
            key={i}
            x1={chart.x + 18}
            y1={chart.y + 18 + (i * (chart.h - 36)) / 5}
            x2={chart.x + chart.w - 18}
            y2={chart.y + 18 + (i * (chart.h - 36)) / 5}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={1}
          />
        ))}

        {/* candles */}
        {view.map((c, i) => {
          const xStep = (chart.w - 90) / (candleCount - 1);
          const x = chart.x + 45 + i * xStep;
          const isUp = c.c >= c.o;
          const bodyTop = yOf(Math.max(c.o, c.c));
          const bodyBot = yOf(Math.min(c.o, c.c));
          const wickTop = yOf(c.h);
          const wickBot = yOf(c.l);
          const bodyH = Math.max(6, bodyBot - bodyTop);
          const bodyW = Math.max(10, xStep * 0.55);
          const o = 0.35 + 0.65 * intro;
          return (
            <g key={i} opacity={o}>
              <line x1={x} y1={wickTop} x2={x} y2={wickBot} stroke="rgba(255,255,255,0.22)" strokeWidth={2} />
              <rect
                x={x - bodyW / 2}
                y={bodyTop}
                width={bodyW}
                height={bodyH}
                rx={3}
                fill={isUp ? 'url(#up)' : 'url(#down)'}
                opacity={0.92}
              />
            </g>
          );
        })}

        {/* live price line */}
        <line
          x1={chart.x + 18}
          y1={yOf(lastPrice)}
          x2={chart.x + chart.w - 18}
          y2={yOf(lastPrice)}
          stroke={colors.cyan}
          strokeWidth={2}
          opacity={0.18 + volatilityGlow}
        />

        {/* ticker */}
        <g opacity={interpolate(frame, [12, 24], [0, 1], {extrapolateRight: 'clamp'})}>
          <rect
            x={chart.x}
            y={chart.y + chart.h + 26}
            width={chart.w}
            height={108}
            rx={22}
            fill="rgba(0,0,0,0.22)"
            stroke="rgba(255,255,255,0.10)"
          />
          <text
            x={chart.x + 26}
            y={chart.y + chart.h + 66}
            fill="rgba(255,255,255,0.78)"
            fontSize={18}
            fontWeight={900}
            fontFamily="system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
          >
            TICKER: XYZ
          </text>
          <text
            x={chart.x + 26}
            y={chart.y + chart.h + 102}
            fill="rgba(255,255,255,0.92)"
            fontSize={40}
            fontWeight={950}
            fontFamily="system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
          >
            ${lastPrice.toFixed(2)}
          </text>
          <text
            x={chart.x + chart.w - 26}
            y={chart.y + chart.h + 102}
            textAnchor="end"
            fill={last.c >= last.o ? colors.lime : colors.magenta}
            fontSize={22}
            fontWeight={900}
            fontFamily="system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
          >
            vol {(lastVol * 100).toFixed(0)}%
          </text>
        </g>
      </svg>

      <CornerTag text="Microstructure → macro movement" color={colors.lime} />
    </AbsoluteFill>
  );
};


