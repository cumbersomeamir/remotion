import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
} from 'remotion';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  mass: number;
}

export const StarFormation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  const centerX = width / 2;
  const centerY = height / 2;

  const particles = useMemo(() => {
    return Array.from({ length: 200 }, () => ({
      x: centerX + (Math.random() - 0.5) * width * 0.8,
      y: centerY + (Math.random() - 0.5) * height * 0.8,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      mass: Math.random() * 0.5 + 0.5,
    }));
  }, []);

  const collapseProgress = interpolate(
    frame,
    [30, durationInFrames * 0.6],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  const fusionIgnition = interpolate(
    frame,
    [durationInFrames * 0.6, durationInFrames * 0.7],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  const starBrightness = spring({
    frame: Math.max(0, frame - durationInFrames * 0.65),
    fps,
    config: { damping: 100, stiffness: 50 },
    from: 0,
    to: 1,
  });

  const titleOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const starRadius = interpolate(
    collapseProgress,
    [0, 1],
    [width * 0.4, 30],
    { extrapolateRight: 'clamp' }
  );

  const finalStarRadius = 30 + starBrightness * 50;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#000011',
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
            color: '#ffaa00',
            margin: 0,
            textShadow: '0 0 30px rgba(255, 170, 0, 0.8)',
          }}
        >
          Star Formation
        </h1>
      </div>

      <svg width={width} height={height} style={{ position: 'absolute' }}>
        <defs>
          <radialGradient id="starGradient">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="30%" stopColor="#ffaa00" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#ff6600" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#ff3300" stopOpacity="0.3" />
          </radialGradient>
          <radialGradient id="particleGradient">
            <stop offset="0%" stopColor="#00aaff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0066ff" stopOpacity="0.3" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {particles.map((particle, idx) => {
          const distanceFromCenter = Math.sqrt(
            Math.pow(particle.x - centerX, 2) + Math.pow(particle.y - centerY, 2)
          );
          const angle = Math.atan2(particle.y - centerY, particle.x - centerX);
          
          const collapsedX = centerX + Math.cos(angle) * distanceFromCenter * (1 - collapseProgress);
          const collapsedY = centerY + Math.sin(angle) * distanceFromCenter * (1 - collapseProgress);

          const particleOpacity = collapseProgress < 0.9 
            ? 1 - collapseProgress * 0.8 
            : 0;

          return (
            <circle
              key={idx}
              cx={collapsedX}
              cy={collapsedY}
              r={2 + particle.mass * 2}
              fill="url(#particleGradient)"
              opacity={particleOpacity}
            />
          );
        })}

        {fusionIgnition > 0 && (
          <>
            <circle
              cx={centerX}
              cy={centerY}
              r={finalStarRadius}
              fill="url(#starGradient)"
              filter="url(#glow)"
              opacity={starBrightness}
            />
            <circle
              cx={centerX}
              cy={centerY}
              r={finalStarRadius * 0.7}
              fill="#ffffff"
              opacity={starBrightness * 0.8}
            />
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i / 12) * Math.PI * 2;
              const rayLength = finalStarRadius * 2;
              const rayOpacity = Math.sin(frame * 0.3 + i) * 0.3 + 0.5;
              return (
                <line
                  key={i}
                  x1={centerX}
                  y1={centerY}
                  x2={centerX + Math.cos(angle) * rayLength}
                  y2={centerY + Math.sin(angle) * rayLength}
                  stroke="#ffaa00"
                  strokeWidth={3}
                  opacity={rayOpacity * starBrightness}
                />
              );
            })}
          </>
        )}
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
        <div style={{ textAlign: 'center', color: '#00aaff' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold' }}>Nebula</div>
          <div style={{ fontSize: 14, opacity: 0.7 }}>Cloud Collapse</div>
        </div>
        <div style={{ textAlign: 'center', color: '#ffaa00' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold' }}>Fusion</div>
          <div style={{ fontSize: 14, opacity: 0.7 }}>Ignition</div>
        </div>
        <div style={{ textAlign: 'center', color: '#ffffff' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold' }}>Star</div>
          <div style={{ fontSize: 14, opacity: 0.7 }}>Born</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

