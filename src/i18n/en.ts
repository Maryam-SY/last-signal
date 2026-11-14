/** Textes de l'interface en anglais. Aucun texte visible n'est écrit en dur dans un composant. */
export const en = {
  appName: 'Last Signal',
  tagline: 'Nothing is abandoned. Everything is passed on.',
  nav: { home: 'Home', about: 'About' },
  home: {
    intro:
      'NASA left hardware on the Moon, on Mars and in deep space. Each machine passed something on to the next one.',
  },
  about: {
    title: 'About',
    aiUsage: 'Use of AI',
    aiUsageText:
      'Parts of the code were written with the help of an AI assistant (Claude Code) and reviewed by the team. No image on this site is AI-generated unless it carries a visible "AI-generated" mark.',
    privacy: 'Privacy',
    privacyText:
      'No account, no cookie, no tracker. Preferences stay in your browser and are never sent anywhere.',
  },
  disclaimer:
    'Independent project made for the NASA Space Apps Challenge. Not affiliated with or endorsed by NASA.',
} as const;

export type Messages = typeof en;
