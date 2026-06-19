let _cachedSs = null;
let _cachedSheets = {};

const Sheets = {
  _getSs: function() {
    if (!_cachedSs) {
      _cachedSs = SpreadsheetApp.openById("1n-AVn_ZgDvJWfM7TLw98UvkVMHQ986tKrGAbAMqOyc0");
    }
    return _cachedSs;
  },
  get: function(name) {
    if (!_cachedSheets[name]) {
      const sheet = this._getSs().getSheetByName(name);
      if (!sheet) throw new Error("Sheet not found: " + name);
      _cachedSheets[name] = sheet;
    }
    return _cachedSheets[name];
  },
  appendRow: function(sheetName, rowData) {
    const sheet = this.get(sheetName);
    const sanitizedData = rowData.map(Utils.sanitizeContent);
    sheet.appendRow(sanitizedData);
  },
  appendRows: function(sheetName, rowsData) {
    if (!rowsData || rowsData.length === 0) return;
    const sheet = this.get(sheetName);
    const sanitizedRows = rowsData.map(row => row.map(Utils.sanitizeContent));
    const startRow = sheet.getLastRow() + 1;
    sheet.getRange(startRow, 1, sanitizedRows.length, sanitizedRows[0].length).setValues(sanitizedRows);
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
