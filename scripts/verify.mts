/**
 * `pnpm verify` : la vérification avant commit (lefthook lance `pnpm verify --staged`).
 * Secrets, format et lint des fichiers concernés, puis types et tests de tout le projet (le projet
 * est petit : quelques secondes).
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const staged = process.argv.includes('--staged');
const LINTABLE = /\.(?:[cm]?[jt]sx?)$/;

function run(command: string, args: string[]): { status: number | null; output: string } {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    // Sous Windows, pnpm est un script (pnpm.cmd) : il faut un shell pour le lancer.
    shell: process.platform === 'win32',
  });
  return { status: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` };
}

const listed = staged
  ? run('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMR'])
  : run('git', ['ls-files', '--modified', '--others', '--exclude-standard']);
const files = [...new Set(listed.output.split('\n').map((f) => f.trim()))].filter(
  (file) => file && existsSync(file),
);
if (files.length === 0) {
  console.log('verify : aucun fichier modifié.');
  process.exit(0);
}

const commands: { label: string; args: string[] }[] = [
  { label: 'secrets', args: ['-s', 'secrets', ...(staged ? ['--staged'] : [])] },
  {
    label: 'format',
    args: ['exec', 'oxfmt', '--check', '--no-error-on-unmatched-pattern', ...files],
  },
];
const lintable = files.filter((file) => LINTABLE.test(file));
if (lintable.length > 0) commands.push({ label: 'lint', args: ['exec', 'oxlint', ...lintable] });
commands.push(
  { label: 'typecheck', args: ['-s', 'typecheck'] },
  { label: 'test', args: ['-s', 'test'] },
);

const failures: string[] = [];
for (const { label, args } of commands) {
  const { status, output } = run('pnpm', args);
  console.log(`${status === 0 ? '✓' : '✗'} ${label}`);
  if (status !== 0) {
    failures.push(label);
    console.log(output.trimEnd().split('\n').slice(-40).join('\n'));
  }
}
if (failures.length > 0) {
  console.log(`\nverify en échec (${failures.join(' ; ')}). \`pnpm format\` règle le format.`);
  process.exit(1);
}
console.log(`verify : ${files.length} fichier(s), tout est vert.`);
