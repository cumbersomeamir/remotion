#!/bin/bash
compositions=(
  "neural-network-training"
  "backpropagation"
  "data-flow-layers"
  "pattern-recognition"
  "ai-learning-mistakes"
  "big-bang"
  "galaxy-formation"
  "supernova"
  "neutron-star"
  "black-hole-merger"
  "gravitational-waves"
  "event-horizon"
  "time-dilation"
  "star-system"
  "accretion-disk"
  "atomic-bonding"
  "dna-replication"
  "protein-folding"
  "mitosis"
  "evolution"
  "human-civilization"
  "megacities"
  "internet-network"
  "data-centers"
  "financial-markets"
  "climate-feedback"
  "agi-emergence"
  "recursive-ai"
  "human-ai-symbiosis"
  "digital-consciousness"
)

for comp in "${compositions[@]}"; do
  filename=$(echo $comp | tr '-' '_')
  cat > "scripts/render-${comp}.js" << SCRIPT
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const now = new Date();
const timestamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '').slice(0, 15);
const compositionId = '${comp}';
const outputPath = path.join(__dirname, '..', 'outputs', \`${filename}_\${timestamp}.mp4\`);

console.log(\`Rendering \${compositionId} to: \${outputPath}\`);

try {
  execSync(
    \`npx remotion render \${compositionId} "\${outputPath}" --codec=h264 --fps=30\`,
    {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
    }
  );

  if (fs.existsSync(outputPath)) {
    console.log(\`✅ Render complete: \${outputPath}\`);
  } else {
    throw new Error(\`❌ Output file not found: \${outputPath}\`);
  }
} catch (err) {
  console.error(err);
  process.exit(1);
}
SCRIPT
done
