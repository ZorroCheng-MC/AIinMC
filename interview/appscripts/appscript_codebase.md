# Code.gs

```
// === code.gs ===
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

    // Step 6: Open the prefilled URL in a new tab
    openGeneratedUrl(prefilledUrl);

    return {
      sheetId: sheetId,
      formId: formId,
      prefilledUrl: prefilledUrl
    };

  } catch (error) {
    Logger.log(`Error in main function: ${error.message}`);
    throw error;
  }
}```

---

# auth.gs

```

// === auth.gs ===
function onOpen() {
  Logger.log("=== Starting Silent Auth Check ===");
  
  try {
    var props = PropertiesService.getScriptProperties();
    Logger.log("✓ Basic authorization present");
  } catch(e) {
    Logger.log("✗ No authorization - showing prompt");
    showAuthorizationPrompt();
  }
}

function showAuthorizationPrompt() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert(
    'Assessment System Setup',
    'This sheet requires setup to handle form responses. Click OK to proceed.',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (response === ui.Button.OK) {
    Logger.log("User agreed to setup - triggering authorization");
    triggerFullAuthorization();
  }
}

function triggerFullAuthorization() {
  Logger.log("=== Requesting Full Authorization ===");
  
  try {
    FormApp.getActiveForm();
    UrlFetchApp.fetch('https://www.google.com');
    GmailApp.getQuota();
    
    Logger.log("✓ Full authorization granted");
    PropertiesService.getScriptProperties().setProperty('initialized', 'true');
  } catch(e) {
    Logger.log("! Authorization process initiated: " + e.toString());
  }
}```

---

# config.gs

```
// === config.gs ===
const CONFIG = {
  TEMPLATE_SHEET_ID: '1eHP1UDiO7ESmcMc-mwYtqmJbPtf7-GiPg09GmLTREDQ',
  QUESTIONS_DOC_ID: '1VDaA_ip56bRybjYjchK3PGbttcgsRRc1cLq3i32hvj0',
  TARGET_FOLDER_ID: '1jdEZ8aTmU2rdbUKwkzirmmkOmBREwizi',
  QUESTIONS_SHEET_NAME: 'Form Questions',
  FORM_TITLE: 'Interview Questions Form',
  GEMINI_API_KEY: 'AIzaSyB0xf4Fz4rfJkxulI8FdSigeta-y9EdcI4'
};


function getTimestampSuffix() {
  const now = new Date();
  return Utilities.formatDate(now, 'GMT+8', 'yyyyMMdd_HHmmss');
}
```

---

# createForm.gs

```

// === createForm.gs ===
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

    return formId;
  } catch (error) {
    Logger.log(`Error in createFormInFolder: ${error.message}`);
    throw error;
  }
}
```

---

# createSheel.gs

```

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
```

---

# createSubmitTrigger.gs

```

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
```

---

# findEntryIds.gs

```
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
}```

---

# findQuestions.gs

```
// === findQuestions.gs ===
function findQuestions() {
  try {
    const questionsDoc = DocumentApp.openById(CONFIG.QUESTIONS_DOC_ID);
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
}```

---

# makePublic.gs

```

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

# openUrl.gs

```
// === openUrl.gs ===
// function openGeneratedUrl(url) {
//   var html = HtmlService.createHtmlOutput(
//     `<script>
//       window.open("${url}", "_blank");
//       google.script.host.close();
//     </script>`
//   )
//   .setWidth(100)
//   .setHeight(50);
    
//   SpreadsheetApp.getUi().showModalDialog(html, 'Opening form...');
// }
function openLink() {
  // Replace with your desired URL
  var url = "https://www.google.com";
  
  // Create and open the URL viewer
  var html = HtmlService.createHtmlOutput(`
    <html>
      <body>
        <p>Opening URL...</p>
        <script>
          window.open('${url}');
          setTimeout(function() {
            google.script.host.close();
          }, 1000);
        </script>
      </body>
    </html>
  `);
  
  SpreadsheetApp.getActiveSpreadsheet().show(html);
}```

---

# prefilledLink.gs

```
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
}```

---

# suggestAnswers.gs

```
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
}```

---

