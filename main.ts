// Have You Tried Turning It Off? — one line from a hopeless tech
// support agent to a desperate customer.
//
// The gag turns the oldest fix in support on its head. The agent
// opens with the classic — turn it off and on again — and then, instead
// of promising it will work, volunteers to stay on the line for the
// restart. Not to fix anything. Just to keep the customer company
// through the part where nothing changes. The humour is all in the
// agent's cheerful uselessness: he knows the ritual is empty, says so
// out loud, and treats that as customer service. The customer is never
// the butt of it — the agent is, for selling a cure he has already
// admitted will not cure anything.
//
// The program writes that one line to a file called entry.txt and then
// stops. It is deliberately boring: it takes no arguments, reads no
// input, touches no network, looks at no clock, and rolls no dice. The
// same run always produces the same bytes.
//
// Node standard library only.

import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const LINE =
  "Let's turn it off and on again — I'll stay on the line while it restarts, for the part where nothing changes.";

// The gate counts characters, and it accepts 1 to 199 of them.
const MAX_CHARS = 199;
const OUT_NAME = 'entry.txt';

function charCount(text: string): number {
  // Spread into code points: .length would count a character outside
  // the basic multilingual plane as two, and the gate counts characters.
  return [...text].length;
}

function findProblem(): string | null {
  const n = charCount(LINE);
  if (n === 0) {
    return 'the line is empty';
  }
  if (n > MAX_CHARS) {
    return `the line is ${n} characters, over the ${MAX_CHARS} allowed`;
  }
  if (LINE.includes('\n') || LINE.includes('\r')) {
    return 'the line must be a single line with no newline in it';
  }
  if (LINE !== LINE.trim()) {
    return 'the line must not start or end with a space';
  }
  return null;
}

function outDir(): string {
  // The harness hands the program its output folder through the
  // environment; running it by hand falls back to /output.
  const given = process.env.MAKEFUN_OUTPUT_DIR;
  if (given !== undefined && given !== '') {
    return given;
  }
  return '/output';
}

function main(): void {
  const problem = findProblem();
  if (problem !== null) {
    process.stderr.write(`entry: ${problem}\n`);
    process.exit(1);
  }
  const dir = outDir();
  mkdirSync(dir, { recursive: true });
  const target = join(dir, OUT_NAME);
  writeFileSync(target, LINE, 'utf-8');
  const back = readFileSync(target, 'utf-8');
  if (back !== LINE) {
    process.stderr.write('entry: what came back from disk is not the line\n');
    process.exit(1);
  }
  const digest = createHash('sha256').update(back, 'utf-8').digest('hex');
  process.stdout.write(
    `entry: wrote ${target} (${charCount(LINE)} characters, sha256 ${digest})\n`,
  );
}

main();
