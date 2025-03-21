/**
 * Script to convert all images in the images directory to WebP format
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const imagesDir = path.join(__dirname, '..', 'images');

// Ensure WebP output directory exists
const webpOutputDir = path.join(__dirname, '..', 'images', 'webp');
if (!fs.existsSync(webpOutputDir)) {
  fs.mkdirSync(webpOutputDir, { recursive: true });
}

// Get all images in the directory
const imageFiles = fs.readdirSync(imagesDir).filter(file => {
  const extension = path.extname(file).toLowerCase();
  // Only process image files and skip any existing WebP files
  return ['.png', '.jpg', '.jpeg', '.gif'].includes(extension) && !file.endsWith('.webp');
});

// Counter for completion tracking
let completedCount = 0;

// Process each image
async function processImages() {
  console.log(`Found ${imageFiles.length} images to convert to WebP.`);

  // Process images
  for (const file of imageFiles) {
    const inputPath = path.join(imagesDir, file);
    const fileInfo = path.parse(file);
    const outputPath = path.join(imagesDir, `${fileInfo.name}.webp`);

    try {
      await sharp(inputPath)
        .webp({ quality: 80 }) // Good balance of quality and compression
        .toFile(outputPath);

      completedCount++;
      console.log(`Converted (${completedCount}/${imageFiles.length}): ${file} → ${fileInfo.name}.webp`);
    } catch (error) {
      console.error(`Error converting ${file}:`, error);
    }
  }

  console.log(`\nConversion complete. ${completedCount} images converted to WebP format.`);
  
  // Calculate space savings
  const originalSize = imageFiles.reduce((total, file) => {
    const stats = fs.statSync(path.join(imagesDir, file));
    return total + stats.size;
  }, 0);
  
  const webpSize = imageFiles.reduce((total, file) => {
    const webpFile = path.join(imagesDir, `${path.parse(file).name}.webp`);
    if (fs.existsSync(webpFile)) {
      const stats = fs.statSync(webpFile);
      return total + stats.size;
    }
    return total;
  }, 0);
  
  const savedBytes = originalSize - webpSize;
  const savingsPercent = (savedBytes / originalSize) * 100;
  
  console.log(`Original size: ${(originalSize / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`WebP size: ${(webpSize / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`Saved: ${(savedBytes / (1024 * 1024)).toFixed(2)} MB (${savingsPercent.toFixed(2)}%)`);
}

// Run the conversion
processImages().catch(error => {
  console.error('Error during conversion:', error);
});