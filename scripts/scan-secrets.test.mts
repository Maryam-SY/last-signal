import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { scanTexts } from './scan-secrets.mts'

// Assemblé à l'exécution : écrit en clair, ce fichier serait lui-même signalé.
const FAKE_GITHUB = `ghp_${'A1b2'.repeat(10)}`

describe('scan-secrets', () => {
  it('reports the file and line of a probable secret', () => {
    assert.deepEqual(scanTexts([{ file: 'frontend/src/a.ts', text: `// x\nconst t = '${FAKE_GITHUB}'` }]), [
      { file: 'frontend/src/a.ts', label: 'token GitHub', line: 2 },
    ])
  })

  it('reports a secret written in clear in an env file', () => {
    assert.deepEqual(scanTexts([{ file: 'backend/.env', text: 'PORT=3000\nAPI_TOKEN=s3cr3tValue42' }]), [
      { file: 'backend/.env', label: 'secret en clair', line: 2 },
    ])
  })

  it('skips binary files and the lockfiles', () => {
    assert.deepEqual(
      scanTexts([
        { file: 'frontend/public/a.png', text: FAKE_GITHUB },
        { file: 'frontend/package-lock.json', text: FAKE_GITHUB },
      ]),
      [],
    )
  })

  it('lets placeholders and clean files through', () => {
    assert.deepEqual(
      scanTexts([
        { file: 'README.md', text: 'No secret here.' },
        { file: 'docs/x.md', text: 'apiKey = "<your-key>"' },
      ]),
      [],
    )
  })
})
