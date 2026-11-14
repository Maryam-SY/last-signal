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
    eyebrow: 'A field guide to the machines we left behind',
    scrollHint: 'Scroll to travel',
    openDestination: 'Enter destination',
    bodiesLabel: 'Celestial bodies',
    indexLabel: 'Jump to a world',
    outroTitle: 'The rest is still out there',
    outroBody:
      'Every world on this page holds something we built, then left. The Moon and Mars are open to visit; the rest are waiting for their archive.',
  },
  bodies: {
    mercury: {
      name: 'Mercury',
      kind: 'Terrestrial planet',
      description:
        'A scorched, cratered world with almost no atmosphere to soften the Sun. Nothing has landed softly here — only impact scars and silence.',
    },
    venus: {
      name: 'Venus',
      kind: 'Terrestrial planet',
      description:
        'Under a crushing carbon-dioxide sky, heat and pressure erase almost everything. Probes lasted minutes; their stories lasted decades.',
    },
    earth: {
      name: 'Earth',
      kind: 'Home world',
      description:
        'The only world we know that kept its makers. Everything the others lost is still here — for now.',
    },
    moon: {
      name: 'Moon',
      kind: 'Natural satellite',
      description:
        'Twelve humans walked here, and their footprints, flags and rovers remain. The Moon is a museum with no visitors.',
    },
    mars: {
      name: 'Mars',
      kind: 'Terrestrial planet',
      description:
        'Rovers and landers outlived their missions. A few still answer; most sleep under the dust.',
    },
    asteroids: {
      name: 'Asteroids',
      kind: 'Small bodies',
      description:
        'A scattered archive of the Solar System’s building blocks — plus the spacecraft we sent to meet them.',
    },
    jupiter: {
      name: 'Jupiter',
      kind: 'Gas giant',
      description:
        'A giant with no ground to land on. Its storms outlast every machine we have ever sent.',
    },
    saturn: {
      name: 'Saturn',
      kind: 'Gas giant',
      description:
        'Rings of ice and rock, and a moon where a probe listened for life until its power ran out.',
    },
    uranus: {
      name: 'Uranus',
      kind: 'Ice giant',
      description:
        'A cold, tilted world visited once by Voyager 2, then left alone for decades.',
    },
    neptune: {
      name: 'Neptune',
      kind: 'Ice giant',
      description:
        'The farthest planet, measured in passing and remembered in a handful of frames.',
    },
    pluto: {
      name: 'Pluto',
      kind: 'Dwarf planet',
      description:
        'Demoted, then photographed up close. New Horizons left it behind in 2015 and kept flying.',
    },
    comets: {
      name: 'Comets',
      kind: 'Small bodies',
      description:
        'Ice and dust on long orbits. We have landed on one — and the harpoon stayed.',
    },
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
    imagesCredit:
      'Planet and small-body photographs come from the NASA NSSDCA Image Resources and are in the public domain.',
    imagesSourceLabel: 'NSSDCA Image Resources',
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
