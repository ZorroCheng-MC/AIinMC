function findEntryIds(formId) {
  const formUrl = `https://docs.google.com/forms/d/${formId}/viewform`;
  const maxRetries = 3;
  const delay = 500; // milliseconds

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Fetch the form HTML content with error handling
      const response = UrlFetchApp.fetch(formUrl, { muteHttpExceptions: true });
      const responseCode = response.getResponseCode();

      if (responseCode === 200) {
        const htmlContent = response.getContentText();

        // Extract form data
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
      } else {
        Logger.log(`Attempt ${attempt}: Received HTTP ${responseCode}`);
        if (attempt === maxRetries) {
          throw new Error(`Failed to fetch form after ${maxRetries} attempts. HTTP ${responseCode}`);
        }
      }
    } catch (error) {
      Logger.log(`Attempt ${attempt}: Error in findEntryIds: ${error.message}`);
      if (attempt === maxRetries) {
        throw error;
      }
    }
    // Wait before retrying
    Utilities.sleep(delay);
  }
}
