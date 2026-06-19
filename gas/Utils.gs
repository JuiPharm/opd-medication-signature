const Utils = {
  hash: function(text) {
    if (!text) return null;
    const signature = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text, Utilities.Charset.UTF_8);
    return signature.map(function(chr){return (chr+256).toString(16).slice(-2)}).join('');
  },
  generateUUID: function() {
    return Utilities.getUuid();
  },
  generateRecordId: function() {
    const tz = Config.get("TIMEZONE") || "Asia/Bangkok";
    const dateStr = Utilities.formatDate(new Date(), tz, "yyyyMMdd");
    const hex = Math.floor(Math.random() * 16777215).toString(16).toUpperCase().padStart(6, '0');
    return `RX-${dateStr}-${hex}`;
  },
  getCurrentDatePath: function() {
    const tz = Config.get("TIMEZONE") || "Asia/Bangkok";
    return Utilities.formatDate(new Date(), tz, "yyyy/MM/dd");
  },
  getServerTime: function() {
    return new Date().toISOString();
  },
  maskHN: function(hn) {
    if (!hn || hn.length < 4) return "****";
    return hn.slice(0, hn.length - 4).replace(/./g, '*') + hn.slice(-4);
  },
  // Ensure formula injection is prevented
  sanitizeContent: function(content) {
    if (typeof content !== 'string') return content;
    if (content.match(/^[=+\-@]/)) {
      return "'" + content;
    }
    return content;
  }
};
