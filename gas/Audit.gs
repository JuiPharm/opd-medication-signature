let _auditBuffer = [];

const Audit = {
  log: function(event, staffId, recordId, hn, result, message, requestId) {
    const maskedHn = Utils.maskHN(hn);
    _auditBuffer.push([
      Utils.generateUUID(),
      Utils.getServerTime(),
      event,
      staffId || "",
      recordId || "",
      maskedHn || "",
      result,
      message || "",
      "", // DeviceID (placeholder for future)
      requestId || ""
    ]);
  },
  flush: function() {
    if (_auditBuffer.length > 0) {
      try {
        Sheets.appendRows("AuditLog", _auditBuffer);
        _auditBuffer = [];
      } catch (e) {
        console.error("Audit Logging Failed: " + e.message);
      }
    }
  }
};
