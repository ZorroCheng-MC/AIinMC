#!/bin/bash

# Output markdown file
output_file="combined_files.md"

# Remove the output file if it already exists
rm -f "$output_file"

# Function to process each file
process_file() {
    local file="$1"
    
    # Get filename without path
    filename=$(basename "$file")
    
    # Add filename as header to markdown file
    echo -e "# ${filename}\n" >> "$output_file"
    
    # Add file contents with markdown code block
    echo -e "\`\`\`" >> "$output_file"
    cat "$file" >> "$output_file"
    echo -e "\`\`\`\n" >> "$output_file"
    
    # Add separator
    echo -e "---\n" >> "$output_file"
}

# Check if files are provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 file1 file2 file3 ..."
    exit 1
fi

# Process each file provided as argument
for file in "$@"; do
    if [ -f "$file" ]; then
        process_file "$file"
        echo "Processed: $file"
    else
        echo "Warning: File not found - $file"
    fi
done

echo "Combined markdown file created: $output_file"
