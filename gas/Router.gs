const Router = {
  handleRequest: function(request) {
    const action = request.action;
    const payload = request.payload || {};
    const requestId = request.requestId;
    const sessionToken = request.sessionToken;
    
    if (!action || !requestId) {
      throw new Error("Missing action or requestId");
    }
    
    // Unprotected actions
    if (action === "health") {
      return this.success("SUCCESS", "ระบบทำงานปกติ", {});
    }
    if (action === "getPublicConfig") {
      return this.success("SUCCESS", "โหลดการตั้งค่าสำเร็จ", Config.getPublic());
    }
    if (action === "login") {
      return Auth.login(payload.staffId, payload.pin, payload.deviceId, requestId);
    }
    
    // Protected actions
    const session = Auth.validateSession(sessionToken);
    if (!session.isValid) {
      return this.error("UNAUTHORIZED", "เซสชันหมดอายุหรือไม่ถูกต้อง โปรดเข้าสู่ระบบใหม่");
    }
    
    switch (action) {
      case "validateSession":
        return this.success("SUCCESS", "เซสชันถูกต้อง", { staffName: session.staffName, staffId: session.staffId });
      case "checkDuplicate":
        return Transactions.checkDuplicate(payload.hn, session, requestId);
      case "submitSignature":
        return Transactions.submitSignature(payload, session, requestId);
      case "logout":
        return Auth.logout(sessionToken, session.staffId, requestId);
      default:
        throw new Error("Unknown action: " + action);
    }
  },
  
  success: function(code, message, data) {
    return {
      ok: true,
      code: code,
      message: message,
      serverTime: new Date().toISOString(),
      data: data || {}
    };
  },
  
  error: function(code, message) {
    return {
      ok: false,
      code: code,
      message: message,
      serverTime: new Date().toISOString(),
      data: {}
    };
  }
};
