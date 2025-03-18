# Trump Timeline Entry Form

This Svelte application allows content editors to add new entries to the Trump Timeline.

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run start
   ```

3. Open your browser to http://localhost:3000

## How it Works

The form lets users add new entries to the timeline by:
1. Filling out the event details
2. Uploading an image 
3. Submitting the form

This is a simplified client-side only implementation:
- Images are handled client-side (with download prompt)
- CSV changes are simulated (logged to console)

## Implementation Notes

### Client-Side Only Implementation

This implementation is simplified for local development and demonstration:

1. When a form is submitted:
   - A unique filename is generated for the image
   - The user is prompted to download the image (which would normally be saved server-side)
   - The entry details are logged to the console (which would normally update the CSV file)

2. For a production implementation, you would need:
   - A small server component to handle file uploads
   - Server-side code to update the CSV file

### For Content Editors: Using the Form

1. Fill out all required fields:
   - Date (e.g., "July 1, 2024")
   - Title
   - Description (main text)
   - Upload an image
   - Select position (left or right)
2. Add optional additional descriptions if needed
3. Submit the form
4. For demonstration purposes, you'll be prompted to save the image

## CSV Format

The timeline data is stored in CSV format with these columns:
```
date,title,description,description-2,description-3,image,position
```

## Adding Server Support

To implement actual server-side support:

1. Create an API endpoint that:
   - Accepts multipart form data
   - Processes the image upload to the images directory
   - Appends data to the CSV file

2. Update the form component to use this endpoint