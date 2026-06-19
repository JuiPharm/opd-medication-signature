const Transactions = {
  checkDuplicate: function(hn, session, requestId) {
    if (!hn) return Router.error("INVALID_INPUT", "กรุณาระบุ HN");
    
    // Config HN Regex check
    const hnRegexStr = Config.get("HN_REGEX") || "^07-[0-9]{2}-[0-9]{6}$";
    const regex = new RegExp(hnRegexStr);
    if (!regex.test(hn)) {
      Audit.log("HN_VALIDATION_FAILED", session.staffId, null, hn, "FAIL", "Invalid HN format", requestId);
      return Router.error("INVALID_INPUT", "รูปแบบ HN ไม่ถูกต้อง");
    }
    
    // Check duplicate in Transactions sheet
    const windowHours = parseInt(Config.get("DUPLICATE_WINDOW_HOURS") || 24, 10);
    const now = new Date();
    const windowStart = new Date(now.getTime() - windowHours * 60 * 60 * 1000);
    
    const sheet = Sheets.get("Transactions");
    const data = sheet.getDataRange().getValues();
    
    // Find duplicates backwards (most recent first)
    // Assume: RecordID(0), HN(1), SubmittedAt(2), ServiceDate(3), StaffID(4) ...
    let duplicate = null;
    for (let i = data.length - 1; i >= 1; i--) {
      const rowHn = data[i][1];
      if (rowHn === hn) {
        const submittedAt = new Date(data[i][2]);
        if (submittedAt >= windowStart) {
          duplicate = {
            recordId: data[i][0],
            submittedAt: data[i][2],
            staffName: data[i][5]
          };
          break; // Found the most recent duplicate in window
        }
      }
    }
    
    if (duplicate) {
      Audit.log("DUPLICATE_FOUND", session.staffId, duplicate.recordId, hn, "SUCCESS", "Duplicate found", requestId);
      return Router.success("DUPLICATE_FOUND", "พบรายการรับยาซ้ำ", duplicate);
    }
    
    return Router.success("SUCCESS", "ไม่พบรายการซ้ำ", null);
  },
  
  submitSignature: function(payload, session, requestId) {
    const lock = LockService.getScriptLock();
    try {
      // Wait for up to 30 seconds for other processes to finish.
      lock.waitLock(30000);
    } catch (e) {
      return Router.error("CONCURRENCY_ERROR", "ระบบไม่ว่าง กรุณาลองใหม่อีกครั้ง");
    }
    
    try {
      // 1. Check Idempotency (has this requestId been processed?)
      const existingReqRow = Sheets.findRow("Transactions", 12, requestId); // RequestID is column 12 (M)
      if (existingReqRow) {
        // Return existing transaction data
        return Router.success("SUCCESS", "บันทึกข้อมูลเรียบร้อยแล้ว (รายการเดิม)", {
          recordId: existingReqRow.rowData[0],
          serverTime: existingReqRow.rowData[2]
        });
      }
      
      const hn = payload.hn;
      const signatureBase64 = payload.signatureBase64;
      const receiverType = payload.receiverType;
      const statementVersion = Config.get("STATEMENT_VERSION");
      const deviceId = payload.deviceId || "";
      const isDuplicateConfirmed = payload.isDuplicateConfirmed;
      
      if (!hn || !signatureBase64 || !receiverType) {
        return Router.error("INVALID_INPUT", "ข้อมูลไม่ครบถ้วน");
      }
      
      Audit.log("SUBMIT_STARTED", session.staffId, null, hn, "SUCCESS", "Submit started", requestId);
      
      if (isDuplicateConfirmed) {
         Audit.log("DUPLICATE_CONFIRMED", session.staffId, null, hn, "SUCCESS", "Staff confirmed duplicate", requestId);
      }
      
      const recordId = Utils.generateRecordId();
      let fileData;
      try {
        fileData = Storage.saveSignature(signatureBase64, recordId);
      } catch (fileErr) {
        Audit.log("SUBMIT_FAILED", session.staffId, recordId, hn, "FAIL", "Save signature failed: " + fileErr.message, requestId);
        return Router.error("FILE_ERROR", "ไม่สามารถบันทึกลายเซ็นได้: " + fileErr.message);
      }
      
      const now = new Date();
      const serviceDate = Utils.getCurrentDatePath().replace(/\//g, '-');
      const signatureLink = `=HYPERLINK("${fileData.url}", "เปิดดูลายเซ็น")`;
      
      // Save to Transactions
      Sheets.appendRow("Transactions", [
        recordId,
        hn,
        now, // SubmittedAt
        serviceDate,
        session.staffId,
        session.staffName,
        receiverType,
        fileData.fileId,
        signatureLink,
        fileData.sha256,
        statementVersion,
        deviceId,
        requestId,
        "COMPLETED",
        "", // VoidReason
        "", // VoidedBy
        "", // VoidedAt
        now // CreatedAt
      ]);
      
      Audit.log("SUBMIT_SUCCESS", session.staffId, recordId, hn, "SUCCESS", "Saved transaction", requestId);
      
      return Router.success("SUCCESS", "บันทึกข้อมูลเรียบร้อยแล้ว", {
        recordId: recordId,
        serverTime: now.toISOString()
      });
      
    } catch (error) {
      Audit.log("SUBMIT_FAILED", session.staffId, null, payload.hn, "FAIL", error.message, requestId);
      throw error;
    } finally {
      lock.releaseLock();
    }
  }
};
