const Audit = {
  log: function(event, staffId, recordId, hn, result, message, requestId) {
    const maskedHn = Utils.maskHN(hn);
    try {
      Sheets.appendRow("AuditLog", [
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
    } catch (e) {
      console.error("Audit Logging Failed: " + e.message);
    }
  }
};
