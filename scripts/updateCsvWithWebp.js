/**
 * Script to update the timeline-data.csv file to reference WebP images
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const csvPath = path.join(__dirname, '..', 'timeline-data.csv');

// Read the CSV file
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n');

// Process each line
const updatedLines = lines.map((line, index) => {
  // Skip header
  if (index === 0) {
    return line;
  }
  
  // Skip empty lines
  if (!line.trim()) {
    return line;
  }
  
  // Parse the line
  const columns = line.split(',');
  
  // Check if there's an image URL in the appropriate column
  if (columns.length >= 14 && columns[13] && columns[13].trim()) {
    // Check if the URL contains an image file
    const imageUrl = columns[13].trim().replace(/"/g, '');
    
    // Check if it's a GitHub raw URL for an image
    if (imageUrl.includes('githubusercontent.com') && 
        (imageUrl.endsWith('.png') || imageUrl.endsWith('.jpg') || imageUrl.endsWith('.jpeg') || imageUrl.endsWith('.gif'))) {
      
      // Replace the extension with .webp
      const webpUrl = imageUrl.replace(/\.(png|jpg|jpeg|gif)$/i, '.webp');
      
      // Update the column
      columns[13] = `"${webpUrl}"`;
      
      // Join the columns back together
      return columns.join(',');
    }
  }
  
  // Return the line unchanged if no image URL is found or if it's not a GitHub image URL
  return line;
});

// Write the updated content back to the CSV file
fs.writeFileSync(csvPath, updatedLines.join('\n'), 'utf-8');
console.log('CSV file updated to reference WebP images.');