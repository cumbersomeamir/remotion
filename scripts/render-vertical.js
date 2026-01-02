const {execSync} = require('child_process');
const fs = require('fs');
const path = require('path');

function formatTimestamp(d) {
  // YYYYMMDDTHHMMSS (UTC)
  return d
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, '')
    .slice(0, 15);
}

async function sleep(ms) {
  await new Promise((r) => setTimeout(r, ms));
}

async function getUniqueOutputPath({projectRoot, compositionName, orientation}) {
  const outputsDir = path.resolve(projectRoot, 'outputs');
  fs.mkdirSync(outputsDir, {recursive: true});

  for (let i = 0; i < 10; i++) {
    const ts = formatTimestamp(new Date());
    const filename = `${compositionName}_${orientation}_${ts}.mp4`;
    const outputPath = path.resolve(outputsDir, filename);
    if (!fs.existsSync(outputPath)) {
      return outputPath;
    }
    await sleep(1100);
  }

  throw new Error('Could not generate a unique output filename after multiple attempts.');
}

async function main() {
  const [, , compositionName, compositionId] = process.argv;
  if (!compositionName || !compositionId) {
    throw new Error(
      'Usage: node scripts/render-vertical.js <compositionName> <compositionId>'
    );
  }

  const projectRoot = path.resolve(__dirname, '..');
  const orientation = 'vertical';

  const outputPath = await getUniqueOutputPath({
    projectRoot,
    compositionName,
    orientation,
  });

  console.log(`Rendering ${compositionId}`);
  console.log(`Output: ${outputPath}`);

  execSync(`npx remotion render ${compositionId} "${outputPath}" --codec=h264 --fps=30`, {
    cwd: projectRoot,
    stdio: 'inherit',
  });

  if (!fs.existsSync(outputPath)) {
    throw new Error(`Output file not found after render: ${outputPath}`);
  }

  console.log(`✅ Render complete: ${outputPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


