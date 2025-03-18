/**
 * Utility script to rename existing images according to the convention
 * Usage: node renameImages.js
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Paths
const imagesDir = path.join(__dirname, '..', 'images');
const csvFile = path.join(__dirname, '..', 'timeline-data.csv');

// Function to clean text for filenames
function cleanForFilename(text) {
  return text.replace(/[^\w]/g, '-').toLowerCase();
}

// Function to rename an image file
function renameImage(oldPath, newFilename) {
  const ext = path.extname(oldPath);
  const newPath = path.join(path.dirname(oldPath), newFilename + ext);
  
  try {
    fs.renameSync(oldPath, newPath);
    console.log(`Renamed: ${path.basename(oldPath)} -> ${path.basename(newPath)}`);
    return path.basename(newPath);
  } catch (err) {
    console.error(`Error renaming ${oldPath}:`, err);
    return null;
  }
}

// Main function to process images
async function processImages() {
  console.log('Starting image renaming process...');
  
  // Check if images directory exists
  if (!fs.existsSync(imagesDir)) {
    console.error(`Images directory not found: ${imagesDir}`);
    return;
  }
  
  // Read existing timeline data to get event info
  const results = [];
  
  // Create a promise to read the CSV
  const readCSVPromise = new Promise((resolve, reject) => {
    fs.createReadStream(csvFile)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve())
      .on('error', (err) => reject(err));
  });
  
  try {
    // Wait for CSV to be read
    await readCSVPromise;
    
    // Get list of image files
    const files = fs.readdirSync(imagesDir).filter(file => {
      return ['.jpg', '.jpeg', '.png', '.gif'].includes(path.extname(file).toLowerCase());
    });
    
    console.log(`Found ${files.length} image files to process`);
    
    // Create a map of image paths to entry data
    const imageMap = {};
    results.forEach(entry => {
      const imagePath = entry.image;
      if (imagePath) {
        const filename = path.basename(imagePath);
        imageMap[filename] = {
          date: entry.date || '',
          title: entry.title || '',
          description: entry.description || ''
        };
      }
    });
    
    // Process each file
    const updatedFiles = [];
    
    for (const file of files) {
      const filePath = path.join(imagesDir, file);
      
      // Check if this file is referenced in the CSV
      if (imageMap[file]) {
        const entry = imageMap[file];
        const dateStr = cleanForFilename(entry.date);
        const titleStr = entry.title ? cleanForFilename(entry.title) : 
                        cleanForFilename(entry.description.substring(0, 20));
        
        // Generate new filename with convention + random suffix to prevent collisions
        const randomSuffix = Math.floor(Math.random() * 1000);
        const newFilename = `${dateStr}_${titleStr}_${randomSuffix}`;
        
        // Rename the file
        const newFile = renameImage(filePath, newFilename);
        
        if (newFile) {
          updatedFiles.push({
            oldFile: file,
            newFile: newFile,
            entry: entry
          });
        }
      } else {
        console.log(`Skipping ${file} - not found in timeline data`);
      }
    }
    
    console.log('\nRenaming complete!');
    console.log(`${updatedFiles.length} files renamed successfully`);
    
    // Output CSV updates needed
    if (updatedFiles.length > 0) {
      console.log('\nYou need to update the following references in your CSV file:');
      updatedFiles.forEach(({oldFile, newFile, entry}) => {
        console.log(`For entry "${entry.title || entry.date}": Change ${oldFile} to ${newFile}`);
      });
    }
    
  } catch (err) {
    console.error('Error processing images:', err);
  }
}

// Run the script
processImages().then(() => {
  console.log('Image renaming process completed');
});