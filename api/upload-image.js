// Vercel Serverless Function for image uploads
const { Octokit } = require('@octokit/rest');
const axios = require('axios');

// GitHub configuration - these will come from environment variables
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'tomvaillant';
const GITHUB_REPO = process.env.GITHUB_REPO || '20min-trump-form';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
const IMAGES_PATH = 'images';

// Initialize Octokit with the GitHub token
function getOctokit() {
  if (!GITHUB_TOKEN) {
    throw new Error('GitHub token not configured. Please set the GITHUB_TOKEN environment variable.');
  }
  return new Octokit({ auth: GITHUB_TOKEN });
}

// Main handler function
module.exports = async (req, res) => {
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
    const { imageData, filename } = req.body;
    
    if (!imageData || !filename) {
      return res.status(400).json({ error: 'Missing required fields: imageData or filename' });
    }
    
    // Remove the data URL prefix if it exists
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    
    // Initialize GitHub API client
    const octokit = getOctokit();
    
    // Upload the image to GitHub
    const uploadResult = await uploadToGitHub(
      octokit,
      `${IMAGES_PATH}/${filename}`,
      base64Data,
      `Add image: ${filename}`
    );
    
    // Return the URL to the uploaded image
    return res.status(200).json({
      success: true,
      url: `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${GITHUB_REPO}/${GITHUB_BRANCH}/${IMAGES_PATH}/${filename}`,
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload image'
    });
  }
};

// Function to upload a file to GitHub
async function uploadToGitHub(octokit, path, content, message) {
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