export const kpiData = {
  revenue: 1250000,
  users: 45230,
  growth: 23.5,
  retention: 87.2,
};

export const barRaceData = [
  { name: 'Product A', value: 450 },
  { name: 'Product B', value: 320 },
  { name: 'Product C', value: 280 },
  { name: 'Product D', value: 195 },
  { name: 'Product E', value: 150 },
];

export const waveformData = Array.from({ length: 100 }, () => Math.random() * 0.8 + 0.1);

export const story = {
  evolutionStages: [
    { key: 'cell', label: 'Single cell', color: '#00D4FF' },
    { key: 'multi', label: 'Multicellular', color: '#00FF88' },
    { key: 'ocean', label: 'Ocean life', color: '#FFD400' },
    { key: 'land', label: 'Land life', color: '#FF7A00' },
    { key: 'mammal', label: 'Mammals', color: '#FF2DAA' },
  ],
  civilizationStages: [
    { year: '10,000 BCE', label: 'Agriculture' },
    { year: '3,000 BCE', label: 'Cities' },
    { year: '1760', label: 'Industry' },
    { year: '1990', label: 'Internet' },
    { year: 'Now', label: 'AI era' },
  ],
  marketKeyframes: [
    { t: 0.0, price: 100, vol: 0.2 },
    { t: 0.2, price: 108, vol: 0.35 },
    { t: 0.35, price: 102, vol: 0.55 },
    { t: 0.55, price: 118, vol: 0.25 },
    { t: 0.75, price: 112, vol: 0.65 },
    { t: 1.0, price: 126, vol: 0.3 },
  ],
};

