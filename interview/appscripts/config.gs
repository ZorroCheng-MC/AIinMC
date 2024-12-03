// === config.gs ===

// Configuration keys
const CONFIG_KEYS = {
  TEMPLATE_SHEET_ID: 'TEMPLATE_SHEET_ID',
  QUESTIONS_DOC_ID: 'QUESTIONS_DOC_ID',
  TARGET_FOLDER_ID: 'TARGET_FOLDER_ID',
  QUESTIONS_SHEET_NAME: 'QUESTIONS_SHEET_NAME',
  FORM_TITLE: 'FORM_TITLE',
  GEMINI_API_KEY: 'GEMINI_API_KEY'
};

// Get all configuration values
function getConfig() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const properties = scriptProperties.getProperties();
  
  return {
    TEMPLATE_SHEET_ID: properties[CONFIG_KEYS.TEMPLATE_SHEET_ID],
    QUESTIONS_DOC_ID: properties[CONFIG_KEYS.QUESTIONS_DOC_ID],
    TARGET_FOLDER_ID: properties[CONFIG_KEYS.TARGET_FOLDER_ID],
    QUESTIONS_SHEET_NAME: properties[CONFIG_KEYS.QUESTIONS_SHEET_NAME] || 'Form Questions',
    FORM_TITLE: properties[CONFIG_KEYS.FORM_TITLE] || 'Interview Questions Form',
    GEMINI_API_KEY: properties[CONFIG_KEYS.GEMINI_API_KEY]
  };
}

// Set configuration values
function setConfig(config) {
  const scriptProperties = PropertiesService.getScriptProperties();
  
  // Set each property if provided
  if (config.TEMPLATE_SHEET_ID) scriptProperties.setProperty(CONFIG_KEYS.TEMPLATE_SHEET_ID, config.TEMPLATE_SHEET_ID);
  if (config.QUESTIONS_DOC_ID) scriptProperties.setProperty(CONFIG_KEYS.QUESTIONS_DOC_ID, config.QUESTIONS_DOC_ID);
  if (config.TARGET_FOLDER_ID) scriptProperties.setProperty(CONFIG_KEYS.TARGET_FOLDER_ID, config.TARGET_FOLDER_ID);
  if (config.QUESTIONS_SHEET_NAME) scriptProperties.setProperty(CONFIG_KEYS.QUESTIONS_SHEET_NAME, config.QUESTIONS_SHEET_NAME);
  if (config.FORM_TITLE) scriptProperties.setProperty(CONFIG_KEYS.FORM_TITLE, config.FORM_TITLE);
  if (config.GEMINI_API_KEY) scriptProperties.setProperty(CONFIG_KEYS.GEMINI_API_KEY, config.GEMINI_API_KEY);
}

// Initialize default configuration
function initializeConfig() {
  const defaultConfig = {
    QUESTIONS_SHEET_NAME: 'Form Questions',
    FORM_TITLE: 'Interview Questions Form'
  };
  
  const scriptProperties = PropertiesService.getScriptProperties();
  const existingProperties = scriptProperties.getProperties();
  
  // Only set defaults for properties that don't exist
  Object.entries(defaultConfig).forEach(([key, value]) => {
    if (!existingProperties[CONFIG_KEYS[key]]) {
      scriptProperties.setProperty(CONFIG_KEYS[key], value);
    }
  });
}

// Reset all configuration values
function resetConfig() {
  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.deleteAllProperties();
  initializeConfig();
}

// Utility function for timestamp
function getTimestampSuffix() {
  const now = new Date();
  return Utilities.formatDate(now, 'GMT+8', 'yyyyMMdd_HHmmss');
}

// Validate configuration
function validateConfig() {
  const config = getConfig();
  const requiredKeys = ['TEMPLATE_SHEET_ID', 'QUESTIONS_DOC_ID', 'TARGET_FOLDER_ID', 'GEMINI_API_KEY'];
  const missingKeys = [];
  
  requiredKeys.forEach(key => {
    if (!config[key]) {
      missingKeys.push(key);
    }
  });
  
  if (missingKeys.length > 0) {
    throw new Error(`Missing required configuration values: ${missingKeys.join(', ')}`);
  }
  
  return true;
}