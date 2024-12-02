
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
