function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    ok: true,
    message: "Service is running",
    serverTime: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("Invalid request payload");
    }
    const request = JSON.parse(e.postData.contents);
    const response = Router.handleRequest(request);
    
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    const errorResponse = {
      ok: false,
      code: "ERROR",
      message: "เกิดข้อผิดพลาดในการประมวลผล โปรดลองใหม่อีกครั้ง",
      serverTime: new Date().toISOString()
    };
    try {
      Audit.log("SYSTEM_ERROR", "SYSTEM", null, null, "Failed: " + error.message, null, null);
    } catch(err) {
      console.error("Audit log failed during error handler:", err);
    }
    
    return ContentService.createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
