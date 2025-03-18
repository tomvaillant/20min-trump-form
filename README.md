# Trump Timeline Entry Form

This Svelte application allows content editors to add new entries to the Trump Timeline, using Vercel serverless functions to update the GitHub repository without requiring user authentication.

## Getting Started

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run start
   ```
4. Open your browser to http://localhost:3000

## How it Works

This form allows users to:
1. Add timeline entries with dates, descriptions, and images
2. Submit the form without requiring GitHub authentication
3. Have images automatically uploaded to the GitHub repository
4. Have the timeline-data.csv file automatically updated

### Vercel Serverless Functions

This implementation uses Vercel serverless functions to:
- Handle server-side GitHub authentication using a stored token
- Upload images to the `/images` folder of your repository
- Update the `timeline-data.csv` file automatically
- Use raw.githubusercontent.com URLs for displaying images

## Deployment to Vercel

1. Update the `utils/config.js` file with your GitHub username and repository name:
   ```js
   export const GITHUB_USERNAME = 'your-username';
   export const GITHUB_REPO = 'your-repo-name';
   ```

2. Create a GitHub Personal Access Token with repo permissions:
   - Go to GitHub → Settings → Developer Settings → Personal Access Tokens
   - Generate a new token with `repo` scope
   - Keep this token secure for the next step

3. Deploy to Vercel:
   - Connect your GitHub repository to Vercel
   - Configure environment variables (see below)
   - Deploy

### Setting Up Environment Variables in Vercel

In your Vercel project settings, add the following environment variables:

1. `GITHUB_TOKEN`: Your GitHub Personal Access Token with repo permissions
2. `GITHUB_USERNAME`: Your GitHub username
3. `GITHUB_REPO`: Your repository name
4. `GITHUB_BRANCH`: The branch to commit to (usually "main")

To add environment variables in Vercel:
1. Go to your project in the Vercel dashboard
2. Click on "Settings"
3. Go to the "Environment Variables" section
4. Add each variable with its corresponding value
5. Deploy or redeploy your application

## Development Environment

For local development, you can create a `.env` file in the root of your project:

```
GITHUB_TOKEN=your_github_token
GITHUB_USERNAME=your_username
GITHUB_REPO=your_repo_name
GITHUB_BRANCH=main
```

Note: The `.env` file should be added to your `.gitignore` to prevent accidentally committing your token.

## User Flow

1. Users visit the form page
2. They fill out the form with date, year, description, and image
3. Upon submission:
   - The form calls the Vercel serverless function
   - The function uses the stored GitHub token to update the repository
   - Images are uploaded with consistent naming
   - The CSV file is updated with the new entry
   - A success message is displayed

## Image Naming Convention

Images are automatically named using this pattern:
```
date-year_description-excerpt_random.jpg
```

Example: `july-1-2024_trump-wins-major-su_123.jpg`

## CSV Format

The timeline data is stored in CSV format with these columns:
```
date,year,description,description2,description3,image,position
```