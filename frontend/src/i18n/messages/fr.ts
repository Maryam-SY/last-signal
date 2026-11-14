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
    scrollHint: 'Fais défiler pour voyager',
    openDestination: 'Entrer dans la destination',
    bodiesLabel: 'Corps célestes',
    indexLabel: 'Aller à un monde',
    outroTitle: 'Le reste est encore là-haut',
    outroBody:
      'Chaque monde de cette page garde une chose que nous avons construite, puis abandonnée. La Lune et Mars sont ouvertes à la visite ; les autres attendent leur archive.',
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
    },
    mars: {
      name: 'Mars',
      cta: 'Explorer Mars',
    },
  },
  destination: {
    backToDestinations: 'Retour aux destinations',
    placeholder: 'La carte et la galerie des missions de {destination} apparaîtront ici.',
  },
  story: {
    title: 'Récit',
    unavailable: 'Le récit « {storyId} » n’est pas encore disponible.',
    exit: 'Quitter le récit',
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
