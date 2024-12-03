# appsscript

```
{
  "timeZone": "Asia/Hong_Kong",
  "dependencies": {
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
```

---

# Code

```javascript
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
```

---

# config

```javascript
// === config.gs ===

// Configuration keys
const CONFIG_KEYS = {
  TEMPLATE_SHEET_ID: 'TEMPLATE_SHEET_ID',
  QUESTIONS_DOC_ID: 'QUESTIONS_DOC_ID',
  TARGET_FOLDER_ID: 'TARGET_FOLDER_ID',
  QUESTIONS_SHEET_NAME: 'QUESTIONS_SHEET_NAME',
  FORM_TITLE: 'FORM_TITLE',
  GEMINI_API_KEY: 'GEMINI_API_KEY'
};

// Get all configuration values
function getConfig() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const properties = scriptProperties.getProperties();
  
  return {
    TEMPLATE_SHEET_ID: properties[CONFIG_KEYS.TEMPLATE_SHEET_ID],
    QUESTIONS_DOC_ID: properties[CONFIG_KEYS.QUESTIONS_DOC_ID],
    TARGET_FOLDER_ID: properties[CONFIG_KEYS.TARGET_FOLDER_ID],
    QUESTIONS_SHEET_NAME: properties[CONFIG_KEYS.QUESTIONS_SHEET_NAME] || 'Form Questions',
    FORM_TITLE: properties[CONFIG_KEYS.FORM_TITLE] || 'Interview Questions Form',
    GEMINI_API_KEY: properties[CONFIG_KEYS.GEMINI_API_KEY]
  };
}

// Set configuration values
function setConfig(config) {
  const scriptProperties = PropertiesService.getScriptProperties();
  
  // Set each property if provided
  if (config.TEMPLATE_SHEET_ID) scriptProperties.setProperty(CONFIG_KEYS.TEMPLATE_SHEET_ID, config.TEMPLATE_SHEET_ID);
  if (config.QUESTIONS_DOC_ID) scriptProperties.setProperty(CONFIG_KEYS.QUESTIONS_DOC_ID, config.QUESTIONS_DOC_ID);
  if (config.TARGET_FOLDER_ID) scriptProperties.setProperty(CONFIG_KEYS.TARGET_FOLDER_ID, config.TARGET_FOLDER_ID);
  if (config.QUESTIONS_SHEET_NAME) scriptProperties.setProperty(CONFIG_KEYS.QUESTIONS_SHEET_NAME, config.QUESTIONS_SHEET_NAME);
  if (config.FORM_TITLE) scriptProperties.setProperty(CONFIG_KEYS.FORM_TITLE, config.FORM_TITLE);
  if (config.GEMINI_API_KEY) scriptProperties.setProperty(CONFIG_KEYS.GEMINI_API_KEY, config.GEMINI_API_KEY);
}

// Initialize default configuration
function initializeConfig() {
  const defaultConfig = {
    QUESTIONS_SHEET_NAME: 'Form Questions',
    FORM_TITLE: 'Interview Questions Form'
  };
  
  const scriptProperties = PropertiesService.getScriptProperties();
  const existingProperties = scriptProperties.getProperties();
  
  // Only set defaults for properties that don't exist
  Object.entries(defaultConfig).forEach(([key, value]) => {
    if (!existingProperties[CONFIG_KEYS[key]]) {
      scriptProperties.setProperty(CONFIG_KEYS[key], value);
    }
  });
}

// Reset all configuration values
function resetConfig() {
  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.deleteAllProperties();
  initializeConfig();
}

// Utility function for timestamp
function getTimestampSuffix() {
  const now = new Date();
  return Utilities.formatDate(now, 'GMT+8', 'yyyyMMdd_HHmmss');
}

// Validate configuration
function validateConfig() {
  const config = getConfig();
  const requiredKeys = ['TEMPLATE_SHEET_ID', 'QUESTIONS_DOC_ID', 'TARGET_FOLDER_ID', 'GEMINI_API_KEY'];
  const missingKeys = [];
  
  requiredKeys.forEach(key => {
    if (!config[key]) {
      missingKeys.push(key);
    }
  });
  
  if (missingKeys.length > 0) {
    throw new Error(`Missing required configuration values: ${missingKeys.join(', ')}`);
  }
  
  return true;
}
```

---

# createSheet

```javascript
// === createSheet.gs ===
function createSheetInFolder() {
  try {
    // Get configuration from project settings
    const config = getConfig();
    
    // Get target folder
    const targetFolder = DriveApp.getFolderById(config.TARGET_FOLDER_ID);
    
    // Create copy of template in target folder directly
    const templateFile = DriveApp.getFileById(config.TEMPLATE_SHEET_ID);
    const clonedFile = templateFile.makeCopy(targetFolder);
    const clonedSheetId = clonedFile.getId();
    
    // Open the cloned spreadsheet
    const spreadsheet = SpreadsheetApp.openById(clonedSheetId);
    
    // Check if Form Questions sheet exists, if not create it
    let sheet = spreadsheet.getSheetByName(config.QUESTIONS_SHEET_NAME);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(config.QUESTIONS_SHEET_NAME);
      Logger.log(`Created new sheet: ${config.QUESTIONS_SHEET_NAME}`);
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
    Logger.log(`Error in createSheetInFolder: ${error.message}`);
    throw error;
  }
}
```

---

# createForm

```javascript
// === createForm.gs ===
function createFormInFolder(sheetId) {
  try {
    // Get configuration from project settings
    const config = getConfig();
    
    // Get target folder
    const targetFolder = DriveApp.getFolderById(config.TARGET_FOLDER_ID);
    
    // Create form directly in target folder
    const form = FormApp.create(config.FORM_TITLE);
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

    return formId;
  } catch (error) {
    Logger.log(`Error in createFormInFolder: ${error.message}`);
    throw error;
  }
}
```

---

# makePublic

```javascript

// === makeFormPublic.gs ===
function makeFormPublic(formId) {
  try {
    const form = FormApp.openById(formId);
    form.setRequireLogin(false);
    Logger.log(`Form with ID ${formId} is now public.`);
  } catch (error) {
    Logger.log(`Error making form public: ${error.message}`);
    throw error;
  }
}

```

---

# findQuestions

```javascript
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
```

---

# suggestAnswers

```javascript
function suggestAnswers(questions) {
  try {
    // Questions array - stored as a constant for reference
    const INTERVIEW_QUESTIONS = [
      "Name",
      "Mobile", 
      "Email",
      "In 2023, one of our key enterprise clients faced budget cuts of 30% but still needed our full cloud security solution. What was your most challenging price negotiation in a similar situation, and how did you turn a no into a yes while maintaining the relationship and solution value?",
      "Imagine you're leading a HK$10M multi-cloud migration deal where the client's IT team wants AWS, the security team prefers Azure, and the CFO is pushing for the lowest cost option. Describe a similar situation where you had to balance multiple stakeholders' competing interests. How did you manage it?",
      "Our enterprise solutions often require negotiating with procurement teams who focus purely on cost reduction rather than value. Tell me about a time when you faced this situation with a deal worth over HK$5M. What was your strategy?",
      "You notice that your top-performing sales representative, who usually closes 5 deals per quarter, hasn't closed any deals in the past 6 weeks and seems disengaged in team meetings. Share a similar experience where you noticed concerning behavior changes. How did you address it?",
      "A major bank client experiences a 4-hour outage of their cloud services during trading hours, affecting their operations. While it's not directly your product's fault, they're blaming your solution. How did you handle a similar high-pressure situation?",
      "Your development team discovers that a promised AI feature won't be ready for 6 months, affecting multiple enterprise deals worth HK$20M in total. Describe a time when you had to deliver similarly disappointing news to clients. How did you approach it?"
    ];

    // Sample responses
    const responses = {
      questions: INTERVIEW_QUESTIONS,
      answers: [
        "Alex Chen",
        "+852 9123 4567",
        "alex.chen@example.com",
        "In a previous enterprise deal, I faced a similar budget constraint situation with a client who needed our complete security solution despite a 25% budget reduction. I began by conducting a detailed needs analysis to understand their critical requirements and pain points. Then, I developed a phased implementation approach, prioritizing essential security features within their immediate budget while creating a roadmap for adding advanced features over time. I also demonstrated the ROI through detailed cost-benefit analysis and case studies of similar implementations. This approach allowed us to maintain solution integrity while meeting their budget constraints, ultimately securing a HK$8M deal with a 3-year commitment.",
        "I recently managed a HK$12M cloud migration project where stakeholders had conflicting preferences. The development team favored GCP, security wanted Azure, and finance pushed for AWS pricing. I organized structured workshops with each group to document their specific requirements and concerns. Using this input, I created a comprehensive comparison matrix highlighting how different combinations of services could meet their needs. I then proposed a hybrid solution that leveraged Azure's security features while maintaining cost efficiency through strategic use of AWS services. This balanced approach satisfied all stakeholders and led to successful project approval.",
        "During a recent HK$7M enterprise deal, I encountered aggressive procurement tactics focused solely on obtaining the lowest price. Instead of engaging in a price war, I shifted the conversation to total cost of ownership and risk mitigation. I prepared a detailed value analysis showing how our solution would reduce operational costs by 40% over three years and prevent potential security breaches that could cost them millions. By quantifying the long-term benefits and involving key business stakeholders, we successfully justified the investment and closed the deal at our target price point.",
        "I once noticed a similar performance drop in a top sales performer who typically brought in HK$2M quarterly but had missed targets for two months. I scheduled a private meeting to express my concerns and discovered they were dealing with family health issues. I worked with HR to arrange flexible working hours and connected them with our employee assistance program. I also adjusted their quarterly targets temporarily while maintaining clear performance expectations. Through regular check-ins and support, they returned to full productivity within two months.",
        "In a comparable situation, I managed an incident where a financial services client experienced a 2-hour service disruption they attributed to our solution. I immediately assembled a crisis team and established hourly update calls with the client's stakeholders. While investigating, we discovered the root cause was a third-party integration issue. I presented a detailed incident report, implemented new monitoring protocols, and provided a service credit as a goodwill gesture. This transparent approach not only retained the client but led to an expanded partnership worth HK$15M.",
        "When facing a similar situation with a delayed AI feature affecting HK$18M in pipeline deals, I took a proactive approach. I personally contacted each affected client, explaining the situation with transparency and presenting alternative solutions. I developed a comprehensive transition plan that included temporary workarounds and additional support services at no cost. This honest communication strategy helped retain 90% of the affected deals, with clients appreciating our integrity and commitment to their success."
      ]
    };

    return responses;

  } catch (error) {
    Logger.log(`Error in suggestAnswers: ${error.message}`);
    throw error;
  }
}
```

---

# prefilledLink

```javascript
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
```

---

# findEntryIds

```javascript
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
```

---

