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
