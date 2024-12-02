function findEntryIds(formId) {
  try {
    // Get form URL from formId
    const form = FormApp.openById(formId);
    const formUrl = form.getPublishedUrl();
    
    // Fetch the form HTML content
    const response = UrlFetchApp.fetch(formUrl);
    const htmlContent = response.getContentText();
    
    // Find and parse the form data
    const fbDataMatch = htmlContent.match(/FB_PUBLIC_LOAD_DATA_ = (.*?);\s*<\/script>/);
    if (!fbDataMatch) {
      throw new Error('Form data not found in page');
    }
    
    // Parse the form data and extract questions
    const formData = JSON.parse(fbDataMatch[1]);
    const questions = formData[1][1];
    
    // Extract entry IDs
    const entryIds = questions.map(question => {
      if (question[4] && question[4][0]) {
        return 'entry.' + question[4][0][0];
      }
      return null;
    }).filter(id => id !== null);
    
    Logger.log("Found Entry IDs:");
    Logger.log(entryIds);
    
    return entryIds;
    
  } catch (error) {
    Logger.log(`Error in findEntryIds: ${error.message}`);
    throw error;
  }
}