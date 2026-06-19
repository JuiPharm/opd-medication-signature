const Storage = {
  saveSignature: function(base64Data, recordId) {
    // 1. Get root folder
    const rootFolderId = PropertiesService.getScriptProperties().getProperty("SIGNATURE_ROOT_FOLDER_ID");
    if (!rootFolderId) throw new Error("Root folder not configured");
    
    const rootFolder = DriveApp.getFolderById(rootFolderId);
    
    // 2. Navigate/Create YYYY/MM/DD
    const tz = Config.get("TIMEZONE") || "Asia/Bangkok";
    const date = new Date();
    const yyyy = Utilities.formatDate(date, tz, "yyyy");
    const mm = Utilities.formatDate(date, tz, "MM");
    const dd = Utilities.formatDate(date, tz, "dd");
    
    let yearFolder = this.getOrCreateFolder(rootFolder, yyyy);
    let monthFolder = this.getOrCreateFolder(yearFolder, mm);
    let dayFolder = this.getOrCreateFolder(monthFolder, dd);
    
    // 3. Decode base64
    const dataParts = base64Data.split(',');
    let base64 = dataParts.length > 1 ? dataParts[1] : dataParts[0];
    
    const maxBytes = parseInt(Config.get("MAX_SIGNATURE_BYTES") || 1048576, 10);
    if (base64.length * 0.75 > maxBytes) {
      throw new Error("Signature file too large");
    }
    
    const decodedBytes = Utilities.base64Decode(base64);
    const decodedBlob = Utilities.newBlob(decodedBytes, 'image/png', recordId + '.png');
    
    // Calculate SHA256
    const sha256Bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, decodedBytes);
    const sha256Hex = sha256Bytes.map(function(chr){return (chr+256).toString(16).slice(-2)}).join('');
    
    // 4. Save file
    const file = dayFolder.createFile(decodedBlob);
    
    return {
      fileId: file.getId(),
      url: file.getUrl(),
      sha256: sha256Hex
    };
  },
  
  getOrCreateFolder: function(parentFolder, folderName) {
    const folders = parentFolder.getFoldersByName(folderName);
    if (folders.hasNext()) {
      return folders.next();
    }
    return parentFolder.createFolder(folderName);
  }
};
