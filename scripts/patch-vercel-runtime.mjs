import fs from 'fs';
import path from 'path';

const configPath = '.vercel/output/functions/render.func/.vc-config.json';

try {
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    config.runtime = 'nodejs24.x';
    fs.writeFileSync(configPath, JSON.stringify(config, null, '\t'));
    console.log('✓ Patched .vc-config.json to use nodejs24.x');
  }
} catch (error) {
  console.error('Error patching vercel runtime:', error.message);
  process.exit(1);
}
