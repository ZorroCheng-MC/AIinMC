// === findQuestions.gs ===
function findQuestions() {
  try {
    const config = getConfig(); // Get configuration from project settings
    const questionsDoc = DocumentApp.openById(config.QUESTIONS_DOC_ID);
    const questions = questionsDoc.getBody().getText().split('\n')
                     .filter(q => q.trim())  // Remove empty lines
                     .map(q => q.trim());    // Clean up whitespace
    
    if (questions.length === 0) {
      throw new Error('No questions found in the source document');
    }

    Logger.log(`Processed ${questions.length} questions successfully`);
    return questions;
  } catch (error) {
    Logger.log(`Error finding questions: ${error.message}`);
    throw error;
  }
}