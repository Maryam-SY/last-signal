import { defineConfig } from 'vitest/config';

// `pnpm test` lance l'application et les hooks de Claude Code en un seul process.
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'app',
          include: ['src/**/*.test.{ts,tsx}', 'security/**/*.test.mts', 'scripts/**/*.test.mts'],
        },
      },
      '.claude/hooks',
    ],
  },
});
