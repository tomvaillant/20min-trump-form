/**
 * API utilities for form submission and file handling
 * Using Vercel serverless functions
 */

import { getImageUrl } from './config.js';

// Get the base API URL - use relative paths in development, full URLs in production
const getApiUrl = () => {
  return location.hostname === 'localhost' ? '/api' : `${location.origin}/api`;
};

/**
 * Process image upload and generate consistent filename
 */
export function handleImageUpload(imageFile, date, title) {
  try {
    // Clean up the date and title for filename
    const cleanDate = date.replace(/[^\w]/g, '-').toLowerCase();
    const cleanTitle = title.replace(/[^\w]/g, '-').toLowerCase();
    
    // Add a short random suffix to prevent filename collisions
    const randomSuffix = Math.floor(Math.random() * 1000);
    
    // Create the filename with original extension
    const fileExt = imageFile.name.split('.').pop().toLowerCase();
    const filename = `${cleanDate}_${cleanTitle}_${randomSuffix}.${fileExt}`;
    
    // Return the filename and full GitHub raw URL path
    return {
      success: true,
      filename: filename,
      originalName: imageFile.name,
      fullPath: getImageUrl(filename)
    };
  } catch (error) {
    console.error('Image handling error:', error);
    throw new Error('Failed to process image. Please try again.');
  }
}

/**
 * Process form submission via Vercel serverless function
 */
export async function processSubmission(entry, imageFile, imageFilename) {
  try {
    let imageData = null;
    
    // Only process image if provided
    if (imageFile) {
      // Convert the image to base64
      imageData = await fileToBase64(imageFile);
    }
    
    // Determine which endpoint to use based on whether we have an image
    const endpoint = imageFile ? 'submit-entry' : 'update-csv';
    
    // Prepare request body
    const requestBody = imageFile
      ? { entry, imageData, filename: imageFilename }
      : { entry };
    
    // Send form data to the serverless function
    const response = await fetch(`${getApiUrl()}/${endpoint}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to submit entry');
    }
    
    return {
      success: true,
      message: result.message || 'Entry submitted successfully'
    };
  } catch (error) {
    console.error('Submission processing error:', error);
    return {
      success: false,
      message: `Failed to process submission: ${error.message}`
    };
  }
}

/**
 * Convert file to base64
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}