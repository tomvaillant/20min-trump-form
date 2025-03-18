/**
 * GitHub API integration utilities
 * For direct repository updates
 */

import {
  GITHUB_REPO_API,
  GITHUB_USERNAME,
  GITHUB_REPO,
  GITHUB_BRANCH,
  IMAGES_PATH,
  DATA_PATH
} from './config.js';

// GitHub token for authentication (set via environment variable)
let githubToken = '';

/**
 * Set GitHub token for authentication
 * This should be called once when the app initializes
 */
export function setGithubToken(token) {
  githubToken = token;
}

/**
 * Get the GitHub token - either from storage or request it
 */
export async function getOrRequestGithubToken() {
  // Try to get token from session storage
  let token = sessionStorage.getItem('github_token');
  
  // If no token exists, request it from the user
  if (!token) {
    token = prompt('Please enter your GitHub Personal Access Token (needs repo permissions):');
    if (token) {
      sessionStorage.setItem('github_token', token);
    } else {
      throw new Error('GitHub token is required to make updates');
    }
  }
  
  return token;
}

/**
 * GitHub submission handler
 * Uses GitHub's API to:
 * 1. Upload the image to the GitHub repo
 * 2. Update the CSV data file with the new entry
 */
export async function submitToGitHub(entry, imageFile, imageFilename) {
  try {
    // Get GitHub token
    const token = await getOrRequestGithubToken();
    
    // Get the current CSV file content
    const { content: csvContent, sha: csvSha } = await getFileContent(DATA_PATH, token);
    
    // Upload the image first
    const imageUploadResult = await uploadFile(
      `${IMAGES_PATH}/${imageFilename}`,
      imageFile,
      `Add image: ${imageFilename}`,
      token
    );
    
    if (!imageUploadResult.success) {
      throw new Error(`Failed to upload image: ${imageUploadResult.message}`);
    }
    
    // Update image path in the entry to use the raw GitHub URL
    entry.imagePath = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${GITHUB_REPO}/${GITHUB_BRANCH}/${IMAGES_PATH}/${imageFilename}`;
    
    // Add the new entry to the CSV
    const updatedCsv = addEntryToCsv(csvContent, entry);
    
    // Update the CSV file in the repository
    const csvUpdateResult = await updateFile(
      DATA_PATH,
      updatedCsv,
      `Add timeline entry: ${entry.date}, ${entry.year}`,
      csvSha,
      token
    );
    
    if (!csvUpdateResult.success) {
      throw new Error(`Failed to update CSV: ${csvUpdateResult.message}`);
    }
    
    return {
      success: true,
      message: 'Entry successfully added to timeline'
    };
  } catch (error) {
    console.error('GitHub submission error:', error);
    return {
      success: false,
      message: `Failed to submit to GitHub: ${error.message}`
    };
  }
}

/**
 * Get a file's content and SHA from GitHub
 */
export async function getFileContent(path, token) {
  try {
    const url = `${GITHUB_REPO_API}/contents/${path}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get file content: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Decode base64 content
    const content = atob(data.content.replace(/\n/g, ''));
    
    return {
      content,
      sha: data.sha
    };
  } catch (error) {
    console.error('Error getting file content:', error);
    throw error;
  }
}

/**
 * Upload a file to GitHub repository
 */
export async function uploadFile(path, file, commitMessage, token) {
  try {
    const url = `${GITHUB_REPO_API}/contents/${path}`;
    
    // Convert file to base64
    const base64Content = await fileToBase64(file);
    
    const payload = {
      message: commitMessage,
      content: base64Content,
      branch: GITHUB_BRANCH
    };
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Unknown error'
      };
    }
    
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Update an existing file in GitHub
 */
export async function updateFile(path, content, commitMessage, sha, token) {
  try {
    const url = `${GITHUB_REPO_API}/contents/${path}`;
    
    // Convert content to base64
    const base64Content = btoa(content);
    
    const payload = {
      message: commitMessage,
      content: base64Content,
      sha: sha,
      branch: GITHUB_BRANCH
    };
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Unknown error'
      };
    }
    
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error updating file:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Convert a file to base64
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove the data URL prefix and get just the base64 string
      const base64String = reader.result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = error => reject(error);
  });
}

/**
 * Add a new entry to the CSV content
 */
export function addEntryToCsv(csvContent, entry) {
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

/**
 * Escape CSV field to handle commas and quotes
 */
function escapeCSV(field) {
  if (!field) return '';
  
  // If field contains comma, newline or double quote, enclose it in double quotes
  if (field.includes(',') || field.includes('\n') || field.includes('"')) {
    // Replace double quotes with two double quotes
    return '"' + field.replace(/"/g, '""') + '"';
  }
  
  return field;
}