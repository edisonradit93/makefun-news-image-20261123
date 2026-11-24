import { runPipeline } from './pipeline.ts';

function printStartupBanner(): void {
  console.log(`
┌──────────────────────────────────────────────────────────────┐
│  MAKE.FUN COMPETITION: news-image-20261123                   │
│  TypeScript News Visual Assets Ingestion & Validation Engine │
│  Target Date: 2026-11-23 | Author: edisonradit93             │
└──────────────────────────────────────────────────────────────┘
  `);
}

function printCompletionSummary(stats: any): void {
  const dest = stats.outputDirectory.length > 38 ? stats.outputDirectory.substring(0, 35) + '...' : stats.outputDirectory;
  console.log(`
┌──────────────────────────────────────────────────────────────┐
│                    COMPLETION SUMMARY                        │
├──────────────────────────────────────────────────────────────┤
│  Status              : SUCCESS                               │
│  Destination         : ${dest.padEnd(38)}│
│  Files Processed     : ${`${stats.copiedFiles} / ${stats.totalFiles}`.padEnd(38)}│
│  Failed / Skipped    : ${`${stats.failedFiles} failed, ${stats.skippedFiles} skipped`.padEnd(38)}│
│  Total Volume        : ${`${(stats.totalBytes / 1024).toFixed(2)} KB`.padEnd(38)}│
│  Duration            : ${`${stats.durationMs} ms`.padEnd(38)}│
│  Throughput          : ${`${stats.throughputMbps.toFixed(2)} Mbps (${stats.itemsPerSecond.toFixed(1)} items/s)`.padEnd(38)}│
└──────────────────────────────────────────────────────────────┘
  `);
}

async function main(): Promise<void> {
  printStartupBanner();
  try {
    const stats = await runPipeline();
    printCompletionSummary(stats);
    process.exit(0);
  } catch (error) {
    console.error('Pipeline execution encountered an error:', error);
    process.exit(1);
  }
}

main();
