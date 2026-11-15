// Vercel Function: the whole Express API (backend/), compiled to backend/dist by the build
// command in vercel.json. Content is read and validated once per cold start; invalid content
// makes the function fail instead of serving an unsourced fact (ADR-016, ADR-026).
import { createApp } from '../backend/dist/app.js'

export default createApp()
