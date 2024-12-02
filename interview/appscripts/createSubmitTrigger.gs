
// === createFormSubmissionTrigger.gs ===
function setupFormSubmissionTrigger(spreadsheetId, formId) {
  try {
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const triggers = ScriptApp.getUserTriggers(spreadsheet);
    
    const formTriggerExists = triggers.some(trigger => 
      trigger.getEventType() === ScriptApp.EventType.ON_FORM_SUBMIT
    );

    if (!formTriggerExists) {
      const trigger = ScriptApp.newTrigger('onFormSubmit')
        .forSpreadsheet(spreadsheet)
        .onFormSubmit()
        .create();
      Logger.log(`Created form submission trigger in spreadsheet ${spreadsheetId}`);
    }

    return true;
  } catch (error) {
    Logger.log(`Error setting up form trigger: ${error.message}`);
    throw error;
  }
}
