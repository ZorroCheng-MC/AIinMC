function main() {
  try {
    // Step 1: Get questions
    questionsData = findQuestions();
    if (!questionsData) {
      throw new Error('Questions data not available');
    }

    // Step 2: Create sheet and form
    const sheetId = createSheetInFolder();
    Logger.log(`Created sheet ID: ${sheetId}`);

    // Create and get form
    const formResult = createFormInFolder(sheetId);
    const formId = formResult.formId;
    const form = FormApp.openById(formId);
    
    makeFormPublic(formId);
    
    // Get correct edit URL
    const formEditUrl = "https://docs.google.com/forms/d/" + formId + "/edit";

    // Step 3: Get answers
    answersData = suggestAnswers(questionsData);

    // Step 4: Get form entry IDs and form URL
    const formUrl = form.getPublishedUrl();
    const entryIds = findEntryIds(formId);
    
    // Step 5: Generate prefilled form link
    const prefilledUrl = generatePrefilledLink(formUrl, entryIds, answersData.answers);

    return {
      sheetId: sheetId,
      formId: formId,
      formEditUrl: formEditUrl,      // 返回正确格式的编辑器 URL
      formUrl: formUrl,              // 发布的表单 URL
      prefilledUrl: prefilledUrl,
      sheetUrl: DriveApp.getFileById(sheetId).getUrl()
    };

  } catch (error) {
    Logger.log(`Error in main function: ${error.message}`);
    throw error;
  }
}