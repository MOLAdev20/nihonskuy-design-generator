const fs = require('fs');
const path = require('path');
const { paths } = require('./paths');

let initialized = false;

function ensureLocalFontConfig() {
  if (initialized) return;

  const cacheDir = path.join(paths.fontConfigDir, 'cache');
  const configFile = path.join(paths.fontConfigDir, 'fonts.conf');

  fs.mkdirSync(cacheDir, { recursive: true });

  const fontConfigXml = `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>${paths.fontsDir}</dir>
  <cachedir>${cacheDir}</cachedir>
</fontconfig>
`;

  fs.writeFileSync(configFile, fontConfigXml);
  process.env.FONTCONFIG_FILE = configFile;
  process.env.FONTCONFIG_PATH = paths.fontConfigDir;
  initialized = true;
}

module.exports = {
  ensureLocalFontConfig,
};
