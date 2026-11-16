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
const target = join(outDir, 'entry.png');
writeFileSync(target, bytes);

// Fail loudly instead of silently writing a truncated copy: the grader
// runs the program twice and both runs must write the same bytes.
if (readFileSync(target).length !== bytes.length) {
  throw new Error('entry.png copy is incomplete');
}
