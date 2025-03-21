/**
 * Script to clean up original image files after WebP conversion
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const imagesDir = path.join(__dirname, '..', 'images');

// Get all image files
const files = fs.readdirSync(imagesDir);

// Filter original image files (PNG, JPG, etc.) that have a corresponding WebP version
const originalFiles = files.filter(file => {
  const extension = path.extname(file).toLowerCase();
  if (!['.png', '.jpg', '.jpeg', '.gif'].includes(extension)) {
    return false; // Skip non-image files and WebP files
  }
  
  // Check if a corresponding WebP file exists
  const fileBase = path.basename(file, extension);
  return files.includes(`${fileBase}.webp`);
});

// Delete original files
let deletedCount = 0;
originalFiles.forEach(file => {
  const filePath = path.join(imagesDir, file);
  try {
    fs.unlinkSync(filePath);
    console.log(`Deleted original file: ${file}`);
    deletedCount++;
  } catch (error) {
    console.error(`Error deleting ${file}:`, error);
  }
});

console.log(`\nCleanup complete. ${deletedCount} original image files deleted.`);