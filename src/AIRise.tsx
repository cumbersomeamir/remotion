import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  Easing,
} from 'remotion';

interface DataPoint {
  year: number;
  value: number;
  label: string;
}

export const AIRise: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  const timelineData: DataPoint[] = [
    { year: 1950, value: 0.1, label: 'Birth' },
    { year: 1980, value: 0.3, label: 'Expert Systems' },
    { year: 2000, value: 0.5, label: 'Machine Learning' },
    { year: 2010, value: 0.7, label: 'Deep Learning' },
    { year: 2020, value: 0.9, label: 'GPT Era' },
    { year: 2024, value: 1.0, label: 'AGI Dawn' },
  ];

  const graphProgress = interpolate(
    frame,
    [60, durationInFrames - 60],
    [0, 1],
    { 
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.exp),
    }
  );

  const titleOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const networkScale = spring({
    frame: Math.max(0, frame - 30),
    fps,
    config: { damping: 100, stiffness: 50 },
    from: 0,
    to: 1,
  });

  const graphArea = {
    x: width * 0.1,
    y: height * 0.3,
    width: width * 0.8,
    height: height * 0.5,
  };

  const maxValue = Math.max(...timelineData.map(d => d.value));
  const minYear = Math.min(...timelineData.map(d => d.year));
  const maxYear = Math.max(...timelineData.map(d => d.year));

  const getPoint = (dataPoint: DataPoint, index: number) => {
    const x = graphArea.x + 
      ((dataPoint.year - minYear) / (maxYear - minYear)) * graphArea.width;
    const y = graphArea.y + graphArea.height - 
      (dataPoint.value / maxValue) * graphArea.height;
    return { x, y, index };
  };

  const points = timelineData.map(getPoint);

  const currentPointIndex = Math.floor(graphProgress * (points.length - 1));
  const currentPoint = points[Math.min(currentPointIndex, points.length - 1)];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0a0a1a',
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
            background: 'linear-gradient(90deg, #00ff88, #00d4ff, #7b2ff7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
            textShadow: '0 0 30px rgba(0, 255, 136, 0.5)',
          }}
        >
          The Rise of Artificial Intelligence
        </h1>
      </div>

      <svg width={width} height={height} style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00ff88" stopOpacity="1" />
            <stop offset="50%" stopColor="#00d4ff" stopOpacity="1" />
            <stop offset="100%" stopColor="#7b2ff7" stopOpacity="1" />
          </linearGradient>
          <radialGradient id="pointGradient">
            <stop offset="0%" stopColor="#00ff88" stopOpacity="1" />
            <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.5" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g opacity={networkScale}>
          {Array.from({ length: 3 }).map((_, layerIdx) => {
            const layerY = height * 0.15 + layerIdx * 40;
            const nodeCount = 8 - layerIdx * 2;
            const nodeSpacing = width / (nodeCount + 1);

            return (
              <g key={layerIdx}>
                {Array.from({ length: nodeCount }).map((_, nodeIdx) => {
                  const nodeX = nodeSpacing * (nodeIdx + 1);
                  const pulse = Math.sin((frame * 0.1 + nodeIdx + layerIdx) % (Math.PI * 2)) * 0.3 + 0.7;
                  
                  return (
                    <g key={nodeIdx}>
                      {layerIdx < 2 && Array.from({ length: 6 - layerIdx * 2 }).map((_, connIdx) => {
                        const nextLayerY = height * 0.15 + (layerIdx + 1) * 40;
                        const nextNodeCount = 6 - layerIdx * 2;
                        const nextNodeSpacing = width / (nextNodeCount + 1);
                        const nextNodeX = nextNodeSpacing * (connIdx + 1);
                        
                        return (
                          <line
                            key={connIdx}
                            x1={nodeX}
                            y1={layerY}
                            x2={nextNodeX}
                            y2={nextLayerY}
                            stroke="rgba(0, 212, 255, 0.1)"
                            strokeWidth={1}
                          />
                        );
                      })}
                      <circle
                        cx={nodeX}
                        cy={layerY}
                        r={8 * pulse}
                        fill="url(#pointGradient)"
                        filter="url(#glow)"
                        opacity={0.8}
                      />
                    </g>
                  );
                })}
              </g>
            );
          })}
        </g>

        <g opacity={graphProgress}>
          <rect
            x={graphArea.x}
            y={graphArea.y}
            width={graphArea.width}
            height={graphArea.height}
            fill="none"
            stroke="rgba(0, 212, 255, 0.2)"
            strokeWidth={2}
          />

          {points.slice(0, currentPointIndex + 1).map((point, idx) => {
            if (idx === 0) return null;
            const prevPoint = points[idx - 1];
            return (
              <line
                key={idx}
                x1={prevPoint.x}
                y1={prevPoint.y}
                x2={point.x}
                y2={point.y}
                stroke="url(#lineGradient)"
                strokeWidth={4}
              />
            );
          })}

          {points.slice(0, currentPointIndex + 1).map((point, idx) => {
            const dataPoint = timelineData[idx];
            const isActive = idx === currentPointIndex;
            const scale = isActive ? 1.5 : 1;
            
            return (
              <g key={idx}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={12 * scale}
                  fill="url(#pointGradient)"
                  filter="url(#glow)"
                  opacity={0.9}
                />
                {isActive && (
                  <text
                    x={point.x}
                    y={point.y - 30}
                    textAnchor="middle"
                    fill="#00ff88"
                    fontSize={20}
                    fontWeight="bold"
                  >
                    {dataPoint.label}
                  </text>
                )}
              </g>
            );
          })}
        </g>
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
        <div style={{ textAlign: 'center', color: '#00ff88' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold' }}>1950s</div>
          <div style={{ fontSize: 14, opacity: 0.7 }}>Beginnings</div>
        </div>
        <div style={{ textAlign: 'center', color: '#00d4ff' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold' }}>2000s</div>
          <div style={{ fontSize: 14, opacity: 0.7 }}>Acceleration</div>
        </div>
        <div style={{ textAlign: 'center', color: '#7b2ff7' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold' }}>2020s</div>
          <div style={{ fontSize: 14, opacity: 0.7 }}>Revolution</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

