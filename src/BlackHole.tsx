import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
} from 'remotion';

interface AccretionParticle {
  angle: number;
  radius: number;
  speed: number;
  size: number;
}

export const BlackHole: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  const centerX = width / 2;
  const centerY = height / 2;

  const accretionParticles = useMemo(() => {
    return Array.from({ length: 150 }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: 100 + Math.random() * 300,
      speed: 0.01 + Math.random() * 0.02,
      size: 1 + Math.random() * 2,
    }));
  }, []);

  const supernovaProgress = interpolate(
    frame,
    [30, durationInFrames * 0.3],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  const collapseProgress = interpolate(
    frame,
    [durationInFrames * 0.3, durationInFrames * 0.6],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  const eventHorizonRadius = interpolate(
    collapseProgress,
    [0, 1],
    [200, 40],
    { extrapolateRight: 'clamp' }
  );

  const accretionDiskOpacity = spring({
    frame: Math.max(0, frame - durationInFrames * 0.6),
    fps,
    config: { damping: 50, stiffness: 30 },
    from: 0,
    to: 1,
  });

  const titleOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const supernovaRadius = supernovaProgress * width * 0.8;
  const supernovaBrightness = interpolate(
    supernovaProgress,
    [0, 0.3, 0.7, 1],
    [0, 1, 0.8, 0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#000000',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 80,
          left: 0,
          right: 0,
          textAlign: 'center',
          opacity: titleOpacity,
          zIndex: 10,
        }}
      >
        <h1
          style={{
            fontSize: 64,
            fontFamily: 'system-ui, sans-serif',
            fontWeight: 'bold',
            color: '#ff0066',
            margin: 0,
            textShadow: '0 0 30px rgba(255, 0, 102, 0.8)',
          }}
        >
          Black Hole Collapse
        </h1>
      </div>

      <svg width={width} height={height} style={{ position: 'absolute' }}>
        <defs>
          <radialGradient id="supernovaGradient">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="20%" stopColor="#ff0066" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#ff6600" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="accretionGradient">
            <stop offset="0%" stopColor="#ff0066" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#ff6600" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ffaa00" stopOpacity="0.3" />
          </radialGradient>
          <radialGradient id="blackHoleGradient">
            <stop offset="0%" stopColor="#000000" stopOpacity="1" />
            <stop offset="70%" stopColor="#330033" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#660066" stopOpacity="0.5" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {supernovaProgress > 0 && supernovaProgress < 1 && (
          <circle
            cx={centerX}
            cy={centerY}
            r={supernovaRadius}
            fill="url(#supernovaGradient)"
            opacity={supernovaBrightness}
          />
        )}

        {accretionParticles.map((particle, idx) => {
          const currentAngle = particle.angle + frame * particle.speed;
          const currentRadius = particle.radius * (1 - collapseProgress * 0.7);
          const x = centerX + Math.cos(currentAngle) * currentRadius;
          const y = centerY + Math.sin(currentAngle) * currentRadius;

          const distanceFromCenter = Math.sqrt(
            Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
          );
          const opacity = distanceFromCenter > eventHorizonRadius + 20
            ? accretionDiskOpacity * (0.3 + Math.sin(frame * 0.2 + idx) * 0.2)
            : 0;

          return (
            <circle
              key={idx}
              cx={x}
              cy={y}
              r={particle.size}
              fill="url(#accretionGradient)"
              opacity={opacity}
            />
          );
        })}

        {collapseProgress > 0.5 && (
          <>
            <circle
              cx={centerX}
              cy={centerY}
              r={eventHorizonRadius * 1.2}
              fill="url(#accretionGradient)"
              opacity={accretionDiskOpacity * 0.3}
            />
            <circle
              cx={centerX}
              cy={centerY}
              r={eventHorizonRadius}
              fill="url(#blackHoleGradient)"
              filter="url(#glow)"
            />
            <circle
              cx={centerX}
              cy={centerY}
              r={eventHorizonRadius * 0.7}
              fill="#000000"
            />
          </>
        )}

        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2 + frame * 0.05;
          const rayLength = eventHorizonRadius * 1.5;
          const rayOpacity = Math.sin(frame * 0.2 + i) * 0.2 + 0.3;
          return (
            <line
              key={i}
              x1={centerX + Math.cos(angle) * eventHorizonRadius}
              y1={centerY + Math.sin(angle) * eventHorizonRadius}
              x2={centerX + Math.cos(angle) * rayLength}
              y2={centerY + Math.sin(angle) * rayLength}
              stroke="#ff0066"
              strokeWidth={2}
              opacity={rayOpacity * accretionDiskOpacity}
            />
          );
        })}
      </svg>

      <div
        style={{
          position: 'absolute',
          bottom: 60,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-around',
          opacity: interpolate(frame, [durationInFrames - 60, durationInFrames - 30], [0, 1]),
          zIndex: 10,
        }}
      >
        <div style={{ textAlign: 'center', color: '#ff0066' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold' }}>Supernova</div>
          <div style={{ fontSize: 14, opacity: 0.7 }}>Explosion</div>
        </div>
        <div style={{ textAlign: 'center', color: '#ff6600' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold' }}>Collapse</div>
          <div style={{ fontSize: 14, opacity: 0.7 }}>Gravitational</div>
        </div>
        <div style={{ textAlign: 'center', color: '#ffaa00' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold' }}>Event Horizon</div>
          <div style={{ fontSize: 14, opacity: 0.7 }}>Formed</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

