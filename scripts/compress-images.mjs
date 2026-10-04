import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logosDir = path.join(__dirname, '../public/logos');

async function optimizeImages() {
  try {
    const files = await fs.readdir(logosDir);
    
    for (const file of files) {
      if (file.endsWith('.webp')) continue; // Skip already converted files
      
      const filePath = path.join(logosDir, file);
      const parsedPath = path.parse(filePath);
      const outputPath = path.join(logosDir, `${parsedPath.name}.webp`);

      console.log(`Optimizing ${file}...`);

      await sharp(filePath)
        .webp({ quality: 80, effort: 6 }) // quality 80 is good balance, effort 6 is max compression
        .toFile(outputPath);
      
      console.log(`Created ${parsedPath.name}.webp`);
      
      // Optional: uncomment if you want to delete original images
      // await fs.unlink(filePath);
    }
    console.log('All images optimized!');
  } catch (err) {
    console.error('Error optimizing images:', err);
  }
}

optimizeImages();
