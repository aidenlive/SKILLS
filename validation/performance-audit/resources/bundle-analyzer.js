/**
 * Bundle Size Analyzer
 *
 * Analyze bundle composition, identify large dependencies,
 * and track bundle size over time.
 *
 * Usage:
 *   node bundle-analyzer.js [build-dir]
 */

import { readdir, stat, readFile } from 'fs/promises';
import { join, extname, relative } from 'path';
import { gzipSync, brotliCompressSync } from 'zlib';

// Configuration
const BUNDLE_DIR = process.argv[2] || './dist';
const SIZE_WARNING_KB = 200; // Warn if JS bundle > 200KB
const SIZE_ERROR_KB = 300; // Error if JS bundle > 300KB

// Color output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

/**
 * Get all files in a directory recursively
 */
async function getAllFiles(dir, fileList = []) {
  const files = await readdir(dir);

  for (const file of files) {
    const filePath = join(dir, file);
    const fileStat = await stat(filePath);

    if (fileStat.isDirectory()) {
      await getAllFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  }

  return fileList;
}

/**
 * Get file size info
 */
async function getFileSizeInfo(filePath) {
  const content = await readFile(filePath);
  const ext = extname(filePath);

  // Don't compress already compressed files
  const compressible = ['.js', '.css', '.html', '.json', '.svg', '.txt'].includes(ext);

  const sizes = {
    raw: content.length,
    gzip: compressible ? gzipSync(content).length : content.length,
    brotli: compressible ? brotliCompressSync(content).length : content.length,
  };

  return sizes;
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

/**
 * Get size color based on thresholds
 */
function getSizeColor(sizeKB, type) {
  if (type === 'js') {
    if (sizeKB > SIZE_ERROR_KB) return colors.red;
    if (sizeKB > SIZE_WARNING_KB) return colors.yellow;
    return colors.green;
  }

  if (type === 'css') {
    if (sizeKB > 50) return colors.red;
    if (sizeKB > 30) return colors.yellow;
    return colors.green;
  }

  return colors.reset;
}

/**
 * Analyze bundle
 */
async function analyzeBundle() {
  console.log(`${colors.blue}📦 Bundle Size Analyzer${colors.reset}\n`);
  console.log(`Analyzing: ${BUNDLE_DIR}\n`);

  try {
    const files = await getAllFiles(BUNDLE_DIR);

    // Group files by type
    const grouped = {
      js: [],
      css: [],
      images: [],
      fonts: [],
      other: [],
    };

    for (const file of files) {
      const ext = extname(file);
      const relativePath = relative(BUNDLE_DIR, file);

      const sizes = await getFileSizeInfo(file);

      const fileInfo = {
        path: relativePath,
        ext,
        ...sizes,
      };

      if (['.js', '.mjs'].includes(ext)) {
        grouped.js.push(fileInfo);
      } else if (ext === '.css') {
        grouped.css.push(fileInfo);
      } else if (['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.avif'].includes(ext)) {
        grouped.images.push(fileInfo);
      } else if (['.woff', '.woff2', '.ttf', '.otf', '.eot'].includes(ext)) {
        grouped.fonts.push(fileInfo);
      } else {
        grouped.other.push(fileInfo);
      }
    }

    // Sort by gzipped size (largest first)
    Object.keys(grouped).forEach((key) => {
      grouped[key].sort((a, b) => b.gzip - a.gzip);
    });

    // Print JavaScript bundles
    if (grouped.js.length > 0) {
      console.log(`${colors.cyan}JavaScript Bundles:${colors.reset}`);
      console.log('─'.repeat(80));

      let totalJS = { raw: 0, gzip: 0, brotli: 0 };

      grouped.js.forEach((file) => {
        const gzipKB = file.gzip / 1024;
        const color = getSizeColor(gzipKB, 'js');

        console.log(
          `${file.path.padEnd(50)} ` +
            `${color}${formatBytes(file.raw).padStart(10)}${colors.reset} ` +
            `${colors.gray}→${colors.reset} ` +
            `${color}${formatBytes(file.gzip).padStart(10)} (gzip)${colors.reset} ` +
            `${colors.gray}→${colors.reset} ` +
            `${formatBytes(file.brotli).padStart(10)} (br)`
        );

        totalJS.raw += file.raw;
        totalJS.gzip += file.gzip;
        totalJS.brotli += file.brotli;
      });

      const totalGzipKB = totalJS.gzip / 1024;
      const totalColor = getSizeColor(totalGzipKB, 'js');

      console.log('─'.repeat(80));
      console.log(
        `${'TOTAL'.padEnd(50)} ` +
          `${totalColor}${formatBytes(totalJS.raw).padStart(10)}${colors.reset} ` +
          `${colors.gray}→${colors.reset} ` +
          `${totalColor}${formatBytes(totalJS.gzip).padStart(10)} (gzip)${colors.reset} ` +
          `${colors.gray}→${colors.reset} ` +
          `${formatBytes(totalJS.brotli).padStart(10)} (br)`
      );

      if (totalGzipKB > SIZE_ERROR_KB) {
        console.log(
          `\n${colors.red}❌ ERROR: Total JS bundle size exceeds ${SIZE_ERROR_KB}KB${colors.reset}`
        );
      } else if (totalGzipKB > SIZE_WARNING_KB) {
        console.log(
          `\n${colors.yellow}⚠️  WARNING: Total JS bundle size exceeds ${SIZE_WARNING_KB}KB${colors.reset}`
        );
      } else {
        console.log(`\n${colors.green}✅ JS bundle size looks good!${colors.reset}`);
      }

      console.log('');
    }

    // Print CSS bundles
    if (grouped.css.length > 0) {
      console.log(`${colors.cyan}CSS Stylesheets:${colors.reset}`);
      console.log('─'.repeat(80));

      let totalCSS = { raw: 0, gzip: 0, brotli: 0 };

      grouped.css.forEach((file) => {
        const gzipKB = file.gzip / 1024;
        const color = getSizeColor(gzipKB, 'css');

        console.log(
          `${file.path.padEnd(50)} ` +
            `${color}${formatBytes(file.raw).padStart(10)}${colors.reset} ` +
            `${colors.gray}→${colors.reset} ` +
            `${color}${formatBytes(file.gzip).padStart(10)} (gzip)${colors.reset} ` +
            `${colors.gray}→${colors.reset} ` +
            `${formatBytes(file.brotli).padStart(10)} (br)`
        );

        totalCSS.raw += file.raw;
        totalCSS.gzip += file.gzip;
        totalCSS.brotli += file.brotli;
      });

      console.log('─'.repeat(80));
      console.log(
        `${'TOTAL'.padEnd(50)} ` +
          `${formatBytes(totalCSS.raw).padStart(10)} ` +
          `${colors.gray}→${colors.reset} ` +
          `${formatBytes(totalCSS.gzip).padStart(10)} (gzip) ` +
          `${colors.gray}→${colors.reset} ` +
          `${formatBytes(totalCSS.brotli).padStart(10)} (br)`
      );

      const totalCSSKB = totalCSS.gzip / 1024;
      if (totalCSSKB > 50) {
        console.log(`\n${colors.yellow}⚠️  Consider reducing CSS bundle size${colors.reset}`);
      } else {
        console.log(`\n${colors.green}✅ CSS bundle size looks good!${colors.reset}`);
      }

      console.log('');
    }

    // Print Images summary
    if (grouped.images.length > 0) {
      console.log(`${colors.cyan}Images:${colors.reset}`);
      console.log('─'.repeat(80));

      const imagesByType = {};
      let totalImages = { raw: 0, count: 0 };

      grouped.images.forEach((file) => {
        const type = file.ext;
        if (!imagesByType[type]) {
          imagesByType[type] = { raw: 0, count: 0 };
        }

        imagesByType[type].raw += file.raw;
        imagesByType[type].count += 1;
        totalImages.raw += file.raw;
        totalImages.count += 1;
      });

      Object.entries(imagesByType).forEach(([type, data]) => {
        console.log(
          `${type.padEnd(20)} ${String(data.count).padStart(5)} files    ${formatBytes(
            data.raw
          ).padStart(12)}`
        );
      });

      console.log('─'.repeat(80));
      console.log(
        `${'TOTAL'.padEnd(20)} ${String(totalImages.count).padStart(5)} files    ${formatBytes(
          totalImages.raw
        ).padStart(12)}`
      );

      console.log('');
    }

    // Print Fonts summary
    if (grouped.fonts.length > 0) {
      console.log(`${colors.cyan}Fonts:${colors.reset}`);
      console.log('─'.repeat(80));

      let totalFonts = { raw: 0, count: 0 };

      grouped.fonts.forEach((file) => {
        console.log(`${file.path.padEnd(50)} ${formatBytes(file.raw).padStart(12)}`);
        totalFonts.raw += file.raw;
        totalFonts.count += 1;
      });

      console.log('─'.repeat(80));
      console.log(
        `${'TOTAL'.padEnd(50)} ${formatBytes(totalFonts.raw).padStart(12)} (${
          totalFonts.count
        } files)`
      );

      console.log('');
    }

    // Overall summary
    const totalSize =
      grouped.js.reduce((sum, f) => sum + f.raw, 0) +
      grouped.css.reduce((sum, f) => sum + f.raw, 0) +
      grouped.images.reduce((sum, f) => sum + f.raw, 0) +
      grouped.fonts.reduce((sum, f) => sum + f.raw, 0) +
      grouped.other.reduce((sum, f) => sum + f.raw, 0);

    console.log(`${colors.cyan}Overall Summary:${colors.reset}`);
    console.log('─'.repeat(80));
    console.log(`Total bundle size: ${formatBytes(totalSize)}`);
    console.log(`Total files: ${files.length}`);

    // Recommendations
    console.log(`\n${colors.cyan}💡 Recommendations:${colors.reset}`);

    if (grouped.js.some((f) => f.gzip / 1024 > SIZE_WARNING_KB)) {
      console.log(`${colors.yellow}•${colors.reset} Consider code splitting large JS bundles`);
      console.log(`${colors.gray}  Use dynamic imports: import('./module').then(...)${colors.reset}`);
    }

    if (grouped.images.some((f) => !['.webp', '.avif'].includes(f.ext))) {
      console.log(`${colors.yellow}•${colors.reset} Convert images to modern formats (WebP/AVIF)`);
      console.log(
        `${colors.gray}  Use: npx @squoosh/cli --avif '{"cqLevel": 33}' images/*.jpg${colors.reset}`
      );
    }

    if (grouped.css.some((f) => f.gzip / 1024 > 30)) {
      console.log(`${colors.yellow}•${colors.reset} Remove unused CSS`);
      console.log(`${colors.gray}  Use: npx purgecss --css styles.css --content *.html${colors.reset}`);
    }

    console.log('');
  } catch (error) {
    console.error(`${colors.red}Error analyzing bundle:${colors.reset}`, error.message);
    process.exit(1);
  }
}

// Run analyzer
analyzeBundle().catch(console.error);


/**
 * USAGE IN CI/CD
 */

// Add to package.json:
/*
{
  "scripts": {
    "analyze": "node bundle-analyzer.js dist",
    "build:analyze": "npm run build && npm run analyze"
  }
}
*/

// GitHub Actions example:
/*
- name: Analyze bundle
  run: |
    npm run build
    node bundle-analyzer.js dist
*/
