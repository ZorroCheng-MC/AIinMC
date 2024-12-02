-e # appscriptapi_project-magiclink.json

-e ```
{"installed":{"client_id":"99999718481-l0bnmq3uah32mnpafso2utbv0d5tn657.apps.googleusercontent.com","project_id":"project-magiclink","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_secret":"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","redirect_uris":["http://localhost"]}}-e ```

-e ---

-e # download_and_parse_appscript.py

-e ```
import os
import re

script_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'appscripts')
output_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'appscript_codebase.md')

def combine_files():
    with open(output_file, 'w') as output:
        for filename in os.listdir(script_dir):
            file_path = os.path.join(script_dir, filename)
            if os.path.isfile(file_path):
                file_extension = os.path.splitext(filename)[1]
                if file_extension in ['.gs', '.html']:
                    with open(file_path, 'r') as file:
                        content = file.read()
                    
                    # Add Markdown headers
                    if file_extension == '.gs':
                        output.write(f"# {filename}\n\n```\n{content}\n```\n\n---\n\n")
                    elif file_extension == '.html':
                        output.write(f"# {filename}\n\n```html\n{content}\n```\n\n---\n\n")

if __name__ == "__main__":
    combine_files()
    print(f"Combined files written to: {output_file}")-e ```

-e ---

-e # token.json

-e ```
{"token": "ya29.a0AeDClZC6WXyy0JtLQShK9AyqLYlEmnbV7HkXhiYYd5CbRC20aDEFPDET7-USrEa2_T5jQ2fMFFnPrd8EmtSvtfAzv6CL3KQQ6MifYbDIOkwgrnMdY0pBe1ciub0DcIm7u1BL98cnO7jY_Q7dv0p9YPrfp_d2FSky-XgiAt8-VdIaCgYKAWQSARISFQHGX2Mi5CVbvKAEYmsy1ulDQ3dqRQ0178", "refresh_token": "1//0ertYQtH-YWLjCgYIARAAGA4SNwF-L9Iri1JPTpdNE_Gvj4ogSvTZjVg1VlpG7HBfRz3pG8HsAvztyjrpHtvUi1RMkXRQ6k0VkTY", "token_uri": "https://oauth2.googleapis.com/token", "client_id": "99999718481-l0bnmq3uah32mnpafso2utbv0d5tn657.apps.googleusercontent.com", "client_secret": "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", "scopes": ["https://www.googleapis.com/auth/script.projects.readonly"], "universe_domain": "googleapis.com", "account": "", "expiry": "2024-12-02T05:39:46.236928Z"}-e ```

-e ---

