
// === createSheet.gs ===
function createSheetInFolder() {
  try {
    // Get target folder
    const targetFolder = DriveApp.getFolderById(CONFIG.TARGET_FOLDER_ID);
    
    // Create copy of template in target folder directly
    const templateFile = DriveApp.getFileById(CONFIG.TEMPLATE_SHEET_ID);
    const clonedFile = templateFile.makeCopy(targetFolder);
    const clonedSheetId = clonedFile.getId();
    
    // Open the cloned spreadsheet
    const spreadsheet = SpreadsheetApp.openById(clonedSheetId);
    
    // Check if Form Questions sheet exists, if not create it
    let sheet = spreadsheet.getSheetByName(CONFIG.QUESTIONS_SHEET_NAME);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(CONFIG.QUESTIONS_SHEET_NAME);
      Logger.log(`Created new sheet: ${CONFIG.QUESTIONS_SHEET_NAME}`);
    }

    // Clear any existing content
    sheet.clear();
    
    // Write questions to the sheet using stored questionsData
    if (questionsData && questionsData.length > 0) {
      sheet.getRange(1, 1, 1, questionsData.length).setValues([questionsData]);
      Logger.log(`Added ${questionsData.length} questions to the sheet`);
    }

    return clonedSheetId;
  } catch (error) {
    Logger.log(`Error: ${error.message}`);
    throw error;
  }
}
