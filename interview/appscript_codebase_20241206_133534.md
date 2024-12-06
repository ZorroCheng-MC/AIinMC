# appsscript

```
{
  "timeZone": "Asia/Hong_Kong",
  "dependencies": {
    "enabledAdvancedServices": [
      {
        "userSymbol": "Drive",
        "serviceId": "drive",
        "version": "v3"
      }
    ]
  },
  "webapp": {
    "executeAs": "USER_ACCESSING",
    "access": "ANYONE"
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
```

---

# Code

```javascript
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
```

---

# config

```javascript
// === config.gs ===
const CONFIG = {
  TEMPLATE_SHEET_ID: '1Wp2WNeXoI6wcMs1gno79MdUEhazUNeQxieN2BKOkwBg',
  QUESTIONS_DOC_ID: '',
  TARGET_FOLDER_ID: '1jdEZ8aTmU2rdbUKwkzirmmkOmBREwizi',
  PROJECT_FOLDER_ID: '1n-Bm_gSzjSFSXtqK1XjCxezcEPed0A1Z',
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

# createSheet

```javascript

// === createSheet.gs ===
function createSheetInFolder() {
  try {
    // Get target folder
    const targetFolder = DriveApp.getFolderById(CONFIG.TARGET_FOLDER_ID);
    
    // Create sheet name with timestamp
    const timestamp = getTimestampSuffix();
    const newSheetName = `Interview Questions ${timestamp}`;
    
    // Create copy of template in target folder directly
    const templateFile = DriveApp.getFileById(CONFIG.TEMPLATE_SHEET_ID);
    const clonedFile = templateFile.makeCopy(newSheetName, targetFolder);
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

# createForm

```javascript
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

# findEntryIds

```javascript
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

# webapp

```javascript
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Google Doc Form Generator')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function processGoogleDoc(docId) {
  try {
    CONFIG.QUESTIONS_DOC_ID = docId;
    const result = main();
    
    return {
      sheetUrl: result.sheetUrl,
      formId: result.formId,
      prefilledUrl: result.prefilledUrl
    };
    
  } catch (error) {
    Logger.log('Process error: ' + error.toString());
    return {
      error: error.message || 'Processing failed'
    };
  }
}

function getFormEditorUrl(formId) {
  try {
    const form = FormApp.openById(formId);
    return form.getEditUrl();
  } catch (error) {
    throw new Error('Unable to generate form editor URL');
  }
}

function getPublishedFormUrl(formId) {
  try {
    const form = FormApp.openById(formId);
    return form.getPublishedUrl();
  } catch (error) {
    throw new Error('Unable to get published form URL');
  }
}
```

---

# index

```html
<!DOCTYPE html>
<html>
<head>
    <title>Google Doc Form Generator</title>
    <style>
        .input-url {
        width: 100%;
        padding: 8px;
        margin-bottom: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        background-color: white;
        }

        .generate-button:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
        }

        .guide-text {
            font-size: 14px;
            color: #666;
            margin: 10px 0;
        }    
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            font-family: Arial, sans-serif;
        }
        .input-section {
            margin-bottom: 20px;
        }
        .loading-spinner {
            display: none;
            color: #666;
        }
        .error {
            color: red;
            display: none;
            margin: 10px 0;
        }
        .result {
            display: none;
        }
        .step {
            margin-bottom: 20px;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
            display: none;
        }
        .step.completed {
            background-color: #f8f9fa;
            opacity: 0.8;
        }
        .step.completed .action-button {
            display: none !important;
        }
        .step.completed .step-header::before {
            content: "✓ ";
            color: #34a853;
        }
        .step.active {
            display: block;
            border: 2px solid #4285f4;
        }
        .step.visible {
            display: block;
        }
        .step-header {
            font-weight: bold;
            margin-bottom: 10px;
        }
        .link-container {
            margin-bottom: 20px;
            padding: 15px;
            background-color: #f5f5f5;
            border-radius: 5px;
        }
        .link-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        .link-title {
            font-weight: bold;
        }
        .input-url {
            width: 100%;
            padding: 8px;
            margin-bottom: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .action-button {
            background-color: #4285f4;
            color: white;
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            text-decoration: none;
            margin-left: 10px;
        }
        .action-button:hover {
            background-color: #357abd;
        }
        .action-button.open-button {
            background-color: #4285f4;
        }
        .action-button.confirm-button {
            background-color: #34a853;
            display: none;
        }
        .guide-text {
            font-size: 14px;
            color: #666;
            margin-top: 10px;
        }
        .generate-button {
            background-color: #4285f4;
            color: white;
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        .generate-button:hover {
            background-color: #357abd;
        }
        .completion-message {
            text-align: center;
            padding: 20px;
            background-color: #e6f4ea;
            border-radius: 5px;
            margin-top: 20px;
            display: none;
        }
        .completion-message h2 {
            color: #34a853;
            margin-bottom: 10px;
        }
        .form-url-container {
            margin-top: 15px;
            padding: 10px;
            background-color: #f8f9fa;
            border-radius: 4px;
        }
        .form-url {
            word-break: break-all;
            font-family: monospace;
            color: #1a73e8;
            padding: 10px;
            margin: 10px 0;
            background-color: white;
            border-radius: 4px;
            border: 1px solid #ddd;
        }
        .copy-button {
            margin-top: 10px;
            background-color: #4285f4;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
        }
        .copy-button:hover {
            background-color: #357abd;
        }
    </style>
</head>
<body>
    <div class="container">
      <h1 style="display: flex; align-items: center; gap: 10px;">
        <svg width="32" height="32" viewBox="0 0 52 52">
            <rect fill="none" height="4.8" rx="1.6" width="27.2" x="12.4" y="26"/>
            <rect fill="none" height="4.8" rx="1.6" width="24" x="12.4" y="35.6"/>
            <g>
                <path d="m36.4 14.8h8.48a1.09 1.09 0 0 0 1.12-1.12 1 1 0 0 0 -.32-.8l-10.56-10.56a1 1 0 0 0 -.8-.32 1.09 1.09 0 0 0 -1.12 1.12v8.48a3.21 3.21 0 0 0 3.2 3.2z" fill="currentColor"/>
                <path d="m44.4 19.6h-11.2a4.81 4.81 0 0 1 -4.8-4.8v-11.2a1.6 1.6 0 0 0 -1.6-1.6h-16a4.81 4.81 0 0 0 -4.8 4.8v38.4a4.81 4.81 0 0 0 4.8 4.8h30.4a4.81 4.81 0 0 0 4.8-4.8v-24a1.6 1.6 0 0 0 -1.6-1.6zm-32-1.6a1.62 1.62 0 0 1 1.6-1.55h6.55a1.56 1.56 0 0 1 1.57 1.55v1.59a1.63 1.63 0 0 1 -1.59 1.58h-6.53a1.55 1.55 0 0 1 -1.58-1.58zm24 20.77a1.6 1.6 0 0 1 -1.6 1.6h-20.8a1.6 1.6 0 0 1 -1.6-1.6v-1.57a1.6 1.6 0 0 1 1.6-1.6h20.8a1.6 1.6 0 0 1 1.6 1.6zm3.2-9.6a1.6 1.6 0 0 1 -1.6 1.63h-24a1.6 1.6 0 0 1 -1.6-1.6v-1.6a1.6 1.6 0 0 1 1.6-1.6h24a1.6 1.6 0 0 1 1.6 1.6z" fill="currentColor"/>
            </g>
        </svg>
        Interview Form Bot
    </h1>

    <div class="input-section">
        <div class="step-header">Step 1: Select Question Document</div>
        <select id="docSelector" class="input-url">
            <option value="">Select a document...</option>
        </select>
        <div class="guide-text">
            Available documents will be loaded from your project folder.
        </div>
        <button id="generateButton" onclick="generateForm()" class="generate-button" disabled>
            Generate Form
        </button>
        <div id="loadingSpinner" class="loading-spinner">Generating...</div>
    </div>

        <div id="error" class="error"></div>

        <div id="result" class="result">
            <!-- Step 2: Form Editor -->
            <div id="step2" class="step">
                <div class="step-header">Step 2: Review and Confirm Form</div>
                <div class="link-container">
                    <div class="link-header">
                        <span class="link-title">Instructions:</span>
                        <div>
                            <button id="formEditorOpen" class="action-button open-button" onclick="handleFormEditorOpen()">Open Form</button>
                            <button id="formEditorConfirm" class="action-button confirm-button" onclick="confirmStep(2)">Confirm</button>
                        </div>
                    </div>
                    <div class="guide-text">
                        1. Open the form editor to review the questions<br>
                        2. Make any necessary adjustments<br>
                        3. Click Confirm when ready
                    </div>
                </div>
            </div>

            <!-- Step 3: Response Sheet -->
            <div id="step3" class="step">
                <div class="step-header">Step 3: Response Sheet Setup</div>
                <div class="link-container">
                    <div class="link-header">
                        <span class="link-title">Instructions:</span>
                        <div>
                            <button id="sheetOpen" class="action-button open-button" onclick="handleSheetOpen()">Open Sheet</button>
                            <button id="sheetConfirm" class="action-button confirm-button" onclick="confirmStep(3)">Confirm</button>
                        </div>
                    </div>
                    <div class="guide-text">
                        1. Open the response sheet<br>
                        2. Wait for 30 seconds untill "Form Tools" show on meun.<br>
                        3. Click "Form Tools" next to "Help" meun on the top <br>
                        4. Select "Setup Form Trigger"<br>
                        5. Complete the authorization process<br>
                        6. Click Confirm after setup is complete
                    </div>
                </div>
            </div>

            <!-- Step 4: Prefilled Form -->
            <div id="step4" class="step">
                <div class="step-header">Step 4: Test Submission</div>
                <div class="link-container">
                    <div class="link-header">
                        <span class="link-title">Instructions:</span>
                        <div>
                            <button id="prefilledFormOpen" class="action-button open-button" onclick="handlePrefilledFormOpen()">Open Form</button>
                            <button id="prefilledFormConfirm" class="action-button confirm-button" onclick="confirmStep(4)">Confirm</button>
                        </div>
                    </div>
                    <div class="guide-text">
                        1. Open the pre-filled form<br>
                        2. Review all answers<br>
                        3. Scroll to bottom and submit the form
                    </div>
                </div>
            </div>

            <!-- Step 5: Gmail -->
            <div id="step5" class="step">
                <div class="step-header">Step 5: Send Interview Email</div>
                <div class="link-container">
                    <div class="link-header">
                        <span class="link-title">Instructions:</span>
                        <div>
                            <button id="gmailOpen" class="action-button open-button" onclick="handleGmailOpen()">Open Gmail</button>
                            <button id="gmailConfirm" class="action-button confirm-button" onclick="showCompletion()">Confirm</button>
                        </div>
                    </div>
                    <div class="guide-text">
                        1. Open Gmail<br>
                        2. Create new email for sending the form<br>
                        3. Click Confirm after sending the email
                    </div>
                </div>
            </div>

            <!-- Completion Message -->
            <div id="completionMessage" class="completion-message">
                <h2>Congratulations!</h2>
                <p>Your form is ready to distribute</p>
                <div class="form-url-container">
                    <p>Form URL:</p>
                    <div id="formUrl" class="form-url"></div>
                    <button onclick="copyFormUrl()" class="copy-button">Copy URL</button>
                </div>
            </div>
        </div>
    </div>

    <script>
        let formData = {};

        function generateForm() {
            const docUrl = document.getElementById('docUrl').value;
            if (!docUrl) {
                showError('Please enter a Google Doc URL');
                return;
            }

            document.getElementById('generateButton').style.display = 'none';
            document.getElementById('loadingSpinner').style.display = 'block';
            document.getElementById('error').style.display = 'none';
            
            const docId = extractDocId(docUrl);
            if (!docId) {
                showError('Invalid Google Doc URL');
                document.getElementById('generateButton').style.display = 'block';
                return;
            }

            google.script.run
                .withSuccessHandler(updateUI)
                .withFailureHandler(handleError)
                .processGoogleDoc(docId);
        }

        function handleError(error) {
            showError(error);
            document.getElementById('generateButton').style.display = 'block';
        }

        function extractDocId(url) {
            const match = url.match(/\/d\/([-\w]{25,})/);
            return match ? match[1] : null;
        }

        function handleFormEditorOpen() {
            if (formData.formId) {
                google.script.run
                    .withSuccessHandler(function(url) {
                        window.open(url, '_blank');
                        document.getElementById('formEditorOpen').style.display = 'none';
                        document.getElementById('formEditorConfirm').style.display = 'inline-block';
                    })
                    .withFailureHandler(function(error) {
                        showError('Could not open form editor: ' + error);
                    })
                    .getFormEditorUrl(formData.formId);
            }
        }

        function handleSheetOpen() {
            if (formData.sheetUrl) {
                window.open(formData.sheetUrl, '_blank');
                document.getElementById('sheetOpen').style.display = 'none';
                document.getElementById('sheetConfirm').style.display = 'inline-block';
            }
        }

        function handlePrefilledFormOpen() {
            if (formData.prefilledUrl) {
                window.open(formData.prefilledUrl, '_blank');
                document.getElementById('prefilledFormOpen').style.display = 'none';
                document.getElementById('prefilledFormConfirm').style.display = 'inline-block';
            }
        }

        function handleGmailOpen() {
            window.open('https://mail.google.com', '_blank');
            document.getElementById('gmailOpen').style.display = 'none';
            document.getElementById('gmailConfirm').style.display = 'inline-block';
        }

        function updateUI(result) {
            document.getElementById('loadingSpinner').style.display = 'none';
            
            if (result.error) {
                showError(result.error);
                document.getElementById('generateButton').style.display = 'block';
                return;
            }
            
            formData = result;
            document.getElementById('result').style.display = 'block';
            const step2 = document.getElementById('step2');
            step2.classList.add('visible', 'active');
        }

        function showError(error) {
            document.getElementById('loadingSpinner').style.display = 'none';
            const errorDiv = document.getElementById('error');
            errorDiv.textContent = 'Error: ' + error;
            errorDiv.style.display = 'block';
        }

        function confirmStep(stepNum) {
            // Mark current step as completed
            const currentStep = document.getElementById(`step${stepNum}`);
            currentStep.classList.add('completed');
            currentStep.classList.remove('active');
            
            if (stepNum < 5) {
                // Show and activate next step
                const nextStep = document.getElementById(`step${stepNum + 1}`);
                nextStep.classList.add('visible', 'active');
                
                // Reset the buttons state for the next step
                if (nextStep) {
                    const openButton = nextStep.querySelector('.open-button');
                    const confirmButton = nextStep.querySelector('.confirm-button');
                    if (openButton) openButton.style.display = 'inline-block';
                    if (confirmButton) confirmButton.style.display = 'none';
                }
                
                // Scroll to the next step smoothly
                nextStep.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        function showCompletion() {
            // Mark step 5 as completed
            const step5 = document.getElementById('step5');
            step5.classList.add('completed');
            step5.classList.remove('active');
            
            // Get form URL and show completion message
            google.script.run
                .withSuccessHandler(function(url) {
                    document.getElementById('formUrl').textContent = url;
                    document.getElementById('completionMessage').style.display = 'block';
                    document.getElementById('completionMessage').scrollIntoView({ behavior: 'smooth', block: 'center' });
                })
                .getPublishedFormUrl(formData.formId);
        }

        function copyFormUrl() {
            const formUrl = document.getElementById('formUrl').textContent;
            navigator.clipboard.writeText(formUrl).then(function() {
                const copyButton = document.querySelector('.copy-button');
                const originalText = copyButton.textContent;
                copyButton.textContent = 'Copied!';
                setTimeout(() => {
                    copyButton.textContent = originalText;
                }, 2000);
            });
        }

           // Function to load documents into dropdown
    function loadDocuments() {
        google.script.run
            .withSuccessHandler(populateDropdown)
            .withFailureHandler(handleLoadError)
            .getAvailableGoogleDocs();
    }

    // Function to populate the dropdown with documents
    function populateDropdown(docs) {
        const selector = document.getElementById('docSelector');
        const generateButton = document.getElementById('generateButton');
        
        // Clear existing options except the first one
        while (selector.options.length > 1) {
            selector.remove(1);
        }
        
        // Add new options
        docs.forEach(doc => {
            const option = document.createElement('option');
            option.value = doc.id;
            option.text = doc.name;
            selector.add(option);
        });
        
        // Enable/disable generate button based on selection
        selector.onchange = function() {
            generateButton.disabled = !this.value;
        };
    }

    // Function to handle loading errors
    function handleLoadError(error) {
        showError('Failed to load documents: ' + error);
    }

    // Update the existing generateForm function
    function generateForm() {
        const docId = document.getElementById('docSelector').value;
        if (!docId) {
            showError('Please select a document');
            return;
        }

        document.getElementById('generateButton').style.display = 'none';
        document.getElementById('loadingSpinner').style.display = 'block';
        document.getElementById('error').style.display = 'none';

        google.script.run
            .withSuccessHandler(updateUI)
            .withFailureHandler(handleError)
            .processGoogleDoc(docId);
    }

    // Load documents when the page loads
    window.onload = loadDocuments;

    </script>
</body>
</html>
```

---

# finddoc

```javascript
// === findGoogleDocs.gs ===

function findGoogleDocs() {
  const docs = [];
  
  function processFolder(folder) {
    Logger.log(`Scanning folder: ${folder.getName()}`);
    
    // Get all files in the current folder
    const files = folder.getFiles();
    while (files.hasNext()) {
      const file = files.next();
      // Check if the file is a Google Doc
      if (file.getMimeType() === MimeType.GOOGLE_DOCS) {
        docs.push({
          id: file.getId(),
          name: file.getName(),
          url: file.getUrl(),
          lastUpdated: file.getLastUpdated(),
          folder: folder.getName()
        });
      }
    }
    
    // Recursively process subfolders
    const subFolders = folder.getFolders();
    while (subFolders.hasNext()) {
      processFolder(subFolders.next());
    }
  }
  
  try {
    // Validate PROJECT_FOLDER_ID exists in CONFIG
    if (!CONFIG.PROJECT_FOLDER_ID) {
      throw new Error('PROJECT_FOLDER_ID is not defined in CONFIG');
    }
    
    const rootFolder = DriveApp.getFolderById(CONFIG.PROJECT_FOLDER_ID);
    Logger.log('=========================================');
    Logger.log(`Starting scan in target folder: ${rootFolder.getName()}`);
    Logger.log(`Folder ID: ${CONFIG.PROJECT_FOLDER_ID}`);
    Logger.log('=========================================');
    
    processFolder(rootFolder);
    
    // Sort docs by last updated date (most recent first)
    docs.sort((a, b) => b.lastUpdated - a.lastUpdated);
    
    // Log the results
    Logger.log('=========================================');
    Logger.log('DOCUMENT LIST:');
    Logger.log('=========================================');
    if (docs.length === 0) {
      Logger.log('No Google Docs found in the target folder.');
    } else {
      docs.forEach((doc, index) => {
        Logger.log(`${index + 1}. Document Name: ${doc.name}`);
        Logger.log(`   Location: ${doc.folder}`);
        Logger.log(`   Last Updated: ${doc.lastUpdated.toLocaleString()}`);
        Logger.log(`   ID: ${doc.id}`);
        Logger.log('----------------------------------------');
      });
      Logger.log(`Total documents found: ${docs.length}`);
    }
    
    return docs;
    
  } catch (error) {
    Logger.log(`Error in findGoogleDocs: ${error.message}`);
    throw error;
  }
}

// Test function to display document list
function testListDocs() {
  try {
    Logger.log('Starting document scan...');
    const docs = findGoogleDocs();
    
    Logger.log('=========================================');
    Logger.log('SIMPLE NAME LIST:');
    Logger.log('=========================================');
    if (docs.length === 0) {
      Logger.log('No documents found.');
    } else {
      docs.forEach((doc, index) => {
        Logger.log(`${index + 1}. ${doc.name}`);
      });
    }
    
  } catch (error) {
    Logger.log(`Error in testListDocs: ${error.toString()}`);
  }
}

// Frontend access function
function getAvailableGoogleDocs() {
  try {
    const docs = findGoogleDocs();
    return docs.map(doc => ({
      id: doc.id,
      name: doc.name,
      url: doc.url
    }));
  } catch (error) {
    Logger.log(`Error in getAvailableGoogleDocs: ${error.message}`);
    throw error;
  }
}
```

---

