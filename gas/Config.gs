let _cachedConfigMap = null;

const Config = {
  _loadAll: function() {
    if (_cachedConfigMap) return _cachedConfigMap;
    
    const cache = CacheService.getScriptCache();
    const cachedString = cache.get("APP_CONFIG_MAP");
    if (cachedString) {
      _cachedConfigMap = JSON.parse(cachedString);
      return _cachedConfigMap;
    }
    
    const sheet = Sheets.get("Config");
    const data = sheet.getDataRange().getValues();
    const map = {};
    for (let i = 1; i < data.length; i++) {
      let val = data[i][1];
      if (val === 'TRUE' || val === true) val = true;
      else if (val === 'FALSE' || val === false) val = false;
      map[data[i][0]] = val;
    }
    _cachedConfigMap = map;
    
    try {
      cache.put("APP_CONFIG_MAP", JSON.stringify(map), 900);
    } catch(e) {}
    
    return _cachedConfigMap;
  },
  get: function(key) {
    const map = this._loadAll();
    return map[key] !== undefined ? map[key] : null;
  },
  getPublic: function() {
    const map = this._loadAll();
    const publicConfig = {};
    const publicKeys = [
      "APP_NAME", "TIMEZONE", "HN_REGEX", 
      "IDLE_TIMEOUT_MINUTES", "STATEMENT_VERSION", 
      "STATEMENT_TEXT", "REQUIRE_PIN", "ALLOW_DUPLICATE_CONFIRM"
    ];
    
    for (let i = 0; i < publicKeys.length; i++) {
      const k = publicKeys[i];
      if (map[k] !== undefined) {
        publicConfig[k] = map[k];
      }
    }
    return publicConfig;
  }
};
