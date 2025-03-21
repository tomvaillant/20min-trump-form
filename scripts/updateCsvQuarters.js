/**
 * Script to update the CSV file with quarter information for existing entries
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the CSV file
const csvPath = path.join(__dirname, '..', 'timeline-data.csv');

// Function to determine quarter from month name or number
function getQuarterFromMonth(monthStr) {
  // Convert month string to number
  let month;
  
  if (!isNaN(monthStr)) {
    // If it's already a number
    month = parseInt(monthStr);
  } else {
    // Convert month name to number
    const monthNames = {
      'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
      'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12,
      'mär': 3, 'märz': 3 // German spelling variants
    };
    
    const normalizedMonth = monthStr.toLowerCase().substring(0, 3);
    month = monthNames[normalizedMonth] || 1;
  }
  
  if (month <= 3) {
    return "Q1";
  } else if (month <= 6) {
    return "Q2";
  } else if (month <= 9) {
    return "Q3";
  } else {
    return "Q4";
  }
}

// Function to escape CSV field if needed
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

// Main function to update the CSV
function updateCsvWithQuarters() {
  try {
    // Read CSV file
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n');
    
    // Process each line
    const updatedLines = lines.map((line, index) => {
      // Skip header or empty lines
      if (index === 0 || !line.trim()) {
        return line;
      }
      
      // Parse the line
      const columns = line.split(',');
      
      // Extract date from first column
      const dateText = columns[0].replace(/"/g, '').trim();
      
      // Extract month part - could be like "Jan 5" or "5 Jan" or just "5"
      const dateParts = dateText.split(' ');
      let monthStr;
      
      // Try to determine the month
      if (dateParts.length > 1) {
        // Could be "Jan 5" or "5 Jan"
        if (isNaN(dateParts[0])) {
          // Format is "Jan 5"
          monthStr = dateParts[0];
        } else {
          // Format is "5 Jan"
          monthStr = dateParts[1];
        }
      } else {
        // Just a number, assume it's the date part
        // Default to current month
        const now = new Date();
        monthStr = (now.getMonth() + 1).toString();
      }
      
      // Determine quarter
      const quarter = getQuarterFromMonth(monthStr);
      
      // If the line already has a quarter, don't modify it
      if (columns.length >= 15 && columns[14] && columns[14].trim()) {
        return line;
      }
      
      // Add quarter to the line or update existing quarter
      if (columns.length >= 15) {
        columns[14] = escapeCSV(quarter);
        return columns.join(',');
      } else {
        // Need to add the quarter column
        return line + ',' + escapeCSV(quarter);
      }
    });
    
    // Write updated content back to file
    fs.writeFileSync(csvPath, updatedLines.join('\n'), 'utf-8');
    console.log('Successfully updated CSV with quarter information');
    
  } catch (error) {
    console.error('Error updating CSV:', error);
  }
}

// Execute the update
updateCsvWithQuarters();