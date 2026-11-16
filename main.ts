// ai-excited-01 — "The Koi That Broke the Screen"
//
// The entry image lives beside this file as entry.png (JPEG bytes under
// that name, which the rules allow). This program writes those exact bytes
// to /output/entry.png, so both grading runs produce the same file.
//
// Run it outside the grader's container with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const here = dirname(fileURLToPath(import.meta.url));

const bytes = readFileSync(join(here, 'entry.png'));
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'entry.png'), bytes);
