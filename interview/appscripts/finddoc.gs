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