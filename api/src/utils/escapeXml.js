function escapeXml(unsafe) {
  if (!unsafe) return '';

  return String(unsafe).replace(/[<>&'"]/g, function replaceXmlChar(char) {
    switch (char) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return char;
    }
  });
}

module.exports = {
  escapeXml,
};
