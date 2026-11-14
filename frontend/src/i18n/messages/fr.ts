import type { Messages } from '../types'

/** Traduction française de l'interface. Doit fournir exactement les clés de `en`. */
export const fr: Messages = {
  app: {
    name: 'AeroReborn',
    documentTitle: '{page} · AeroReborn',
    skipToContent: 'Aller au contenu',
    disclaimer: 'Projet indépendant, ni affilié à la NASA ni approuvé par elle.',
  },
  nav: {
    label: 'Principale',
    explore: 'Explorer',
    about: 'À propos et sources',
  },
  explore: {
    title: 'Choisis ta destination',
    intro:
      "Des machines construites par l’humanité sont restées sur ces mondes après la fin de leur mission. Choisis-en un pour découvrir ce qu’elles ont laissé — et ce qu’elles ont transmis.",
    destinationsLabel: 'Destinations',
    eyebrow: 'Un guide de terrain des machines que nous avons laissées',
    scrollHint: 'Fais défiler — les mondes viennent à toi',
    journeyLabel: 'Voyage',
    sceneDeparture: 'Départ',
    sceneMotto: 'Transmission',
    chapter: 'Destination {number}',
    mottoEyebrow: 'Ce qu’elles ont transmis',
    motto: 'Chaque machine a laissé plus qu’une trace : elle a transmis quelque chose.',
    backToStart: 'Revenir au départ',
  },
  bodies: {
    mercury: {
      name: 'Mercure',
      kind: 'Planète tellurique',
      description:
        'Un monde brûlé et criblé de cratères, sans atmosphère pour adoucir le Soleil. Rien n’y a atterri en douceur — seulement des cicatrices d’impact et du silence.',
    },
    venus: {
      name: 'Vénus',
      kind: 'Planète tellurique',
      description:
        'Sous un ciel de dioxyde de carbone écrasant, la chaleur et la pression effacent presque tout. Les sondes ont tenu quelques minutes ; leurs histoires ont tenu des décennies.',
    },
    earth: {
      name: 'Terre',
      kind: 'Monde natal',
      description:
        'Le seul monde que nous connaissions qui ait gardé ses bâtisseurs. Tout ce que les autres ont perdu est encore ici — pour l’instant.',
    },
    moon: {
      name: 'Lune',
      kind: 'Satellite naturel',
      description:
        'Douze humains y ont marché, et leurs empreintes, drapeaux et rovers y sont toujours. La Lune est un musée sans visiteurs.',
    },
    mars: {
      name: 'Mars',
      kind: 'Planète tellurique',
      description:
        'Les rovers et les atterrisseurs ont survécu à leur mission. Quelques-uns répondent encore ; la plupart dorment sous la poussière.',
    },
    asteroids: {
      name: 'Astéroïdes',
      kind: 'Petits corps',
      description:
        'Une archive dispersée des briques du Système solaire — et des vaisseaux que nous avons envoyés à leur rencontre.',
    },
    jupiter: {
      name: 'Jupiter',
      kind: 'Géante gazeuse',
      description:
        'Une géante sans sol où atterrir. Ses tempêtes durent plus longtemps que toutes les machines que nous lui avons envoyées.',
    },
    saturn: {
      name: 'Saturne',
      kind: 'Géante gazeuse',
      description:
        'Des anneaux de glace et de roche, et une lune où une sonde a écouté la vie jusqu’à épuisement de son énergie.',
    },
    uranus: {
      name: 'Uranus',
      kind: 'Géante de glace',
      description:
        'Un monde froid et incliné, visité une fois par Voyager 2, puis laissé seul pendant des décennies.',
    },
    neptune: {
      name: 'Neptune',
      kind: 'Géante de glace',
      description:
        'La planète la plus lointaine, mesurée au passage et retenue dans une poignée d’images.',
    },
    pluto: {
      name: 'Pluton',
      kind: 'Planète naine',
      description:
        'Rétrogradée, puis photographiée de près. New Horizons l’a laissée derrière elle en 2015 et a continué son vol.',
    },
    comets: {
      name: 'Comètes',
      kind: 'Petits corps',
      description:
        'De la glace et de la poussière sur de longues orbites. Nous nous sommes posés sur l’une d’elles — et le harpon est resté.',
    },
  },
  destinations: {
    moon: {
      name: 'Lune',
      cta: 'Explorer la Lune',
      land: 'Se poser sur la Lune',
    },
    mars: {
      name: 'Mars',
      cta: 'Explorer Mars',
      land: 'Se poser sur Mars',
    },
  },
  destination: {
    backToDestinations: 'Retour aux destinations',
    galleryTitle: 'Les missions et les machines qu’elles ont laissées',
    galleryIntro: {
      moon: 'Chaque mission ci-dessous a laissé des machines sur la Lune. Ouvre-en une pour voir où elle se trouve, ce qu’elle a permis et d’où vient chaque information.',
      mars: 'Chaque mission ci-dessous a laissé des machines sur Mars. Ouvre-en une pour voir où elle se trouve, ce qu’elle a permis et d’où vient chaque information.',
    },
  },
  common: {
    loading: 'Chargement…',
    retry: 'Réessayer',
    loadError: 'Impossible de charger ce contenu. Vérifie ta connexion, puis réessaie.',
    close: 'Fermer',
    opensInNewTab: '(s’ouvre dans un nouvel onglet)',
    draft: 'Brouillon',
  },
  geo: {
    north: 'N',
    south: 'S',
    east: 'E',
    west: 'O',
  },
  voice: {
    data: 'Fait',
    interpretation: 'Ce que ça veut dire',
    imagination: 'Imagine',
  },
  status: {
    operational: 'En fonctionnement',
    'contact-lost': 'Contact perdu',
    inactive: 'Inactif',
    'mission-ended': 'Mission terminée',
    unknown: 'Statut non confirmé',
  },
  machineType: {
    lander: 'Atterrisseur',
    rover: 'Rover',
    'descent-stage': 'Étage de descente',
    experiment: 'Expérience',
    helicopter: 'Hélicoptère',
    impactor: 'Impacteur',
    other: 'Machine',
  },
  dateLabel: {
    landing: 'Atterrissage',
    deployment: 'Déploiement',
    impact: 'Impact',
    'last-contact': 'Dernier contact',
    default: 'Date',
  },
  relationType: {
    method: 'Méthode',
    technology: 'Technologie',
    data: 'Données',
    knowledge: 'Connaissance',
    inspiration: 'Inspiration',
  },
  sources: {
    one: 'Source',
    many: 'Sources ({count})',
    panelLabel: 'D’où vient cette information',
    accessedOn: 'Consultée le {date}',
    missing: 'Source indisponible',
  },
  gallery: {
    empty: 'Aucune mission n’a encore été publiée pour cette destination.',
    machinesLabel: 'Machines laissées par {mission}',
    period: '{start} – {end}',
    locationNotMapped: 'Emplacement non cartographié',
    openDetails: 'Ouvrir la fiche de {machine}',
    noImage: 'Pas encore d’image vérifiée',
    discoverStory: 'Découvrir le récit',
    timeline: 'Moments clés ({count})',
    timelineMedia: 'Images pour « {event} »',
  },
  media: {
    depiction: {
      artwork: 'Vue d’artiste — pas une photo',
      simulation: 'Image de synthèse — pas une photo',
      diagram: 'Schéma / carte',
      mixed: 'Contient des animations',
    },
    aiGenerated: 'Générée par IA',
    open: {
      video: 'Voir la vidéo',
      '3d-model': 'Ouvrir le modèle 3D',
      document: 'Ouvrir le document',
    },
    sourcePage: 'page source',
    unavailableShort: 'Image indisponible pour le moment',
    unavailable: 'Image indisponible pour le moment — la page source reste accessible.',
    unknownCredit: 'Crédit non indiqué',
  },
  machine: {
    mission: 'Mission',
    location: 'Lieu',
    coordinates: 'Coordonnées',
    status: 'Statut',
    science: 'Ce qu’elle a permis',
    nssdcaId: 'Identifiant NSSDCA',
    relationsTitle: 'Ce qui a été transmis',
    transmitted: 'Transmis',
    evidence: 'Comment on le sait',
    discoverStory: 'Découvrir son histoire',
    mediaTitle: 'Autres images',
    detailsLabel: 'Fiche de la machine',
  },
  story: {
    title: 'Récit',
    notFound: 'Ce récit n’existe pas ou n’a pas encore été publié.',
    exit: 'Quitter le récit',
    progressLabel: 'Étapes du récit',
    stepOf: 'Étape {current} sur {total}',
    goToStep: 'Étape {number} : {title}',
    previous: 'Précédent',
    next: 'Suivant',
    draftNotice:
      'Brouillon — chaque fait est sourcé, mais le récit n’a pas encore été relu par une seconde personne. La formulation peut changer.',
    relayFrom: 'De',
    relayTo: 'Vers',
    machinesTitle: 'Les machines de ce récit',
    endTitle: 'Continuer l’exploration',
    endMission: 'Retour à {mission}',
    endOtherDestination: 'Partir vers {destination}',
    missionLabel: 'Mission {mission}',
  },
  about: {
    title: 'À propos et sources',
    creditsTitle: 'Crédits',
    sourcesTitle: 'Sources',
    aiTitle: 'Utilisation de l’IA',
    comingSoon: 'Cette section sera complétée avant la mise en ligne.',
    imagesCredit:
      'Les photographies des planètes et des petits corps proviennent des ressources d’images du NSSDCA de la NASA et font partie du domaine public.',
    imagesSourceLabel: 'Ressources d’images du NSSDCA',
    mediaCredit: 'Les images et vidéos des missions sont affichées avec leur crédit et un lien vers la page d’où elles viennent.',
    sourcesIntro: 'Chaque fait affiché sur ce site renvoie à l’une de ces sources. Les dates sont celles de notre consultation.',
    aiText:
      'Un assistant d’IA a aidé à structurer le contenu et à rédiger des brouillons de récits. Chaque fait a été vérifié dans les sources listées ici ; les brouillons restent signalés tant qu’une personne ne les a pas relus.',
  },
  notFound: {
    title: 'Page introuvable',
    message: 'Cette page n’existe pas ou a été déplacée.',
    backHome: 'Retour à l’accueil',
  },
  error: {
    title: 'Une erreur est survenue',
    message: 'Une erreur inattendue s’est produite. Reviens en arrière et réessaie.',
  },
}
