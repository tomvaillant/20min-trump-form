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
    
    // Include auth credentials for production
    const headers = location.hostname !== 'localhost' 
      ? { 'Authorization': 'Basic ' + btoa('20-min:trumpets') }
      : {};
    
    const response = await fetch(dataUrl, { headers });
    if (!response.ok) {
      throw new Error('Failed to load timeline data');
    }
    
    const data = await response.text();
    const rows = data.split('\n');
    const headers = rows[0].split(',');
    
    // Parse the CSV data
    const items = rows.slice(1)
      .filter(row => row.trim() !== '')
      .map(row => {
        const values = row.split(',');
        return {
          date: values[0],
          year: values[1],
          description: values[2],
          description2: values[3] ? values[3].trim() : '',
          description3: values[4] ? values[4].trim() : '',
          description4: values[5] ? values[5].trim() : '',
          description5: values[6] ? values[6].trim() : '',
          description6: values[7] ? values[7].trim() : '',
          image: values[8] ? values[8].trim() : ''
        };
      });
    
    return items;
  } catch (err) {
    console.error('Error loading timeline data:', err);
    throw err;
  }
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
 * Determines the current quarter (Q1, Q2, Q3, Q4) based on current date
 * @returns {string} Current quarter in "Q#" format
 */
export function getCurrentQuarter() {
  const now = new Date();
  const month = now.getMonth() + 1; // getMonth() is zero-indexed
  
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