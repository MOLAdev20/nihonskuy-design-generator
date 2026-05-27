const fs = require('fs');
const opentype = require('opentype.js');
const { paths } = require('../config/paths');

function loadFontFromFile(fontPath) {
  if (!fs.existsSync(fontPath)) {
    return null;
  }

  const fontBuffer = fs.readFileSync(fontPath);
  const arrayBuffer = fontBuffer.buffer.slice(
    fontBuffer.byteOffset,
    fontBuffer.byteOffset + fontBuffer.byteLength
  );

  return opentype.parse(arrayBuffer);
}

const adumuFont = loadFontFromFile(paths.adumuFontPath);

function serializePathCommands(commands) {
  return commands.map((command) => {
    switch (command.type) {
      case 'M':
      case 'L':
        return `${command.type}${command.x.toFixed(2)} ${command.y.toFixed(2)}`;
      case 'C':
        return `${command.type}${command.x1.toFixed(2)} ${command.y1.toFixed(2)} ${command.x2.toFixed(2)} ${command.y2.toFixed(2)} ${command.x.toFixed(2)} ${command.y.toFixed(2)}`;
      case 'Q':
        return `${command.type}${command.x1.toFixed(2)} ${command.y1.toFixed(2)} ${command.x.toFixed(2)} ${command.y.toFixed(2)}`;
      case 'Z':
        return 'Z';
      default:
        return '';
    }
  }).join('');
}

function buildAdumuTextElement(text, x, y, fontSize, fill) {
  if (!adumuFont) {
    return `<text x="${x}" y="${y}" font-family="'Adumu', sans-serif" font-size="${fontSize}" font-weight="400" fill="${fill}">${text}</text>`;
  }

  const commands = adumuFont.getPath(String(text), x, y, fontSize).commands;
  const pathData = serializePathCommands(commands);

  return `<path d="${pathData}" fill="${fill}" />`;
}

function hasAdumuFont() {
  return Boolean(adumuFont);
}

module.exports = {
  buildAdumuTextElement,
  hasAdumuFont,
};
