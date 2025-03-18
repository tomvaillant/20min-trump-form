// Vercel Serverless Function for handling form submissions
import { Octokit } from '@octokit/rest';

// GitHub configuration - these will come from environment variables
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'tomvaillant';
const GITHUB_REPO = process.env.GITHUB_REPO || '20min-trump-form';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
const IMAGES_PATH = 'images';
const CSV_PATH = 'timeline-data.csv';

// Initialize Octokit with the GitHub token
function getOctokit() {
  if (!GITHUB_TOKEN) {
    throw new Error('GitHub token not configured. Please set the GITHUB_TOKEN environment variable.');
  }
  return new Octokit({ auth: GITHUB_TOKEN });
}

// Main handler function
export default async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Parse the request body
    const { entry, imageData, filename } = req.body;
    
    if (!entry || !imageData || !filename) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Initialize GitHub API client
    const octokit = getOctokit();
    
    // Upload the image to GitHub
    const base64ImageData = imageData.replace(/^data:image\/\w+;base64,/, '');
    await uploadFile(
      octokit, 
      `${IMAGES_PATH}/${filename}`,
      base64ImageData,
      `Add image: ${filename}`
    );
    
    // Update the image path in the entry to use the raw GitHub URL
    entry.imagePath = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${GITHUB_REPO}/${GITHUB_BRANCH}/${IMAGES_PATH}/${filename}`;
    
    // Get the current CSV content
    const { content: csvContent, sha } = await getFileContent(octokit, CSV_PATH);
    
    // Add the new entry to the CSV
    const updatedCsv = addEntryToCsv(csvContent, entry);
    
    // Update the CSV file in GitHub
    await updateFile(
      octokit,
      CSV_PATH,
      updatedCsv,
      `Add timeline entry: ${entry.date}, ${entry.year}`,
      sha
    );
    
    return res.status(200).json({
      success: true,
      imagePath: entry.imagePath,
      message: 'Entry submitted successfully'
    });
  } catch (error) {
    console.error('Submission error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to process submission'
    });
  }
};

// Function to get a file's content from GitHub
async function getFileContent(octokit, path) {
  try {
    const { data } = await octokit.repos.getContent({
      owner: GITHUB_USERNAME,
      repo: GITHUB_REPO,
      path,
      ref: GITHUB_BRANCH
    });
    
    // Decode base64 content
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    
    return {
      content,
      sha: data.sha
    };
  } catch (error) {
    console.error('Error getting file content:', error);
    throw error;
  }
}

// Function to upload a file to GitHub
async function uploadFile(octokit, path, content, message) {
  try {
    // Try to get the current file to get its SHA (needed for updating)
    let fileSha = null;
    try {
      const { data } = await octokit.repos.getContent({
        owner: GITHUB_USERNAME,
        repo: GITHUB_REPO,
        path,
        ref: GITHUB_BRANCH
      });
      fileSha = data.sha;
    } catch (error) {
      // File doesn't exist yet, which is fine for creating a new file
      if (error.status !== 404) {
        throw error;
      }
    }
    
    // Create or update the file
    const result = await octokit.repos.createOrUpdateFileContents({
      owner: GITHUB_USERNAME,
      repo: GITHUB_REPO,
      path,
      message,
      content,
      branch: GITHUB_BRANCH,
      sha: fileSha
    });
    
    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    console.error('GitHub API error:', error);
    throw new Error(`GitHub API error: ${error.message}`);
  }
}

// Function to update a file in GitHub
async function updateFile(octokit, path, content, message, sha) {
  try {
    const result = await octokit.repos.createOrUpdateFileContents({
      owner: GITHUB_USERNAME,
      repo: GITHUB_REPO,
      path,
      message,
      content: Buffer.from(content).toString('base64'),
      sha,
      branch: GITHUB_BRANCH
    });
    
    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    console.error('Error updating file:', error);
    throw error;
  }
}

// Function to add a new entry to the CSV content
function addEntryToCsv(csvContent, entry) {
  // Process the CSV content
  const lines = csvContent.split('\n');
  
  // Format the new entry as a CSV row
  const newRow = [
    escapeCSV(entry.date),
    escapeCSV(entry.year),
    escapeCSV(entry.description),
    escapeCSV(entry.description2 || ''),
    escapeCSV(entry.description3 || ''),
    escapeCSV(entry.imagePath || ''),
    escapeCSV(entry.position || 'right')
  ].join(',');
  
  // Add the new row and join back together
  lines.push(newRow);
  return lines.join('\n');
}

// Function to escape CSV field to handle commas and quotes
function escapeCSV(field) {
  if (!field) return '';
  
  // If field contains comma, newline or double quote, enclose it in double quotes
  if (field.includes(',') || field.includes('\n') || field.includes('"')) {
    // Replace double quotes with two double quotes
    return '"' + field.replace(/"/g, '""') + '"';
  }
  
  return field;
}