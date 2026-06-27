const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const files = fs.readdirSync(publicDir);

async function optimizeImages() {
  for (const file of files) {
    if (file.endsWith('.jpg') || file.endsWith('.png')) {
      const inputPath = path.join(publicDir, file);
      // We will save it as .webp
      const outputPath = path.join(publicDir, file.replace(/\.(jpg|png)$/, '.webp'));
      
      console.log(`Optimizing ${file}...`);
      await sharp(inputPath)
        .resize(800) // max width 800px is more than enough for hero mobile/desktop 
        .webp({ quality: 80 })
        .toFile(outputPath);
      
      console.log(`Saved ${outputPath}`);
      // Remove original large file to save space
      if (file !== 'og-image.png') { // keep og-image as png if required, or we can leave it
         fs.unlinkSync(inputPath);
      }
    }
  }
}

optimizeImages().catch(console.error);
