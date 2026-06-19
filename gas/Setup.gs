function setupSystem() {
  const ss = SpreadsheetApp.openById("1n-AVn_ZgDvJWfM7TLw98UvkVMHQ986tKrGAbAMqOyc0");
  
  // 1. Create or verify Sheets
  const sheetsDef = [
    { name: "Staff", headers: ["StaffID", "FullName", "Role", "Active", "PINHash", "UpdatedAt", "Note"] },
    { name: "Transactions", headers: ["RecordID", "HN", "SubmittedAt", "ServiceDate", "StaffID", "StaffName", "ReceiverType", "SignatureFileID", "SignatureLink", "SignatureSHA256", "StatementVersion", "DeviceID", "RequestID", "Status", "VoidReason", "VoidedBy", "VoidedAt", "CreatedAt"] },
    { name: "Sessions", headers: ["SessionID", "TokenHash", "StaffID", "StaffName", "Role", "CreatedAt", "ExpiresAt", "LastSeenAt", "DeviceID", "Active"] },
    { name: "AuditLog", headers: ["LogID", "Timestamp", "Event", "StaffID", "RecordID", "HNMasked", "Result", "Message", "DeviceID", "RequestID"] },
    { name: "Config", headers: ["Key", "Value", "Description"] }
  ];
  
  sheetsDef.forEach(function(def) {
    let sheet = ss.getSheetByName(def.name);
    if (!sheet) {
      sheet = ss.insertSheet(def.name);
      sheet.appendRow(def.headers);
      sheet.getRange(1, 1, 1, def.headers.length).setFontWeight("bold");
      sheet.setFrozenRows(1);
      
      // Formatting
      if (def.name === "Staff") {
        sheet.getRange("A:A").setNumberFormat("@"); // Text format for StaffID
        sheet.getRange("D2:D1000").insertCheckboxes();
      }
      if (def.name === "Transactions") {
        sheet.getRange("B:B").setNumberFormat("@"); // Text format for HN
      }
    } else {
      // Check headers
      const existingHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn() || 1).getValues()[0];
      def.headers.forEach(function(h, index) {
        if (existingHeaders[index] !== h) {
          sheet.getRange(1, index + 1).setValue(h).setFontWeight("bold");
        }
      });
    }
  });
  
  // 2. Populate Default Config
  const configSheet = ss.getSheetByName("Config");
  const configData = [
    ["APP_NAME", "ระบบลงนามรับยา OPD", "ชื่อระบบ"],
    ["TIMEZONE", "Asia/Bangkok", "Timezone ของระบบ"],
    ["HN_REGEX", "^07-[0-9]{2}-[0-9]{6}$", "รูปแบบ HN"],
    ["SESSION_TTL_MINUTES", 480, "อายุเซสชัน (นาที)"],
    ["IDLE_TIMEOUT_MINUTES", 15, "เวลาที่ไม่มีการใช้งานก่อน Auto Logout (นาที)"],
    ["DUPLICATE_WINDOW_HOURS", 24, "เวลาตรวจหารายการซ้ำ (ชั่วโมง)"],
    ["MAX_SIGNATURE_BYTES", 1048576, "ขนาดไฟล์ลายเซ็นสูงสุด (bytes)"],
    ["STATEMENT_VERSION", "RX-ACK-001", "เวอร์ชันข้อความรับรอง"],
    ["STATEMENT_TEXT", "ข้าพเจ้ายืนยันว่าได้รับยาและ/หรือเวชภัณฑ์จากหน่วยจ่ายยาเรียบร้อยแล้ว และได้รับคำแนะนำที่จำเป็นจากเจ้าหน้าที่ ทั้งนี้ ลายมือชื่อนี้ใช้เป็นหลักฐานการรับยาเท่านั้น", "ข้อความรับรอง"],
    ["REQUIRE_PIN", false, "บังคับใช้ PIN หรือไม่"],
    ["ALLOW_DUPLICATE_CONFIRM", true, "อนุญาตให้ยืนยันการรับยาซ้ำหรือไม่"]
  ];
  
  const existingConfig = configSheet.getDataRange().getValues();
  const existingKeys = existingConfig.map(function(row) { return row[0]; });
  
  configData.forEach(function(row) {
    if (existingKeys.indexOf(row[0]) === -1) {
      configSheet.appendRow(row);
    }
  });
  
  // 3. Populate Test Staff
  const staffSheet = ss.getSheetByName("Staff");
  if (staffSheet.getLastRow() === 1) {
    staffSheet.appendRow(["000001", "ภก.ผู้ใช้งานตัวอย่าง", "PHARMACIST", true, "", new Date(), "ตัวอย่าง"]);
  }
  
  // 4. Create Drive Folder
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty("SIGNATURE_ROOT_FOLDER_ID")) {
    const folder = DriveApp.createFolder("OPD Medication Signatures");
    props.setProperty("SIGNATURE_ROOT_FOLDER_ID", folder.getId());
  }
  
  try {
    SpreadsheetApp.getUi().alert("Setup Completed Successfully.");
  } catch(e) {
    // ignore if running from clasp run where UI is not available
  }
}
