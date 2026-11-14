/**
 * English UI strings — source dictionary. Every other locale must provide the same keys
 * (enforced by the `Messages` type). Scientific content lives in content/, not here.
 * Placeholders use {name} syntax.
 */
export const en = {
  app: {
    name: 'AeroReborn',
    documentTitle: '{page} · AeroReborn',
    skipToContent: 'Skip to content',
    disclaimer: 'Independent project, not affiliated with or endorsed by NASA.',
  },
  nav: {
    label: 'Main',
    explore: 'Explore',
    about: 'About & Sources',
  },
  explore: {
    title: 'Choose your destination',
    intro:
      'Human-made machines stayed behind on these worlds after their missions ended. Pick one to discover what they left — and what they passed on.',
    destinationsLabel: 'Destinations',
  },
  destinations: {
    moon: {
      name: 'Moon',
      cta: 'Explore the Moon',
    },
    mars: {
      name: 'Mars',
      cta: 'Explore Mars',
    },
  },
  destination: {
    backToDestinations: 'Back to destinations',
    placeholder: 'The map and the mission gallery for {destination} will appear here.',
  },
  story: {
    title: 'Story',
    unavailable: 'The story “{storyId}” is not available yet.',
    exit: 'Exit story',
  },
  about: {
    title: 'About & Sources',
    creditsTitle: 'Credits',
    sourcesTitle: 'Sources',
    aiTitle: 'Use of AI',
    comingSoon: 'This section will be completed before release.',
  },
  notFound: {
    title: 'Page not found',
    message: 'This page does not exist or has moved.',
    backHome: 'Back to home',
  },
  error: {
    title: 'Something went wrong',
    message: 'An unexpected error occurred. Please go back and try again.',
  },
} as const
