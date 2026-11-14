# Branchement du frontend sur l'API

> Demande de l'équipe du 2026-11-14 : « branche le frontend sur l'API ». Rôles : Dev + QA.
> Branche : `feat/frontend-api` (partie de `feat/content-api`). **Statut : review.**

## Stories couvertes (partiellement ou totalement)

| Story | Ce qui est livré | Ce qui manque |
|---|---|---|
| US-3.1 Parcourir par mission | Galerie groupée par mission (période, résumé, machines), « Position non cartographiée » | — |
| US-3.2 Consulter un équipement | Carte machine (type, date, statut icône + texte, lieu, science, note de statut), photos/vidéos/sources à la demande, lien « Découvrir son histoire » | Panneau `?machine=` (EQUIP-003) : remplacé pour l'instant par le dépliage dans la carte |
| US-3.5 Aller à une mission | Barre « Aller à une mission » (ancres) | — |
| US-3.3 / US-3.4 Carte et synchronisation | — | **Non commencé** (carte 2D) |
| US-4.1 / US-4.2 Récit en 6 étapes | Étapes pilotées par `?step=`, progression cliquable (`aria-current="step"`), Précédent/Suivant, focus sur le titre de l'étape, bouton retour du navigateur, Quitter le récit vers la machine d'origine | — |
| US-4.3 Voix | `VoiceTag` texte + icône | — |
| US-4.4 Sources dans le récit | Sources de chaque bloc dans un `<details>` dépliable | — |
| US-4.7 Fin du récit | Retour aux machines + autre destination | Liens vers récits individuels (aucun n'existe encore) |
| US-5.1 About & Sources | Liste complète des sources depuis l'API, ancres `#source-{id}` | Crédits, IA : toujours « à compléter » |
| MEDIA-001 | Badge visible pour vue d'artiste, simulation, schéma, contenu animé | — |
| TIMELINE-001 | Chronologie dépliable par mission, avec dates formatées et images | — |

## Vérification (2026-11-14)

| Contrôle | Résultat |
|---|---|
| Frontend `npm run check` | ✅ lint 0 erreur (2 avertissements, voir ci-dessous), typecheck ✅, **31/31 tests**, build ✅ |
| Backend `npm run check` | ✅ 42/42 tests (ajout de `destinationId` et `missions` dans `GET /api/stories/:id`) |
| Navigateur, vrai backend (ports 3101/5174) | ✅ Mars : 3 missions, 5 machines ; chronologie Ingenuity : 12 étapes, badges affichés, images chargées ; récit Spirit & Opportunity étape 5 : 2 relais, avis « en cours de vérification » ; About : 18 sources ; retour `#machine-…` avec focus ; console sans nouvelle erreur |
| Mobile 375 px | ✅ pas de défilement horizontal, aucune cible < 44 px dans `main` |

## Limites connues

- **Sous-titres vidéo** : les vidéos NASA n'ont pas de piste `<track>` (avertissement lint `media-has-caption`). Les manifestes NASA fournissent parfois des fichiers `.srt`/`.vtt` : à ajouter au modèle `Media`.
- **Pas de sélecteur de langue** : l'interface et l'API gèrent `fr`/`en`, mais rien ne permet encore de changer de langue à l'écran (OPEN-06).
- **Pas de carte 2D** (US-3.3/3.4).
- **Production** : `VITE_API_BASE_URL` doit pointer vers l'API déployée ; l'hébergement de l'API reste à décider (OPEN-05).
- **Lighthouse** non exécuté.

## Revue humaine

- Relu par : · Date : · Verdict :
