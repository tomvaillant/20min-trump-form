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
  
  // If field contains comma, newline or double quote, enclose it in double quotes
  if (field.includes(',') || field.includes('\n') || field.includes('"')) {
    // Replace double quotes with two double quotes
    return '"' + field.replace(/"/g, '""') + '"';
  }
  
  return field;
}