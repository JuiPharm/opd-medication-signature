const Sheets = {
  get: function(name) {
    const sheet = SpreadsheetApp.openById("1n-AVn_ZgDvJWfM7TLw98UvkVMHQ986tKrGAbAMqOyc0").getSheetByName(name);
    if (!sheet) throw new Error("Sheet not found: " + name);
    return sheet;
  },
  appendRow: function(sheetName, rowData) {
    const sheet = this.get(sheetName);
    const sanitizedData = rowData.map(Utils.sanitizeContent);
    sheet.appendRow(sanitizedData);
  },
  findRow: function(sheetName, columnIndex, value) {
    const sheet = this.get(sheetName);
    const data = sheet.getDataRange().getValues();
    // Assuming header is at index 0 (row 1), data starts at index 1
    for (let i = 1; i < data.length; i++) {
      if (data[i][columnIndex] == value) {
        return { rowIndex: i + 1, rowData: data[i] };
      }
    }
    return null;
  },
  updateCell: function(sheetName, rowIndex, columnIndex, value) {
    const sheet = this.get(sheetName);
    sheet.getRange(rowIndex, columnIndex + 1).setValue(Utils.sanitizeContent(value));
  }
};
