/**
 * `npm run secrets` (à la racine) : cherche un secret probable dans les fichiers du dépôt (suivis
 * et nouveaux, hors .gitignore) ou, avec --staged, dans le contenu indexé, celui qui part dans le
 * commit. Node seul, aucune dépendance. Complété en CI par gitleaks sur tout l'historique.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { findSecret } from './secret-patterns.mts'

const BINARY =
  /\.(?:png|jpe?g|gif|webp|avif|ico|svgz|mp3|mp4|webm|ogg|opus|wav|woff2?|ttf|otf|pdf|glb|gltf|bin|drc|wasm|hdr|ktx2)$/i
// Fichiers générés, pleins d'empreintes d'intégrité.
const SKIPPED = /(?:^|\/)package-lock\.json$/

export interface Finding {
  file: string
  label: string
  line: number
}

function git(args: string[]): string {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
}

function lines(output: string): string[] {
  return output
    .split('\n')
    .map((file) => file.trim())
    .filter(Boolean)
}

export function scanTexts(texts: { file: string; text: string }[]): Finding[] {
  return texts.flatMap(({ file, text }) => {
    if (BINARY.test(file) || SKIPPED.test(file)) return []
    const secret = findSecret(text)
    return secret ? [{ file, ...secret }] : []
  })
}

function repositoryTexts(staged: boolean): { file: string; text: string }[] {
  if (staged) {
    return lines(git(['diff', '--cached', '--name-only', '--diff-filter=ACMR'])).map((file) => ({
      file,
      text: BINARY.test(file) ? '' : git(['show', `:${file}`]),
    }))
  }
  return lines(git(['ls-files', '--cached', '--others', '--exclude-standard']))
    .filter((file) => existsSync(file))
    .map((file) => ({ file, text: BINARY.test(file) ? '' : readFileSync(file, 'utf8') }))
}

const isMain = process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href
if (isMain) {
  const found = scanTexts(repositoryTexts(process.argv.includes('--staged')))
  for (const { file, label, line } of found) console.log(`✗ ${file}:${line} : ${label} probable`)
  if (found.length > 0) {
    console.log('\nRetire le secret avant de commiter, et révoque-le s’il est réel.')
    process.exit(1)
  }
  console.log('secrets : aucun secret probable.')
}
