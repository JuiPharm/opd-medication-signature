const Auth = {
  login: function(staffId, pin, deviceId, requestId) {
    if (!staffId) {
      Audit.log("LOGIN_FAILED", staffId, null, null, "FAIL", "Missing Staff ID", requestId);
      return Router.error("INVALID_INPUT", "กรุณาระบุรหัสเจ้าหน้าที่");
    }
    
    // Check staff in sheet
    const staffRow = Sheets.findRow("Staff", 0, staffId); // StaffID is column 0
    if (!staffRow) {
      Audit.log("LOGIN_FAILED", staffId, null, null, "FAIL", "Staff not found", requestId);
      return Router.error("UNAUTHORIZED", "รหัสเจ้าหน้าที่ไม่ถูกต้อง");
    }
    
    const staffData = staffRow.rowData;
    const isActive = staffData[3]; // Column D: Active (Index 3)
    if (isActive !== true && isActive !== "TRUE") {
      Audit.log("LOGIN_FAILED", staffId, null, null, "FAIL", "Staff inactive", requestId);
      return Router.error("UNAUTHORIZED", "บัญชีนี้ถูกระงับการใช้งาน");
    }
    
    const requirePin = Config.get("REQUIRE_PIN");
    if (requirePin === true || requirePin === "TRUE") {
      const pinHash = staffData[4]; // Column E: PINHash (Index 4)
      if (pinHash && pin) {
         const inputHash = Utils.hash(pin);
         if (inputHash !== pinHash) {
           Audit.log("LOGIN_FAILED", staffId, null, null, "FAIL", "Invalid PIN", requestId);
           return Router.error("UNAUTHORIZED", "PIN ไม่ถูกต้อง");
         }
      } else if (pinHash && !pin) {
         return Router.error("UNAUTHORIZED", "กรุณาระบุ PIN");
      }
    }
    
    // Login successful, create session
    const staffName = staffData[1];
    const role = staffData[2];
    const sessionToken = Utils.generateUUID() + "-" + Utils.generateUUID(); // longer token
    const tokenHash = Utils.hash(sessionToken);
    
    const ttlMinutes = Config.get("SESSION_TTL_MINUTES") || 480;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlMinutes * 60000);
    
    const sessionId = Utils.generateUUID();
    
    Sheets.appendRow("Sessions", [
      sessionId,
      tokenHash,
      staffId,
      staffName,
      role,
      now.toISOString(),
      expiresAt.toISOString(),
      now.toISOString(), // LastSeenAt
      deviceId || "",
      true // Active
    ]);
    
    Audit.log("LOGIN_SUCCESS", staffId, null, null, "SUCCESS", "Logged in", requestId);
    
    return Router.success("SUCCESS", "เข้าสู่ระบบสำเร็จ", {
      sessionToken: sessionToken,
      staffName: staffName,
      staffId: staffId
    });
  },
  
  validateSession: function(sessionToken) {
    if (!sessionToken) return { isValid: false };
    
    const tokenHash = Utils.hash(sessionToken);
    const sessionRow = Sheets.findRow("Sessions", 1, tokenHash); // TokenHash is column 1
    
    if (!sessionRow) return { isValid: false };
    
    const sessionData = sessionRow.rowData;
    const isActive = sessionData[9]; // Active is column 9 (J)
    if (isActive !== true && isActive !== "TRUE") return { isValid: false };
    
    const expiresAt = new Date(sessionData[6]);
    if (new Date() > expiresAt) {
      // update active to false
      Sheets.updateCell("Sessions", sessionRow.rowIndex, 9, false);
      Audit.log("SESSION_EXPIRED", sessionData[2], null, null, "FAIL", "Session expired", null);
      return { isValid: false };
    }
    
    // Check if staff is still active
    const staffRow = Sheets.findRow("Staff", 0, sessionData[2]);
    if (!staffRow || (staffRow.rowData[3] !== true && staffRow.rowData[3] !== "TRUE")) {
      return { isValid: false };
    }
    
    // Update last seen
    Sheets.updateCell("Sessions", sessionRow.rowIndex, 7, new Date().toISOString());
    
    return {
      isValid: true,
      sessionId: sessionData[0],
      staffId: sessionData[2],
      staffName: sessionData[3],
      role: sessionData[4]
    };
  },
  
  logout: function(sessionToken, staffId, requestId) {
    const tokenHash = Utils.hash(sessionToken);
    const sessionRow = Sheets.findRow("Sessions", 1, tokenHash);
    if (sessionRow) {
      Sheets.updateCell("Sessions", sessionRow.rowIndex, 9, false);
      Audit.log("LOGOUT", staffId, null, null, "SUCCESS", "Logged out", requestId);
    }
    return Router.success("SUCCESS", "ออกจากระบบสำเร็จ", {});
  }
};
