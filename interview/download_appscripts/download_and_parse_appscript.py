import os
import json
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
import datetime

SCOPES = ['https://www.googleapis.com/auth/script.projects.readonly']
SCRIPT_ID = '18n-rIaR1R8p-jW7BM-KEy7OeJ0zSVGlj3xCMuD2HYK79qpyxIsIT7A__'
APPSCRIPTS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'appscripts')
OUTPUT_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), f'appscript_codebase_{datetime.datetime.now().strftime("%Y%m%d_%H%M%S")}.md')

def get_credentials():
    """Gets valid user credentials from storage or initiates OAuth2 flow."""
    creds = None
    
    # Check if token.json exists
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    
    # If there are no valid credentials, let user log in
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'download_appscripts/appscriptapi_project-magiclink.json', SCOPES)
            creds = flow.run_local_server(port=0)
            
        # Save the credentials for the next run
        with open('token.json', 'w') as token:
            token.write(creds.to_json())
            
    return creds

def get_project_content(service, script_id):
    """Retrieves content of the Apps Script project."""
    try:
        # Get the project content
        request = service.projects().getContent(scriptId=script_id)
        response = request.execute()
        
        return response.get('files', [])
    except Exception as e:
        print(f"Error getting project content: {str(e)}")
        return None

def save_to_markdown(files, output_path):
    """Saves the script files to a markdown file."""
    try:
        with open(output_path, 'w', encoding='utf-8') as md_file:
            for file in files:
                # Write filename as header
                md_file.write(f"# {file['name']}\n\n")
                
                # Write code block with appropriate syntax highlighting
                if file['type'] == 'SERVER_JS':
                    md_file.write("```javascript\n")
                elif file['type'] == 'HTML':
                    md_file.write("```html\n")
                else:
                    md_file.write("```\n")
                
                md_file.write(file['source'])
                md_file.write("\n```\n\n")
                
                # Add separator
                md_file.write("---\n\n")
                
        print(f"Successfully saved project content to {output_path}")
        return True
    except Exception as e:
        print(f"Error saving to markdown: {str(e)}")
        return False

def main():
    """Main function to download and save Apps Script project."""
    try:
        # Get credentials and build service
        creds = get_credentials()
        service = build('script', 'v1', credentials=creds)
        
        # Get project content
        files = get_project_content(service, SCRIPT_ID)
        
        if not files:
            print("No files found in project")
            return
        
        # Create the appscripts directory if it doesn't exist
        os.makedirs(APPSCRIPTS_DIR, exist_ok=True)
        
        # Save .gs and .html files to the appscripts directory
        for file in files:
            file_name = file['name']
            file_type = file['type']
            file_source = file['source']
            
            if file_type == 'SERVER_JS':
                file_path = os.path.join(APPSCRIPTS_DIR, f"{file_name}.gs")
            elif file_type == 'HTML':
                file_path = os.path.join(APPSCRIPTS_DIR, f"{file_name}.html")
            else:
                continue
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(file_source)
            
            print(f"Created file: {file_path}")
        
        # Combine .gs and .html files into a Markdown file
        save_to_markdown(files, OUTPUT_FILE)
        
    except Exception as e:
        print(f"Error in main function: {str(e)}")

if __name__ == "__main__":
    main()