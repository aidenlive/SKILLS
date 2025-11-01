/**
 * Image Optimizer
 *
 * Batch optimize images to modern formats (AVIF, WebP)
 * with responsive sizes and proper compression.
 *
 * Usage:
 *   npm install sharp
 *   node image-optimizer.js [input-dir] [output-dir]
 */

import sharp from 'sharp';
import { readdir, mkdir, stat } from 'fs/promises';
import { join, extname, basename, dirname } from 'path';
import { existsSync } from 'fs';

// Configuration
const INPUT_DIR = process.argv[2] || './public/images';
const OUTPUT_DIR = process.argv[3] || './public/images/optimized';

// Image sizes for responsive images
const RESPONSIVE_SIZES = [400, 800, 1200, 1600];

// Quality settings
const QUALITY = {
  avif: 65, // Higher quality for AVIF (lower cqLevel = higher quality)
  webp: 80,
  jpeg: 85,
  png: 90, // Compression level (0-9)
};

// Supported input formats
const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.tiff'];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get all image files recursively
 */
async function getImageFiles(dir, fileList = []) {
  const files = await readdir(dir);

  for (const file of files) {
    const filePath = join(dir, file);
    const fileStat = await stat(filePath);

    if (fileStat.isDirectory()) {
      await getImageFiles(filePath, fileList);
    } else {
      const ext = extname(file).toLowerCase();
      if (SUPPORTED_FORMATS.includes(ext)) {
        fileList.push(filePath);
      }
    }
  }

  return fileList;
}

/**
 * Optimize single image
 */
async function optimizeImage(inputPath, outputDir) {
  const filename = basename(inputPath, extname(inputPath));
  const originalStat = await stat(inputPath);
  const originalSize = originalStat.size;

  console.log(`\n${colors.cyan}Processing: ${inputPath}${colors.reset}`);

  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    console.log(
      `${colors.gray}  Original: ${metadata.width}x${metadata.height}, ${formatBytes(
        originalSize
      )}${colors.reset}`
    );

    // Ensure output directory exists
    if (!existsSync(outputDir)) {
      await mkdir(outputDir, { recursive: true });
    }

    const results = [];

    // Generate responsive sizes
    for (const width of RESPONSIVE_SIZES) {
      // Skip if image is smaller than target size
      if (metadata.width < width) continue;

      const sizeSuffix = `-${width}w`;

      // AVIF (best compression)
      const avifPath = join(outputDir, `${filename}${sizeSuffix}.avif`);
      await sharp(inputPath)
        .resize(width, null, {
          withoutEnlargement: true,
          fit: 'inside',
        })
        .avif({
          quality: QUALITY.avif,
          effort: 9, // Max compression effort
        })
        .toFile(avifPath);

      const avifStat = await stat(avifPath);
      results.push({
        format: 'AVIF',
        size: width,
        path: avifPath,
        fileSize: avifStat.size,
      });

      // WebP (fallback)
      const webpPath = join(outputDir, `${filename}${sizeSuffix}.webp`);
      await sharp(inputPath)
        .resize(width, null, {
          withoutEnlargement: true,
          fit: 'inside',
        })
        .webp({
          quality: QUALITY.webp,
          effort: 6,
        })
        .toFile(webpPath);

      const webpStat = await stat(webpPath);
      results.push({
        format: 'WebP',
        size: width,
        path: webpPath,
        fileSize: webpStat.size,
      });
    }

    // Also create original size optimized versions
    const avifOriginalPath = join(outputDir, `${filename}.avif`);
    await sharp(inputPath).avif({ quality: QUALITY.avif, effort: 9 }).toFile(avifOriginalPath);

    const avifOriginalStat = await stat(avifOriginalPath);
    results.push({
      format: 'AVIF',
      size: 'original',
      path: avifOriginalPath,
      fileSize: avifOriginalStat.size,
    });

    const webpOriginalPath = join(outputDir, `${filename}.webp`);
    await sharp(inputPath).webp({ quality: QUALITY.webp, effort: 6 }).toFile(webpOriginalPath);

    const webpOriginalStat = await stat(webpOriginalPath);
    results.push({
      format: 'WebP',
      size: 'original',
      path: webpOriginalPath,
      fileSize: webpOriginalStat.size,
    });

    // Generate optimized JPEG/PNG fallback
    const isJpeg = ['.jpg', '.jpeg'].includes(extname(inputPath).toLowerCase());
    const fallbackExt = isJpeg ? '.jpg' : '.png';
    const fallbackPath = join(outputDir, `${filename}${fallbackExt}`);

    if (isJpeg) {
      await sharp(inputPath)
        .jpeg({ quality: QUALITY.jpeg, progressive: true })
        .toFile(fallbackPath);
    } else {
      await sharp(inputPath).png({ compressionLevel: QUALITY.png }).toFile(fallbackPath);
    }

    const fallbackStat = await stat(fallbackPath);
    results.push({
      format: isJpeg ? 'JPEG' : 'PNG',
      size: 'original',
      path: fallbackPath,
      fileSize: fallbackStat.size,
    });

    // Print results
    console.log(`${colors.green}  ✓ Generated ${results.length} optimized versions${colors.reset}`);

    const totalOutputSize = results.reduce((sum, r) => sum + r.fileSize, 0);
    const savings = ((1 - totalOutputSize / originalSize / results.length) * 100).toFixed(1);

    console.log(
      `${colors.gray}  Average size: ${formatBytes(
        totalOutputSize / results.length
      )} (${savings}% smaller)${colors.reset}`
    );

    // Group by format and show best compression
    const byFormat = {};
    results.forEach((r) => {
      if (r.size === 'original') {
        if (!byFormat[r.format]) byFormat[r.format] = r.fileSize;
      }
    });

    Object.entries(byFormat).forEach(([format, size]) => {
      const percent = ((1 - size / originalSize) * 100).toFixed(1);
      console.log(
        `${colors.gray}  ${format}: ${formatBytes(size)} (${percent}% smaller)${colors.reset}`
      );
    });

    return {
      input: inputPath,
      originalSize,
      outputs: results,
      totalSavings: originalSize - totalOutputSize / results.length,
    };
  } catch (error) {
    console.error(`${colors.red}  ✗ Error processing image: ${error.message}${colors.reset}`);
    return null;
  }
}

/**
 * Generate HTML example for responsive images
 */
function generateHTMLExample(filename, sizes) {
  const name = basename(filename, extname(filename));

  const srcsetAVIF = sizes
    .map((size) => `${name}-${size}w.avif ${size}w`)
    .join(',\n    ');

  const srcsetWebP = sizes
    .map((size) => `${name}-${size}w.webp ${size}w`)
    .join(',\n    ');

  return `
<picture>
  <source
    type="image/avif"
    srcset="${srcsetAVIF}"
    sizes="(max-width: 640px) 400px,
           (max-width: 1024px) 800px,
           1200px"
  >
  <source
    type="image/webp"
    srcset="${srcsetWebP}"
    sizes="(max-width: 640px) 400px,
           (max-width: 1024px) 800px,
           1200px"
  >
  <img
    src="${name}.jpg"
    alt="Description"
    width="1200"
    height="800"
    loading="lazy"
  >
</picture>
`.trim();
}

/**
 * Main optimizer
 */
async function optimizeImages() {
  console.log(`${colors.blue}🖼️  Image Optimizer${colors.reset}\n`);
  console.log(`Input:  ${INPUT_DIR}`);
  console.log(`Output: ${OUTPUT_DIR}\n`);

  try {
    const imageFiles = await getImageFiles(INPUT_DIR);

    if (imageFiles.length === 0) {
      console.log(`${colors.yellow}No images found in ${INPUT_DIR}${colors.reset}`);
      return;
    }

    console.log(`Found ${imageFiles.length} image(s) to optimize\n`);

    const allResults = [];

    for (const imagePath of imageFiles) {
      const result = await optimizeImage(imagePath, OUTPUT_DIR);
      if (result) allResults.push(result);
    }

    // Summary
    console.log(`\n${colors.cyan}═══════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.cyan}Summary${colors.reset}`);
    console.log(`${colors.cyan}═══════════════════════════════════════════════════${colors.reset}\n`);

    const totalOriginal = allResults.reduce((sum, r) => sum + r.originalSize, 0);
    const totalSavings = allResults.reduce((sum, r) => sum + r.totalSavings, 0);
    const savingsPercent = ((totalSavings / totalOriginal) * 100).toFixed(1);

    console.log(`Images processed: ${allResults.length}`);
    console.log(`Original total: ${formatBytes(totalOriginal)}`);
    console.log(
      `${colors.green}Average savings: ${formatBytes(
        totalSavings / allResults.length
      )} per image (${savingsPercent}%)${colors.reset}`
    );

    // Example HTML
    if (allResults.length > 0) {
      console.log(`\n${colors.cyan}Example HTML:${colors.reset}\n`);
      console.log(
        colors.gray +
          generateHTMLExample(
            allResults[0].input,
            RESPONSIVE_SIZES.filter((size) => size <= 1200)
          ) +
          colors.reset
      );
    }

    console.log(`\n${colors.green}✓ Optimization complete!${colors.reset}\n`);
  } catch (error) {
    console.error(`${colors.red}Error:${colors.reset}`, error.message);
    process.exit(1);
  }
}

// Run optimizer
optimizeImages().catch(console.error);


/**
 * USAGE EXAMPLES
 */

// 1. Basic usage
//    node image-optimizer.js

// 2. Custom directories
//    node image-optimizer.js ./src/images ./public/optimized

// 3. Add to package.json
/*
{
  "scripts": {
    "optimize:images": "node image-optimizer.js",
    "optimize:images:watch": "nodemon --watch public/images --ext jpg,png image-optimizer.js"
  }
}
*/

// 4. Batch process multiple directories
//    for dir in images/*; do node image-optimizer.js "$dir" "optimized/$dir"; done
