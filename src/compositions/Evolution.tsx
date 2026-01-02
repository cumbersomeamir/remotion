import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {RenderQuality} from '../RenderQuality';
import {colors} from '../colors';
import {story} from '../data';
import {CornerTag, GridOverlay, SafeBackground, TitleBlock, clamp01} from './_shared';

type Props = {quality?: RenderQuality};

export const Evolution: React.FC<Props> = ({quality = RenderQuality.FINAL}) => {
  const frame = useCurrentFrame();
  const {fps, width, height, durationInFrames} = useVideoConfig();

  const intro = clamp01(interpolate(frame, [0, 18], [0, 1]));
  const progress = clamp01(interpolate(frame, [28, durationInFrames - 28], [0, 1]));

  const stageCount = story.evolutionStages.length;
  const active = Math.min(stageCount - 1, Math.floor(progress * stageCount));

  const cardW = width * 0.78;
  const cardH = 118;
  const startY = height * 0.34;
  const gap = 20;

  return (
    <AbsoluteFill>
      <SafeBackground variant="bio" />
      <GridOverlay opacity={0.12} />
      <TitleBlock
        title="Evolution from Single-Cell Life"
        subtitle="Small variations + selection → new forms over time"
        accent={colors.orange}
      />

      <div style={{position: 'absolute', left: (width - cardW) / 2, top: startY}}>
        {story.evolutionStages.map((s, i) => {
          const appear = clamp01(interpolate(progress, [(i - 0.5) / stageCount, (i + 0.3) / stageCount], [0, 1]));
          const lift = spring({
            frame: Math.max(0, frame - 28 - i * 12),
            fps,
            config: {damping: 18, stiffness: 140},
            from: 18,
            to: 0,
          });
          const isActive = i === active;
          const glow = isActive ? 1 : 0;
          const scale = isActive ? 1.02 : 1;

          return (
            <div
              key={s.key}
              style={{
                width: cardW,
                height: cardH,
                marginBottom: gap,
                borderRadius: 22,
                padding: '18px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(0,0,0,0.28)',
                border: `1px solid rgba(255,255,255,${0.08 + glow * 0.10})`,
                transform: `translateY(${lift}px) scale(${scale})`,
                opacity: appear,
                boxShadow: isActive ? `0 0 0 2px ${s.color} inset` : 'none',
              }}
            >
              <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 20,
                    background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), ${s.color} 45%, rgba(0,0,0,0) 75%)`,
                    opacity: 0.95,
                  }}
                />
                <div>
                  <div
                    style={{
                      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
                      fontWeight: 900,
                      fontSize: 30,
                      color: 'rgba(255,255,255,0.92)',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {s.label}
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
                      fontWeight: 650,
                      fontSize: 16,
                      color: 'rgba(255,255,255,0.64)',
                    }}
                  >
                    {i === 0
                      ? 'Replication + mutation'
                      : i === 1
                        ? 'Specialization'
                        : i === 2
                          ? 'Ecosystems'
                          : i === 3
                            ? 'Adaptation'
                            : 'Complex brains'}
                  </div>
                </div>
              </div>

              <div
                style={{
                  fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
                  fontWeight: 900,
                  fontSize: 18,
                  letterSpacing: '0.10em',
                  textTransform: 'uppercase',
                  color: s.color,
                }}
              >
                {i + 1}/{stageCount}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress rail */}
      <div
        style={{
          position: 'absolute',
          left: width * 0.12,
          right: width * 0.12,
          bottom: 110,
        }}
      >
        <div
          style={{
            height: 16,
            borderRadius: 999,
            background: 'rgba(255,255,255,0.10)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress * 100}%`,
              background: `linear-gradient(90deg, ${colors.cyan}, ${colors.orange}, ${colors.magenta})`,
            }}
          />
        </div>
        <div
          style={{
            marginTop: 10,
            display: 'flex',
            justifyContent: 'space-between',
            color: 'rgba(255,255,255,0.62)',
            fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          <div>billions of years</div>
          <div>in 8 seconds</div>
        </div>
      </div>

      <CornerTag text="Selection amplifies what works" color={colors.orange} />
    </AbsoluteFill>
  );
};


