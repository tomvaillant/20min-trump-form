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
 * Compress image before upload and convert to WebP
 */
export async function compressImage(imageFile) {
  try {
    // First, compress the image using browser-image-compression
    const options = {
      maxSizeMB: 0.3,           // Maximum file size in MB (300KB)
      maxWidthOrHeight: 1000,   // Maximum width or height
      useWebWorker: true,       // Use web worker for better performance
      initialQuality: 0.8       // Initial quality setting for compression
    };
    
    const compressedFile = await imageCompression(imageFile, options);
    
    // WebP conversion happens on the server side when the image is uploaded
    // Since browser can't directly convert to WebP format without canvas
    // Just return the compressed file and let the server handle conversion
    
    return compressedFile;
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
    
    // Generate a filename based on convention: date_title_suffix.webp
    // Always use WebP extension regardless of original file
    
    // Add a short random suffix to prevent filename collisions
    const randomSuffix = Math.floor(Math.random() * 1000);
    
    // Create the filename in the format: date_title_suffix.webp
    const filename = `${cleanDate}_${cleanTitle}_${randomSuffix}.webp`;
    
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
    // Always use btoa in browser environment
    const authHeader = 'Basic ' + btoa('20-min:trumpets');
    
    const response = await fetch(`${getApiUrl()}/submit-entry/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
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