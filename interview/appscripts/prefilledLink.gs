function generatePrefilledLink(formUrl, entryIds, answers) {
  try {
    // Validate inputs
    if (!entryIds || !answers) {
      throw new Error('Missing entry IDs or answers');
    }

    // Get base URL - remove any existing parameters
    const baseUrl = formUrl.split('?')[0];
    
    // Create prefilled parameters by combining entry IDs with answers
    const prefilledParams = entryIds
      .map((id, index) => `${id}=${encodeURIComponent(answers[index])}`)
      .join('&');
    
    // Generate the final prefilled URL
    const prefilledUrl = `${baseUrl}?usp=pp_url&${prefilledParams}`;
    
    Logger.log('Generated prefilled URL:');
    Logger.log(prefilledUrl);
    
    return prefilledUrl;
    
  } catch (error) {
    Logger.log(`Error generating prefilled link: ${error.message}`);
    throw error;
  }
}