function createFormInFolder(sheetId) {
  try {
    // Get target folder
    const targetFolder = DriveApp.getFolderById(CONFIG.TARGET_FOLDER_ID);
    
    // Create form directly in target folder
    const form = FormApp.create(CONFIG.FORM_TITLE);
    const formId = form.getId();
    const formFile = DriveApp.getFileById(formId);
    
    // Move to target folder and remove from root
    targetFolder.addFile(formFile);
    DriveApp.getRootFolder().removeFile(formFile);
    Logger.log(`Created form in target folder: ${formId}`);

    // Add questions to form using stored questionsData
    if (questionsData && questionsData.length > 0) {
      questionsData.forEach(question => {
        if (question.trim()) {
          form.addParagraphTextItem().setTitle(question).setRequired(true);
        }
      });
    }

    // Set form destination
    form.setDestination(FormApp.DestinationType.SPREADSHEET, sheetId);
    Logger.log(`Form linked to spreadsheet: ${sheetId}`);

    // Get the correct form edit URL
    const formEditUrl = form.getEditUrl(); // 使用 getEditUrl() 方法获取正确的编辑器 URL
    Logger.log(`Form edit URL: ${formEditUrl}`);
    
    return {
      formId: formId,
      formEditUrl: formEditUrl
    };
  } catch (error) {
    Logger.log(`Error in createFormInFolder: ${error.message}`);
    throw error;
  }
}