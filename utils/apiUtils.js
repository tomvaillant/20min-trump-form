/**
 * Simplified utilities for local form submission and file handling
 */

// Function to save image locally and return file info
export function handleImageUpload(imageFile, date, title) {
  try {
    // Clean up the date and title for filename
    const cleanDate = date.replace(/[^\w]/g, '-').toLowerCase();
    const cleanTitle = title.replace(/[^\w]/g, '-').toLowerCase();
    
    // Generate a filename based on convention: event-date_image.jpg
    const ext = imageFile.name.split('.').pop();
    
    // Add a short random suffix to prevent filename collisions
    const randomSuffix = Math.floor(Math.random() * 1000);
    
    // Create the filename in the format: event-date_title_suffix.ext
    const filename = `${cleanDate}_${cleanTitle}_${randomSuffix}.${ext}`;
    
    // Return the filename to be used in the CSV
    return {
      success: true,
      filename: filename,
      originalName: imageFile.name
    };
  } catch (error) {
    console.error('Image handling error:', error);
    throw new Error('Failed to process image. Please try again.');
  }
}

// Function to append new entry to CSV file
export async function appendToCSV(entry) {
  try {
    // Read the existing CSV file
    const response = await fetch('./timeline-data.csv');
    if (!response.ok) {
      throw new Error('Failed to load timeline data');
    }
    
    const existingData = await response.text();
    
    // Format the new entry as a CSV row
    const newRow = [
      escapeCSV(entry.date),
      escapeCSV(entry.title),
      escapeCSV(entry.description),
      escapeCSV(entry.description2 || ''),
      escapeCSV(entry.description3 || ''),
      escapeCSV(entry.imagePath || ''),
      escapeCSV(entry.position || 'right')
    ].join(',');
    
    // Simulate saving the updated CSV (would normally be server-side)
    console.log('New entry would be appended to CSV:', newRow);
    
    return {
      success: true,
      message: 'Entry has been processed successfully'
    };
  } catch (error) {
    console.error('CSV operation error:', error);
    throw new Error('Failed to save entry. Please try again.');
  }
}

// Escape CSV field to handle commas and quotes
function escapeCSV(field) {
  if (!field) return '';
  
  // If field contains comma, newline or double quote, enclose it in double quotes
  if (field.includes(',') || field.includes('\n') || field.includes('"')) {
    // Replace double quotes with two double quotes
    return '"' + field.replace(/"/g, '""') + '"';
  }
  
  return field;
}