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
