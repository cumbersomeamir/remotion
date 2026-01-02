const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const now = new Date();
const timestamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '').slice(0, 15);
const compositionId = 'neural-network-training';
const outputPath = path.join(__dirname, '..', 'outputs', `neural_network_training_${timestamp}.mp4`);

console.log(`Rendering ${compositionId} to: ${outputPath}`);

try {
  execSync(
    `npx remotion render ${compositionId} "${outputPath}" --codec=h264 --fps=30`,
    {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
    }
  );

  if (fs.existsSync(outputPath)) {
    console.log(`✅ Render complete: ${outputPath}`);
  } else {
    throw new Error(`❌ Output file not found: ${outputPath}`);
  }
} catch (err) {
  console.error(err);
  process.exit(1);
}
