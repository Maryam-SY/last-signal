import 'dotenv/config'
import { createApp } from './app.js'
import { loadContent } from './content/load.js'
import { validateContent } from './content/validate.js'

const PORT = Number(process.env.PORT ?? 3000)

const content = loadContent()
const { warnings } = validateContent(content)
if (warnings.length > 0) {
  console.warn(`Content warnings (${warnings.length}) — run "npm run content:check" for details.`)
}

createApp({ content }).listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
