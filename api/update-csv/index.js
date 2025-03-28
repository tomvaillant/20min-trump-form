// Vercel Serverless Function for updating the CSV file
import { Octokit } from '@octokit/rest';
import { getCurrentQuarter } from '../../utils/dataUtils.js';

// GitHub configuration - attempt to get from environment variables with fallbacks
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'tomvaillant';
const GITHUB_REPO = process.env.GITHUB_REPO || '20min-trump-form';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
const CSV_PATH = 'timeline-data.csv';

// Initialize Octokit with the GitHub token
function getOctokit() {
  if (!GITHUB_TOKEN) {
    console.warn('GitHub token not configured. Using demo mode.');
    return new Octokit(); // Anonymous mode with rate limits
  }
  return new Octokit({ auth: GITHUB_TOKEN });
}

// Check authentication against environment variables
function isAuthenticated(req) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return false;
  }
  
  // Extract credentials
  const base64Credentials = authHeader.replace('Basic ', '');
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [username, password] = credentials.split(':');
  
  // Check against environment variables
  const validUsername = process.env.AUTH_USERNAME;
  const validPassword = process.env.AUTH_PASSWORD;
  
  // Return true if credentials match
  return username === validUsername && password === validPassword;
}

// Main handler function
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Check authentication
  if (!isAuthenticated(req)) {
    return res.status(401).json({ 
      success: false,
      error: 'Authentication required' 
    });
  }
  
  try {
    // Parse the request body
    const { entry } = req.body;
    
    if (!entry || !entry.date || !entry.description) {
      return res.status(400).json({ error: 'Missing required entry data' });
    }
    
    // Initialize GitHub API client
    const octokit = getOctokit();
    
    // Get the current CSV content
    const { content: csvContent, sha } = await getFileContent(octokit, CSV_PATH);
    
    // Add the new entry to the CSV
    const updatedCsv = addEntryToCsv(csvContent, entry);
    
    // Update the CSV file in GitHub
    const updateResult = await updateFile(
      octokit,
      CSV_PATH,
      updatedCsv,
      `Add timeline entry: ${entry.date}`,
      sha
    );
    
    return res.status(200).json({
      success: true,
      message: 'CSV updated successfully'
    });
  } catch (error) {
    console.error('Error updating CSV:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to update CSV'
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
    
    // Return empty content with no SHA for demo mode if file doesn't exist
    if (error.status === 404 || !GITHUB_TOKEN) {
      return {
        content: '',
        sha: null
      };
    }
    
    throw error;
  }
}

// Function to update a file in GitHub
async function updateFile(octokit, path, content, message, sha) {
  try {
    // Skip GitHub API calls in demo mode
    if (!GITHUB_TOKEN) {
      console.log('Demo mode: Skipping GitHub update for', path);
      return { 
        success: true, 
        data: { content: { html_url: `https://github.com/${GITHUB_USERNAME}/${GITHUB_REPO}/blob/main/${path}` }}
      };
    }
    
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
  
  // Get the header row to determine column structure
  const headerRow = lines[0] || 'date,description,description2,description3,description4,description5,description6,link,link2,link3,link4,link5,link6,image,quarter';
  const headerColumns = headerRow.split(',');
  
  // Get current quarter
  const quarter = getCurrentQuarter();
  
  // Create a properly formatted row based on the header structure
  let rowData = {};
  
  // Map the entry data to the correct columns
  rowData.date = entry.date || '';
  
  // Current structure: map fields directly
  rowData.description = entry.description || '';
  rowData.description2 = entry.description2 || '';
  rowData.description3 = entry.description3 || '';
  rowData.description4 = entry.description4 || '';
  rowData.description5 = entry.description5 || '';
  rowData.description6 = entry.description6 || '';
  
  // Link fields
  rowData.link = entry.link || '';
  rowData.link2 = entry.link2 || '';
  rowData.link3 = entry.link3 || '';
  rowData.link4 = entry.link4 || '';
  rowData.link5 = entry.link5 || '';
  rowData.link6 = entry.link6 || '';
  
  // Image path and quarter
  rowData.image = entry.imagePath || '';
  rowData.quarter = quarter;
  
  // Build the CSV row based on header structure
  const rowArray = headerColumns.map(column => {
    const value = rowData[column] || '';
    return escapeCSV(value);
  });
  
  // Format the new entry as a CSV row
  const newRow = rowArray.join(',');
  
  // Add the new row and join back together
  lines.push(newRow);
  return lines.join('\n');
}

// Function to escape CSV field to handle commas and quotes
function escapeCSV(field) {
  if (!field) return '';
  
  // Remove any newlines to prevent breaking CSV structure
  const sanitizedField = field.replace(/\n/g, ' ');
  
  // If field contains comma or double quote, enclose it in double quotes
  if (sanitizedField.includes(',') || sanitizedField.includes('"')) {
    // Replace double quotes with two double quotes
    return '"' + sanitizedField.replace(/"/g, '""') + '"';
  }
  
  return sanitizedField;
}