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
    scrollHint: 'Scroll — the worlds come to you',
    journeyLabel: 'Journey',
    sceneDeparture: 'Departure',
    sceneMotto: 'Transmission',
    chapter: 'Destination {number}',
    mottoEyebrow: 'What they passed on',
    motto: 'Every machine left more than a trace: it passed something on.',
    backToStart: 'Back to the start',
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
      land: 'Land on the Moon',
    },
    mars: {
      name: 'Mars',
      cta: 'Explore Mars',
      land: 'Land on Mars',
    },
  },
  destination: {
    backToDestinations: 'Back to destinations',
    galleryTitle: 'Missions and the machines they left',
    galleryIntro: {
      moon: 'Each mission below left machines behind on the Moon. Open one to see where it is, what it made possible and where every fact comes from.',
      mars: 'Each mission below left machines behind on Mars. Open one to see where it is, what it made possible and where every fact comes from.',
    },
  },
  common: {
    loading: 'Loading…',
    retry: 'Try again',
    loadError: 'We could not load this content. Check your connection, then try again.',
    close: 'Close',
    opensInNewTab: '(opens in a new tab)',
    draft: 'Draft',
  },
  geo: {
    north: 'N',
    south: 'S',
    east: 'E',
    west: 'W',
  },
  voice: {
    data: 'Fact',
    interpretation: 'What it means',
    imagination: 'Imagine',
  },
  status: {
    operational: 'Operational',
    'contact-lost': 'Contact lost',
    inactive: 'Inactive',
    'mission-ended': 'Mission ended',
    unknown: 'Status not confirmed',
  },
  machineType: {
    lander: 'Lander',
    rover: 'Rover',
    'descent-stage': 'Descent stage',
    experiment: 'Experiment',
    helicopter: 'Helicopter',
    impactor: 'Impactor',
    other: 'Machine',
  },
  dateLabel: {
    landing: 'Landed',
    deployment: 'Deployed',
    impact: 'Impact',
    'last-contact': 'Last contact',
    default: 'Date',
  },
  relationType: {
    method: 'Method',
    technology: 'Technology',
    data: 'Data',
    knowledge: 'Knowledge',
    inspiration: 'Inspiration',
  },
  sources: {
    one: 'Source',
    many: 'Sources ({count})',
    panelLabel: 'Where this comes from',
    accessedOn: 'Consulted on {date}',
    missing: 'Source unavailable',
  },
  gallery: {
    empty: 'No mission has been published for this destination yet.',
    machinesLabel: 'Machines left by {mission}',
    period: '{start} – {end}',
    locationNotMapped: 'Location not mapped',
    openDetails: 'Open the details of {machine}',
    noImage: 'No verified image yet',
    discoverStory: 'Discover the story',
    timeline: 'Key moments ({count})',
    timelineMedia: 'Images for “{event}”',
  },
  media: {
    depiction: {
      artwork: 'Artist’s view — not a photo',
      simulation: 'Computer-generated image — not a photo',
      diagram: 'Diagram / map',
      mixed: 'Contains animation',
    },
    aiGenerated: 'AI-generated',
    open: {
      video: 'Watch the video',
      '3d-model': 'Open the 3D model',
      document: 'Open the document',
    },
    sourcePage: 'source page',
    unavailableShort: 'Image unavailable right now',
    unavailable: 'Image unavailable right now — the source page still works.',
    unknownCredit: 'Credit not stated',
  },
  machine: {
    mission: 'Mission',
    location: 'Place',
    coordinates: 'Coordinates',
    status: 'Status',
    science: 'What it made possible',
    nssdcaId: 'NSSDCA ID',
    relationsTitle: 'What was passed on',
    transmitted: 'Passed on',
    evidence: 'How we know',
    discoverStory: 'Discover its story',
    mediaTitle: 'More images',
    detailsLabel: 'Machine details',
  },
  story: {
    title: 'Story',
    notFound: 'This story does not exist or has not been published yet.',
    exit: 'Exit story',
    progressLabel: 'Story steps',
    stepOf: 'Step {current} of {total}',
    goToStep: 'Step {number}: {title}',
    previous: 'Previous',
    next: 'Next',
    draftNotice:
      'Draft — every fact here is sourced, but the story has not yet been checked by a second reviewer. Wording may change.',
    relayFrom: 'From',
    relayTo: 'To',
    machinesTitle: 'Machines in this story',
    endTitle: 'Keep exploring',
    endMission: 'Back to {mission}',
    endOtherDestination: 'Travel to {destination}',
    missionLabel: 'Mission {mission}',
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
    mediaCredit: 'Mission images and videos are shown with their credit and a link to the page they come from.',
    sourcesIntro: 'Every fact shown on this site points to one of these sources. Dates are the day we consulted them.',
    aiText:
      'An AI assistant helped structure the content and write draft stories. Every fact was checked against the sources listed here; drafts are marked until a person has reviewed them.',
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
