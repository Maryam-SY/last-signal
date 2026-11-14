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
      'Des machines construites par l’humanité sont restées sur ces mondes après la fin de leur mission. Choisis-en un pour découvrir ce qu’elles ont laissé — et ce qu’elles ont transmis.',
    destinationsLabel: 'Destinations',
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
