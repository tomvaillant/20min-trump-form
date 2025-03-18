/**
 * Utilities for working with timeline data
 */

// Fetch timeline data from CSV
export async function fetchTimelineData() {
  try {
    const response = await fetch('./timeline-data.csv');
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
          title: values[1],
          description: values[2],
          description2: values[3] ? values[3].trim() : '',
          description3: values[4] ? values[4].trim() : '',
          image: values[5] ? values[5].trim() : '',
          position: values[6] ? values[6].trim() : ''
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