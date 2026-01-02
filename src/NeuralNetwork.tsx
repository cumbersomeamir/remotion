import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
} from 'remotion';
import { colors } from './colors';

interface Neuron {
  x: number;
  y: number;
  layer: number;
  activation: number;
}

interface Connection {
  from: number;
  to: number;
  weight: number;
  nodeIndex?: number;
}

export const NeuralNetwork: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  const layers = [4, 6, 5, 3];
  const layerSpacing = width / (layers.length + 1);

  const neurons = useMemo(() => {
    const nodes: Neuron[] = [];
    layers.forEach((count, layerIndex) => {
      const ySpacing = height / (count + 1);
      for (let i = 0; i < count; i++) {
        nodes.push({
          x: layerSpacing * (layerIndex + 1),
          y: ySpacing * (i + 1),
          layer: layerIndex,
          activation: Math.random(),
        });
      }
    });
    return nodes;
  }, []);

  const connections = useMemo(() => {
    const conns: Connection[] = [];
    let nodeIndex = 0;
    for (let l = 0; l < layers.length - 1; l++) {
      const currentLayerCount = layers[l];
      const nextLayerCount = layers[l + 1];
      const currentStart = nodeIndex;
      const nextStart = nodeIndex + currentLayerCount;

      for (let i = 0; i < currentLayerCount; i++) {
        for (let j = 0; j < nextLayerCount; j++) {
          conns.push({
            from: currentStart + i,
            to: nextStart + j,
            weight: Math.random() * 2 - 1,
          });
        }
      }
      nodeIndex += currentLayerCount;
    }
    return conns;
  }, []);

  const titleOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const networkScale = spring({
    frame,
    fps,
    config: { damping: 200, stiffness: 200 },
    from: 0,
    to: 1,
  });

  const dataFlowProgress = interpolate(
    frame,
    [60, durationInFrames - 30],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0a0e27',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
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
        }}
      >
        <h1
          style={{
            fontSize: 64,
            fontFamily: 'system-ui, sans-serif',
            fontWeight: 'bold',
            color: '#00d4ff',
            margin: 0,
            textShadow: '0 0 20px rgba(0, 212, 255, 0.5)',
          }}
        >
          How Neural Networks Work
        </h1>
      </div>

      <svg
        width={width}
        height={height - 200}
        style={{
          transform: `scale(${networkScale})`,
          transformOrigin: 'center',
        }}
      >
        <defs>
          <linearGradient id="neuronGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#7b2ff7" stopOpacity="0.8" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {connections.map((conn, idx) => {
          const fromNode = neurons[conn.from];
          const toNode = neurons[conn.to];
          if (!fromNode || !toNode) return null;

          const connectionProgress = Math.max(
            0,
            Math.min(1, dataFlowProgress * layers.length - conn.from / neurons.length)
          );

          const pulse = Math.sin((frame * 0.1 + idx * 0.1) % (Math.PI * 2)) * 0.5 + 0.5;
          const opacity = 0.2 + pulse * 0.3;
          const strokeWidth = Math.abs(conn.weight) * 2;

          return (
            <line
              key={idx}
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              stroke={
                connectionProgress > 0.1 && connectionProgress < 0.9
                  ? '#00ff88'
                  : `rgba(0, 212, 255, ${opacity})`
              }
              strokeWidth={strokeWidth}
              opacity={opacity}
            />
          );
        })}

        {neurons.map((neuron, idx) => {
          const activationPulse = Math.sin((frame * 0.2 + idx * 0.3) % (Math.PI * 2)) * 0.3 + 0.7;
          const radius = 15 + activationPulse * 5;
          const isActive = dataFlowProgress > idx / neurons.length - 0.1 && 
                          dataFlowProgress < idx / neurons.length + 0.3;

          return (
            <g key={idx}>
              <circle
                cx={neuron.x}
                cy={neuron.y}
                r={radius}
                fill={isActive ? '#00ff88' : 'url(#neuronGradient)'}
                filter="url(#glow)"
                opacity={0.9}
              />
              <circle
                cx={neuron.x}
                cy={neuron.y}
                r={radius * 0.6}
                fill="#ffffff"
                opacity={0.3}
              />
            </g>
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
        }}
      >
        <div style={{ textAlign: 'center', color: '#00d4ff' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold' }}>Input</div>
          <div style={{ fontSize: 14, opacity: 0.7 }}>Data</div>
        </div>
        <div style={{ textAlign: 'center', color: '#7b2ff7' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold' }}>Hidden</div>
          <div style={{ fontSize: 14, opacity: 0.7 }}>Processing</div>
        </div>
        <div style={{ textAlign: 'center', color: '#00ff88' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold' }}>Output</div>
          <div style={{ fontSize: 14, opacity: 0.7 }}>Result</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

