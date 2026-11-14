/**
 * `pnpm secrets` : cherche un secret probable dans les fichiers du dépôt (suivis et nouveaux, hors
 * .gitignore) ou, avec --staged, dans le contenu indexé, celui qui part dans le commit. Mêmes
 * motifs que le hook secret-guard de Claude Code : le contrôle couvre aussi les commits humains.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { findSecret } from '../.claude/hooks/secret-guard-core.mts';

const BINARY = /\.(?:png|jpe?g|gif|webp|avif|ico|mp3|ogg|opus|wav|woff2?|ttf|otf|pdf)$/i;
// Fichier généré, plein d'empreintes d'intégrité.
const SKIPPED = new Set(['pnpm-lock.yaml']);

export interface Finding {
  file: string;
  label: string;
  line: number;
}

function git(args: string[]): string {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

function lines(output: string): string[] {
  return output
    .split('\n')
    .map((file) => file.trim())
    .filter(Boolean);
}

export function scanTexts(texts: { file: string; text: string }[]): Finding[] {
  return texts.flatMap(({ file, text }) => {
    if (BINARY.test(file) || SKIPPED.has(file)) return [];
    const secret = findSecret(text);
    return secret ? [{ file, ...secret }] : [];
  });
}

function repositoryTexts(staged: boolean): { file: string; text: string }[] {
  if (staged) {
    return lines(git(['diff', '--cached', '--name-only', '--diff-filter=ACMR'])).map((file) => ({
      file,
      text: BINARY.test(file) ? '' : git(['show', `:${file}`]),
    }));
  }
  return lines(git(['ls-files', '--cached', '--others', '--exclude-standard']))
    .filter((file) => existsSync(file))
    .map((file) => ({ file, text: BINARY.test(file) ? '' : readFileSync(file, 'utf8') }));
}

if (import.meta.main) {
  const found = scanTexts(repositoryTexts(process.argv.includes('--staged')));
  for (const { file, label, line } of found) console.log(`✗ ${file}:${line} : ${label} probable`);
  if (found.length > 0) {
    console.log('\nRetire le secret avant de commiter, et révoque-le s’il est réel.');
    process.exit(1);
  }
  console.log('secrets : aucun secret probable.');
}
