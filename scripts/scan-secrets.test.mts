import { describe, expect, it } from 'vitest';
import { scanTexts } from './scan-secrets.mts';

// Assemblé à l'exécution : écrit en clair, ce fichier serait refusé par le hook secret-guard.
const FAKE_GITHUB = `ghp_${'A1b2'.repeat(10)}`;

describe('scan-secrets', () => {
  it('reports the file and line of a probable secret', () => {
    expect(scanTexts([{ file: 'src/a.ts', text: `// x\nconst t = '${FAKE_GITHUB}';` }])).toEqual([
      { file: 'src/a.ts', label: 'token GitHub', line: 2 },
    ]);
  });

  it('skips binary files and the lockfile', () => {
    expect(
      scanTexts([
        { file: 'public/images/a.png', text: FAKE_GITHUB },
        { file: 'pnpm-lock.yaml', text: FAKE_GITHUB },
      ]),
    ).toEqual([]);
  });

  it('lets clean files through', () => {
    expect(scanTexts([{ file: 'README.md', text: 'No secret here.' }])).toEqual([]);
  });
});
