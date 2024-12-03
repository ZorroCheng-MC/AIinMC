// === code.gs ===
function main() {
  try {
    // Validate that all required configuration exists in project settings
    validateConfig();
    
    // Step 1: Get questions
    questionsData = findQuestions();
    if (!questionsData) {
      throw new Error('Questions data not available');
    }

    // Step 2: Create sheet and form
    const sheetId = createSheetInFolder();
    Logger.log(`Created sheet ID: ${sheetId}`);

    const formId = createFormInFolder(sheetId);
    Logger.log(`Created form ID: ${formId}`);

    makeFormPublic(formId);

    // Step 3: Get answers
    answersData = suggestAnswers(questionsData);
    Logger.log('\nQuestions and Answers:');
    answersData.questions.forEach((question, index) => {
      Logger.log(`\nQ${index + 1}: ${question}`);
      Logger.log(`A${index + 1}: ${answersData.answers[index]}`);
    });

    // Step 4: Get form entry IDs and form URL
    const form = FormApp.openById(formId);
    const formUrl = form.getPublishedUrl();
    const entryIds = findEntryIds(formId);
    Logger.log('Found Entry IDs:');
    Logger.log(entryIds);

    // Step 5: Generate prefilled form link
    const prefilledUrl = generatePrefilledLink(formUrl, entryIds, answersData.answers);
    Logger.log('Generated prefilled form URL:');
    Logger.log(prefilledUrl);

    return {
      sheetId: sheetId,
      formId: formId,
      prefilledUrl: prefilledUrl
    };

  } catch (error) {
    Logger.log(`Error in main function: ${error.message}`);
    throw error;
  }
}