import { loadContent } from '../content/load.js'
import { validateContent } from '../content/validate.js'

/** `npm run content:check` — prints every integrity error and warning; exits 1 on errors. */
const content = loadContent()
const { errors, warnings } = validateContent(content)

console.log(
  `Content: ${content.destinations.length} destinations, ${content.missions.length} missions, ` +
    `${content.machines.length} machines, ${content.stories.length} stories, ${content.relations.length} relations, ` +
    `${content.sources.length} sources, ${content.media.length} media`,
)
for (const w of warnings) console.log(`WARN  ${w}`)
for (const e of errors) console.log(`ERROR ${e}`)
console.log(`${errors.length} error(s), ${warnings.length} warning(s)`)
process.exitCode = errors.length > 0 ? 1 : 0
