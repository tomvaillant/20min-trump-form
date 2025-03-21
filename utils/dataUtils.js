/**
 * Utilities for working with timeline data
 */

import { getDataUrl } from './config.js';

// Fetch timeline data from CSV using GitHub raw URLs
export async function fetchTimelineData() {
  try {
    // In development, use local file
    // In production on GitHub Pages, use the raw GitHub URL
    const dataUrl = location.hostname === 'localhost' ? './timeline-data.csv' : getDataUrl();
    
    const response = await fetch(dataUrl);
    if (!response.ok) {
      throw new Error('Failed to load timeline data');
    }
    
    const data = await response.text();
    return parseTimelineData(data);
  } catch (err) {
    console.error('Error loading timeline data:', err);
    throw err;
  }
}

/**
 * Parse CSV timeline data 
 */
export function parseTimelineData(csvData) {
  if (!csvData) return [];
  
  const rows = csvData.split('\n');
  const items = rows.slice(1)  // Skip header row
    .filter(row => row.trim() !== '')
    .map(row => {
      // Basic CSV parsing (doesn't handle quoted fields with commas properly)
      const values = row.split(',');
      return {
        date: values[0] || '',
        year: values[1] || '',
        description: values[2] || '',
        description2: values[3] || '',
        description3: values[4] || '',
        description4: values[5] || '',
        description5: values[6] || '',
        description6: values[7] || '',
        link: values[8] || '',
        link2: values[9] || '',
        link3: values[10] || '',
        link4: values[11] || '',
        link5: values[12] || '',
        link6: values[13] || '',
        imagePath: values[14] || '',
        quarter: values[15] || ''
      };
    });
  
  return items;
}

// Escape CSV field to handle commas and quotes
export function escapeCSV(field) {
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

/**
 * Determines the current quarter (YYYY-Q#) based on current date
 * @returns {string} Current quarter in "YYYY-Q#" format
 */
export function getCurrentQuarter() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // getMonth() is zero-indexed
  
  // Determine quarter
  let quarter;
  if (month <= 3) {
    quarter = "Q1";
  } else if (month <= 6) {
    quarter = "Q2";
  } else if (month <= 9) {
    quarter = "Q3";
  } else {
    quarter = "Q4";
  }
  
  return `${year}-${quarter}`;
}

/**
 * Determines the quarter based on a month name or number
 * @param {string} monthStr - Month string like "Jan", "Feb", or number 1-12
 * @returns {string} Quarter in "Q#" format
 */
export function getQuarterFromMonth(monthStr) {
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