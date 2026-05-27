const path = require('path');

const rootDir = path.resolve(__dirname, '../..');

const paths = {
  rootDir,
  fontsDir: path.join(rootDir, 'fonts'),
  templatePath: path.join(rootDir, 'templates', 'template.svg'),
  adumuFontPath: path.join(rootDir, 'fonts', 'Adumu.ttf'),
  fontConfigDir: path.join(rootDir, '.fontconfig'),
};

module.exports = {
  paths,
};
