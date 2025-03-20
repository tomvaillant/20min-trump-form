/**
 * API utilities for form submission and file handling
 * Using Vercel serverless functions instead of direct GitHub API access
 */

import { getImageUrl } from './config.js';
import imageCompression from 'browser-image-compression';

// Get the base API URL - use relative paths in development, full URLs in production
const getApiUrl = () => {
  return location.hostname === 'localhost' ? '/api' : `${location.origin}/api`;
};

/**
 * Compress image before upload
 */
export async function compressImage(imageFile) {
  try {
    const options = {
      maxSizeMB: 0.3,           // Maximum file size in MB (300KB)
      maxWidthOrHeight: 1000,   // Maximum width or height
      useWebWorker: true,       // Use web worker for better performance
      initialQuality: 0.8       // Initial quality setting for compression
    };
    
    return await imageCompression(imageFile, options);
  } catch (error) {
    console.error('Image compression error:', error);
    // If compression fails, return the original file
    return imageFile;
  }
}

/**
 * Process image upload and generate consistent filename
 */
export function handleImageUpload(imageFile, date, title) {
  try {
    // Clean up the date and title for filename
    const cleanDate = date.replace(/[^\w]/g, '-').toLowerCase();
    const cleanTitle = title.replace(/[^\w]/g, '-').toLowerCase();
    
    // Generate a filename based on convention: date_title_suffix.ext
    const ext = imageFile.name.split('.').pop();
    
    // Add a short random suffix to prevent filename collisions
    const randomSuffix = Math.floor(Math.random() * 1000);
    
    // Create the filename in the format: date_title_suffix.ext
    const filename = `${cleanDate}_${cleanTitle}_${randomSuffix}.${ext}`;
    
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
    // Compress the image before converting to base64
    const compressedImage = await compressImage(imageFile);
    
    // Convert the compressed image to base64
    const imageData = await fileToBase64(compressedImage);
    
    // Send form data to the serverless function
    const response = await fetch(`${getApiUrl()}/submit-entry/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        entry,
        imageData,
        filename: imageFilename
      })
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