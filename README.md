# makefun-news-image-20261123

[![make.fun · news-image-20261123](https://make.fun/badge/news-image-20261123.svg)](https://make.fun/bounty/news-image-20261123?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261123)
[![rank](https://make.fun/badge/news-image-20261123/edisonradit93/makefun-news-image-20261123/rank.svg)](https://make.fun/bounty/news-image-20261123/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261123)
[![reward](https://make.fun/badge/news-image-20261123/edisonradit93/makefun-news-image-20261123/reward.svg)](https://make.fun/bounty/news-image-20261123/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261123)

An optimized TypeScript pipeline for processing, validating, and transferring daily news visual assets for the make.fun `news-image-20261123` competition.

## Overview

This repository provides an automated image ingestion and verification system designed for high reliability, throughput, and cryptographic verification of 23 November 2026 news imagery.

### Core Capabilities

- **Multi-Format Magic Byte Verification**: Validates binary headers for PNG, JPEG, WebP, and SVG assets.
- **Integrity Validation**: Computes SHA-256 hashes before and after copying to ensure byte-perfect asset transfers.
- **Throughput Metrics**: Records processing duration, transfer speed (Mbps), and item throughput (items/sec).
- **Audit Manifest**: Generates a structured `manifest.json` with execution statistics and per-file audit entries.

## Getting Started

### Prerequisites

- Node.js (v22.0.0 or higher with TypeScript support)

### Execution

To run the pipeline with the specified target output directory:

```bash
# PowerShell
$env:MAKEFUN_OUTPUT_DIR="out"
node main.ts
```

```bash
# Bash
MAKEFUN_OUTPUT_DIR=out node main.ts
```

### Configuration

The pipeline supports the following environment variables:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `MAKEFUN_INPUT_DIR` | Path to source images directory | `./input` |
| `MAKEFUN_OUTPUT_DIR` | Path to destination output directory | `./out` |

## Verification & Output

Upon completion, all processed images alongside a comprehensive `manifest.json` will be located in the directory specified by `MAKEFUN_OUTPUT_DIR`.
