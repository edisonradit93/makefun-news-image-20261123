import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';

export type ImageFormat = 'png' | 'jpeg' | 'jpg' | 'webp' | 'svg' | 'gif';

export interface ImageValidationResult {
  isValid: boolean;
  format: ImageFormat | 'unknown';
  sizeBytes: number;
  hash: string;
  error?: string;
}

export interface PipelineFileResult {
  sourcePath: string;
  targetPath: string;
  fileName: string;
  format: string;
  sizeBytes: number;
  hash: string;
  status: 'COPIED' | 'FAILED' | 'SKIPPED';
  error?: string;
}

export interface PipelineStats {
  totalFiles: number;
  copiedFiles: number;
  failedFiles: number;
  skippedFiles: number;
  totalBytes: number;
  durationMs: number;
  throughputMbps: number;
  itemsPerSecond: number;
  outputDirectory: string;
}

export interface PipelineOptions {
  inputDir?: string;
  outputDir?: string;
  allowedFormats?: ImageFormat[];
  minSizeBytes?: number;
  maxSizeBytes?: number;
  verbose?: boolean;
}

const DEFAULT_ALLOWED_FORMATS: ImageFormat[] = ['png', 'jpeg', 'jpg', 'webp', 'svg', 'gif'];
const DEFAULT_MIN_SIZE = 16;
const DEFAULT_MAX_SIZE = 50 * 1024 * 1024; // 50MB

export function detectImageFormat(buffer: Buffer, ext: string): ImageFormat | 'unknown' {
  if (buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return 'png';
  }
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'jpeg';
  }
  if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    return 'webp';
  }
  if (buffer.length >= 6 && (buffer.toString('ascii', 0, 6) === 'GIF87a' || buffer.toString('ascii', 0, 6) === 'GIF89a')) {
    return 'gif';
  }
  const snippet = buffer.subarray(0, Math.min(buffer.length, 512)).toString('utf8').trim().toLowerCase();
  if (snippet.includes('<svg') || snippet.startsWith('<?xml')) {
    return 'svg';
  }
  const cleanExt = ext.replace(/^\./, '').toLowerCase();
  if (cleanExt === 'jpg' || cleanExt === 'jpeg') return 'jpeg';
  if (cleanExt === 'png') return 'png';
  if (cleanExt === 'webp') return 'webp';
  if (cleanExt === 'svg') return 'svg';
  if (cleanExt === 'gif') return 'gif';
  return 'unknown';
}

export function computeSha256(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

export function validateImage(
  filePath: string,
  minSize: number = DEFAULT_MIN_SIZE,
  maxSize: number = DEFAULT_MAX_SIZE,
  allowedFormats: ImageFormat[] = DEFAULT_ALLOWED_FORMATS
): ImageValidationResult {
  if (!fs.existsSync(filePath)) {
    return { isValid: false, format: 'unknown', sizeBytes: 0, hash: '', error: `File not found: ${filePath}` };
  }
  const stats = fs.statSync(filePath);
  if (!stats.isFile()) {
    return { isValid: false, format: 'unknown', sizeBytes: 0, hash: '', error: `Path is not a regular file: ${filePath}` };
  }
  if (stats.size < minSize) {
    return { isValid: false, format: 'unknown', sizeBytes: stats.size, hash: '', error: `File size (${stats.size} B) is below minimum (${minSize} B)` };
  }
  if (stats.size > maxSize) {
    return { isValid: false, format: 'unknown', sizeBytes: stats.size, hash: '', error: `File size (${stats.size} B) exceeds maximum (${maxSize} B)` };
  }

  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath);
  const format = detectImageFormat(buffer, ext);

  if (format === 'unknown') {
    return { isValid: false, format: 'unknown', sizeBytes: stats.size, hash: '', error: `Unrecognized image binary format for ${filePath}` };
  }

  if (!allowedFormats.includes(format)) {
    return { isValid: false, format, sizeBytes: stats.size, hash: '', error: `Image format '${format}' not in allowed list` };
  }

  const hash = computeSha256(buffer);
  return { isValid: true, format, sizeBytes: stats.size, hash };
}

export function createSampleNewsImages(targetDir: string): string[] {
  fs.mkdirSync(targetDir, { recursive: true });
  const createdFiles: string[] = [];

  // 1. World Summit PNG
  const png1x1 = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
    0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41,
    0x54, 0x08, 0xd7, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
    0x00, 0x03, 0x01, 0x01, 0x00, 0x18, 0xdd, 0x8d,
    0xb0, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e,
    0x44, 0xae, 0x42, 0x60, 0x82
  ]);
  const p1 = path.join(targetDir, 'news-20261123-world-summit.png');
  fs.writeFileSync(p1, png1x1);
  createdFiles.push(p1);

  // 2. Global Climate Accord JPEG
  const jpg1x1 = Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46,
    0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
    0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43,
    0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
    0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0a, 0x0c,
    0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12,
    0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d,
    0x1a, 0x1c, 0x1c, 0x20, 0x24, 0x2e, 0x27, 0x20,
    0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29,
    0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27,
    0x39, 0x3d, 0x38, 0x32, 0x3c, 0x2e, 0x33, 0x34,
    0x32, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01,
    0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4,
    0x00, 0x1f, 0x00, 0x00, 0x01, 0x05, 0x01, 0x01,
    0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04,
    0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0xff,
    0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f,
    0x00, 0xbf, 0x00, 0xff, 0xd9
  ]);
  const p2 = path.join(targetDir, 'news-20261123-climate-accord.jpg');
  fs.writeFileSync(p2, jpg1x1);
  createdFiles.push(p2);

  // 3. Tech AI Breakthrough SVG
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <circle cx="400" cy="300" r="160" fill="none" stroke="#38bdf8" stroke-width="4"/>
  <text x="400" y="280" font-family="system-ui, sans-serif" font-size="28" fill="#f8fafc" text-anchor="middle" font-weight="bold">WORLD NEWS • 23 NOV 2026</text>
  <text x="400" y="330" font-family="system-ui, sans-serif" font-size="18" fill="#94a3b8" text-anchor="middle">Next-Gen Autonomous Intelligence Breakthrough</text>
</svg>`;
  const p3 = path.join(targetDir, 'news-20261123-ai-breakthrough.svg');
  fs.writeFileSync(p3, svgContent, 'utf8');
  createdFiles.push(p3);

  // 4. Mars Sample Return PNG
  const p4 = path.join(targetDir, 'news-20261123-mars-sample-return.png');
  fs.writeFileSync(p4, png1x1);
  createdFiles.push(p4);

  // 5. Global Economy WebP
  const webpData = Buffer.from([
    0x52, 0x49, 0x46, 0x46, 0x1a, 0x00, 0x00, 0x00,
    0x57, 0x45, 0x42, 0x50, 0x56, 0x50, 0x38, 0x4c,
    0x0d, 0x00, 0x00, 0x00, 0x2f, 0x00, 0x00, 0x00,
    0x00, 0x07, 0x10, 0x88, 0x88, 0x08, 0x00, 0x00
  ]);
  const p5 = path.join(targetDir, 'news-20261123-global-economy.webp');
  fs.writeFileSync(p5, webpData);
  createdFiles.push(p5);

  return createdFiles;
}

export function copyFileWithValidation(
  sourcePath: string,
  targetPath: string,
  allowedFormats: ImageFormat[] = DEFAULT_ALLOWED_FORMATS
): PipelineFileResult {
  const fileName = path.basename(sourcePath);
  const validation = validateImage(sourcePath, DEFAULT_MIN_SIZE, DEFAULT_MAX_SIZE, allowedFormats);

  if (!validation.isValid) {
    return {
      sourcePath,
      targetPath,
      fileName,
      format: validation.format,
      sizeBytes: validation.sizeBytes,
      hash: validation.hash,
      status: 'FAILED',
      error: validation.error
    };
  }

  try {
    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    fs.copyFileSync(sourcePath, targetPath);

    // Verify written file
    const targetValidation = validateImage(targetPath, DEFAULT_MIN_SIZE, DEFAULT_MAX_SIZE, allowedFormats);
    if (!targetValidation.isValid || targetValidation.hash !== validation.hash) {
      return {
        sourcePath,
        targetPath,
        fileName,
        format: validation.format,
        sizeBytes: validation.sizeBytes,
        hash: validation.hash,
        status: 'FAILED',
        error: `Post-copy hash verification failed: source ${validation.hash} != target ${targetValidation.hash}`
      };
    }

    return {
      sourcePath,
      targetPath,
      fileName,
      format: validation.format,
      sizeBytes: validation.sizeBytes,
      hash: validation.hash,
      status: 'COPIED'
    };
  } catch (err: any) {
    return {
      sourcePath,
      targetPath,
      fileName,
      format: validation.format,
      sizeBytes: validation.sizeBytes,
      hash: validation.hash,
      status: 'FAILED',
      error: err?.message || String(err)
    };
  }
}

export async function runPipeline(options: PipelineOptions = {}): Promise<PipelineStats> {
  const startTime = Date.now();
  const startHrTime = process.hrtime.bigint();
  const inputDir = options.inputDir || process.env.MAKEFUN_INPUT_DIR || path.join(process.cwd(), 'input');
  const outputDir = options.outputDir || process.env.MAKEFUN_OUTPUT_DIR || path.join(process.cwd(), 'out');
  const allowedFormats = options.allowedFormats || DEFAULT_ALLOWED_FORMATS;
  const verbose = options.verbose ?? true;

  if (verbose) {
    console.log(`[Pipeline] Initializing News Image Pipeline (Competition: news-image-20261123)`);
    console.log(`[Pipeline] Source directory: ${inputDir}`);
    console.log(`[Pipeline] Target directory: ${outputDir}`);
  }

  // Ensure input directory has images
  let sourceFiles: string[] = [];
  if (fs.existsSync(inputDir)) {
    sourceFiles = fs.readdirSync(inputDir)
      .filter(f => !f.startsWith('.'))
      .map(f => path.join(inputDir, f))
      .filter(f => fs.statSync(f).isFile());
  }

  if (sourceFiles.length === 0) {
    if (verbose) {
      console.log(`[Pipeline] No images found in input dir. Generating benchmark news images for 2026-11-23...`);
    }
    sourceFiles = createSampleNewsImages(inputDir);
  }

  fs.mkdirSync(outputDir, { recursive: true });

  const results: PipelineFileResult[] = [];
  let totalBytes = 0;
  let copiedCount = 0;
  let failedCount = 0;
  let skippedCount = 0;

  for (const src of sourceFiles) {
    const fileName = path.basename(src);
    const dest = path.join(outputDir, fileName);
    const res = copyFileWithValidation(src, dest, allowedFormats);
    results.push(res);

    if (res.status === 'COPIED') {
      copiedCount++;
      totalBytes += res.sizeBytes;
      if (verbose) {
        console.log(`  ✓ [COPY] ${fileName} (${res.format.toUpperCase()}, ${res.sizeBytes} B, SHA: ${res.hash.substring(0, 10)}...)`);
      }
    } else if (res.status === 'FAILED') {
      failedCount++;
      if (verbose) {
        console.error(`  ✗ [FAIL] ${fileName}: ${res.error}`);
      }
    } else {
      skippedCount++;
    }
  }

  // =========================================================================
  // High-Resolution Execution Timing & Throughput Calculation Block
  // =========================================================================
  const endHrTime = process.hrtime.bigint();
  const durationNs = Number(endHrTime - startHrTime);
  const durationMs = Math.max(1, Math.round(durationNs / 1_000_000));
  const durationSeconds = Math.max(0.0001, durationNs / 1_000_000_000);
  const throughputMBs = (totalBytes / (1024 * 1024)) / durationSeconds;
  const throughputMbps = (totalBytes * 8) / (durationSeconds * 1_000_000);
  const itemsPerSecond = copiedCount / durationSeconds;

  if (verbose) {
    console.log(`\n================== PIPELINE METRICS & THROUGHPUT ==================`);
    console.log(`  Execution Time   : ${durationMs} ms (${durationSeconds.toFixed(4)} s)`);
    console.log(`  Processed Files  : ${copiedCount} succeeded, ${failedCount} failed, ${skippedCount} skipped`);
    console.log(`  Total Data Size  : ${(totalBytes / 1024).toFixed(2)} KB (${totalBytes} bytes)`);
    console.log(`  Throughput Rate  : ${throughputMBs.toFixed(2)} MB/s (${throughputMbps.toFixed(2)} Mbps)`);
    console.log(`  Processing Speed : ${itemsPerSecond.toFixed(2)} items/sec`);
    console.log(`===================================================================\n`);
  }

  // Write manifest to output directory
  const manifest = {
    competition: 'news-image-20261123',
    date: '2026-11-23',
    generatedAt: new Date().toISOString(),
    stats: {
      totalFiles: sourceFiles.length,
      copiedFiles: copiedCount,
      failedFiles: failedCount,
      skippedFiles: skippedCount,
      totalBytes,
      durationMs,
      throughputMbps: parseFloat(throughputMbps.toFixed(4)),
      itemsPerSecond: parseFloat(itemsPerSecond.toFixed(2))
    },
    files: results
  };

  fs.writeFileSync(path.join(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

  return {
    totalFiles: sourceFiles.length,
    copiedFiles: copiedCount,
    failedFiles: failedCount,
    skippedFiles: skippedCount,
    totalBytes,
    durationMs,
    throughputMbps,
    itemsPerSecond,
    outputDirectory: outputDir
  };
}
