const Config = {
  get: function(key) {
    const sheet = Sheets.get("Config");
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === key) return data[i][1];
    }
    return null;
  },
  getPublic: function() {
    const sheet = Sheets.get("Config");
    const data = sheet.getDataRange().getValues();
    const publicConfig = {};
    const publicKeys = [
      "APP_NAME", "TIMEZONE", "HN_REGEX", 
      "IDLE_TIMEOUT_MINUTES", "STATEMENT_VERSION", 
      "STATEMENT_TEXT", "REQUIRE_PIN", "ALLOW_DUPLICATE_CONFIRM"
    ];
    
    for (let i = 1; i < data.length; i++) {
      if (publicKeys.includes(data[i][0])) {
        // Convert string TRUE/FALSE to boolean for flags
        let val = data[i][1];
        if (val === 'TRUE' || val === true) val = true;
        else if (val === 'FALSE' || val === false) val = false;
        publicConfig[data[i][0]] = val;
      }
    }
    return publicConfig;
  }
};
