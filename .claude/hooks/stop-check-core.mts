/**
 * Vérification de fin de tour de Claude Code (hook `Stop`) : format, lint et types des seuls
 * fichiers changés. Logique pure ; git et pnpm sont dans stop-check.mts.
 */

export interface StopCheckInput {
  /** L'agent continue déjà à cause de ce hook (`stop_hook_active`). */
  stopHookActive: boolean;
  /** `STOP_CHECK=off`. */
  disabled: boolean;
  /** Fichiers modifiés, supprimés ou nouveaux depuis la base (commits, index, arbre). */
  changedFiles: string[];
}

export type StopCheckPlan =
  | { run: false; reason: string }
  | { run: true; files: string[]; block: boolean };

export interface CheckCommand {
  label: string;
  command: string;
  args: string[];
}

export interface CheckFailure {
  label: string;
  output: string;
}

const OUTPUT_TAIL_LINES = 40;
const LINTABLE = /\.(?:[cm]?[jt]sx?)$/;
/** Fichiers qui peuvent casser les types de l'application (code, contenu JSON, configs). */
const TYPED = /\.(?:[cm]?[jt]sx?|json)$/;
const HOOKS_DIR = '.claude/hooks/';

export function planStopCheck(input: StopCheckInput): StopCheckPlan {
  if (input.disabled) return { run: false, reason: 'STOP_CHECK=off' };
  const files = [...new Set(input.changedFiles)].sort();
  if (files.length === 0) return { run: false, reason: 'aucun fichier changé' };
  // Une seconde fin de tour après un blocage n'est qu'avertie : sinon un échec que l'agent ne
  // sait pas corriger le ferait tourner en boucle.
  return { run: true, files, block: !input.stopHookActive };
}

/**
 * `existing` : les fichiers de `files` encore présents. Une suppression ne se formate ni ne se
 * lint, mais elle peut casser les types (un import vers un fichier supprimé).
 */
export function checkCommands(files: string[], existing: string[]): CheckCommand[] {
  const commands: CheckCommand[] = [];
  // Sans chemin, oxfmt et oxlint vérifieraient tout le dépôt.
  if (existing.length > 0) {
    commands.push({
      label: 'format',
      command: 'pnpm',
      args: ['exec', 'oxfmt', '--check', '--no-error-on-unmatched-pattern', ...existing],
    });
  }
  const lintable = existing.filter((file) => LINTABLE.test(file));
  if (lintable.length > 0) {
    commands.push({ label: 'lint', command: 'pnpm', args: ['exec', 'oxlint', ...lintable] });
  }
  // Un seul package : un fichier typé changé (ou supprimé) relance le typecheck de l'application.
  const appFiles = files.filter((file) => TYPED.test(file) && !file.startsWith(HOOKS_DIR));
  if (appFiles.length > 0) {
    commands.push({ label: 'typecheck', command: 'pnpm', args: ['run', 'typecheck'] });
  }
  if (files.some((file) => file.startsWith(HOOKS_DIR))) {
    commands.push({
      label: 'typecheck (hooks)',
      command: 'pnpm',
      args: ['exec', 'tsc', '-p', HOOKS_DIR],
    });
  }
  return commands;
}

export function failureReport(failures: CheckFailure[]): string {
  const sections = failures.map(({ label, output }) => {
    const tail = output.trimEnd().split('\n').slice(-OUTPUT_TAIL_LINES).join('\n');
    return `### ${label}\n\n${tail}`;
  });
  return [
    `Vérification de fin de tour en échec (${failures.map((f) => f.label).join(' ; ')}).`,
    "Corrige avant de rendre la main : `pnpm format` règle le format ; pour le lint et les types, lis l'erreur ci-dessous.",
    "Si l'échec vient de fichiers qui ne sont pas les tiens, dis-le à l'utilisateur au lieu de les modifier.",
    ...sections,
  ].join('\n\n');
}
