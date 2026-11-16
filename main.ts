// The Koi That Broke the Screen — make.fun ai-excited-01 entry.
//
// What this program does, in one breath: it takes the entry image that
// ships with this repository (entry.png, a JPEG despite the name — the
// competition tells PNG and JPEG apart by their first bytes) and writes
// it, byte for byte, to $MAKEFUN_OUTPUT_DIR/entry.png (or /output when
// the variable is unset, which is where the grader looks).
//
// Why a copy instead of a drawing: the image is the entry. The program's
// job is to deliver it intact, so it checks the bytes twice — once before
// the copy, once after — and refuses to report success unless the file it
// wrote is identical to the file it read. Two runs therefore always
// produce the same bytes: the program never generates, transforms, or
// re-encodes anything.
//
// No network, no dependencies, Node 22 standard library only.

import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_DIR = dirname(fileURLToPath(import.meta.url));
const SOURCE_PATH = join(REPO_DIR, "entry.png");

const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const TARGET_PATH = join(OUTPUT_DIR, "entry.png");

// A JPEG starts with FF D8 FF and ends with the end-of-image marker FF D9.
// Anything else means the bundled image is damaged, and writing it out
// would hand the judge a broken file — fail loudly instead.
function assertJpegComplete(bytes: Buffer): void {
  const startsAsJpeg = bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const endsWithEoi =
    bytes.length >= 2 && bytes[bytes.length - 2] === 0xff && bytes[bytes.length - 1] === 0xd9;
  if (!startsAsJpeg) {
    throw new Error("entry.png is not a JPEG (missing FF D8 FF magic bytes)");
  }
  if (!endsWithEoi) {
    throw new Error("entry.png is truncated (missing FF D9 end-of-image marker)");
  }
  if (bytes.length > 1_048_576) {
    throw new Error(`entry.png is ${bytes.length} bytes, over the 1 MiB limit`);
  }
}

function sha256(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function main(): void {
  if (!existsSync(SOURCE_PATH)) {
    throw new Error(`bundled image not found: ${SOURCE_PATH}`);
  }

  const sourceBytes = readFileSync(SOURCE_PATH);
  assertJpegComplete(sourceBytes);
  const sourceHash = sha256(sourceBytes);

  mkdirSync(OUTPUT_DIR, { recursive: true });
  copyFileSync(SOURCE_PATH, TARGET_PATH);

  // Verify the copy, not the intent: read back what actually landed on
  // disk and compare size and hash against the source bytes, and confirm
  // the written file is itself a complete JPEG (a hash match alone would
  // also pass if the source were somehow already damaged, so the marker
  // check runs on the output too).
  const writtenBytes = readFileSync(TARGET_PATH);
  const writtenHash = sha256(writtenBytes);
  const writtenSize = statSync(TARGET_PATH).size;
  assertJpegComplete(writtenBytes);

  if (writtenSize !== sourceBytes.length) {
    throw new Error(
      `copy incomplete: wrote ${writtenSize} bytes, expected ${sourceBytes.length}`,
    );
  }
  if (writtenHash !== sourceHash) {
    throw new Error(`copy corrupted: sha256 ${writtenHash} != source ${sourceHash}`);
  }

  console.log(`wrote ${TARGET_PATH} (${writtenSize} bytes, sha256 ${writtenHash})`);
}

main();
