# Décisions techniques (ADR) — AeroReborn

> Rôle BMAD : Architect · Version 1.0 (Phase 0)
> Statuts : **Acceptée** (imposée par le CDC ou l'existant, ou validée par l'équipe) · **Proposée** (en attente de validation, liée à un `OPEN-xx`) · **Remplacée par ADR-xxx**.
> Une ADR n'est jamais supprimée ; on en crée une nouvelle qui la remplace.

## Index

| ADR | Titre | Statut | OPEN |
|---|---|---|---|
| ADR-001 | Conserver Vite + React | Acceptée | — |
| ADR-002 | TypeScript strict (frontend et backend) | Acceptée | OPEN-02 |
| ADR-003 | Contenu en JSON versionné, pas de base de données (« site statique » amendé par ADR-016) | Acceptée, amendée | OPEN-18 |
| ADR-004 | Geler le backend Express existant | Remplacée par ADR-016 | OPEN-03 |
| ADR-005 | Pas de Docker | Acceptée (à réexaminer avec OPEN-18) | — |
| ADR-006 | Routage client avec react-router, état dans l'URL | Acceptée | OPEN-04 |
| ADR-007 | Carte 2D : fond raster dans SVG + marqueurs HTML, sans librairie cartographique | Proposée | OPEN-15 |
| ADR-008 | Pas de store global | Acceptée | — |
| ADR-009 | `Sourced<T>` + test d'intégrité du contenu (zod en devDependency) | Proposée | OPEN-17 |
| ADR-010 | Tailwind v4 + tokens COSMOS, primitives shadcn/base-ui conservées | Acceptée | OPEN-13 |
| ADR-011 | Garder oxlint comme linter | Acceptée | — |
| ADR-012 | Vitest + Testing Library, pas d'E2E navigateur dans le MVP | Proposée | — |
| ADR-013 | Déploiement Vercel + CI GitHub Actions | CI acceptée ; hébergement à réexaminer | OPEN-05, OPEN-18 |
| ADR-014 | Moteur narratif découplé de la technique d'animation | Acceptée | OPEN-10 |
| ADR-015 | Internationalisation : dictionnaires typés, sans librairie i18n | Acceptée | OPEN-06 |
| ADR-016 | Architecture frontend + backend (site dynamique) | Acceptée ; rôle de l'API tranché (OPEN-18) | OPEN-03, OPEN-18 |
| ADR-017 | Médias référencés par URL, pas stockés dans le dépôt | Proposée | — |
| ADR-018 | Accueil immersif « depth journey » sans bibliothèque | Acceptée | — |
| ADR-019 | Pages Destination et Récit en scroll immersif continu | Acceptée | — |
| ADR-020 | Modèles 3D NASA affichés avec `@google/model-viewer`, chargé à la demande | Acceptée (demande de l'équipe, 2026-11-14) | — |
| ADR-021 | Vidéo d'introduction de l'équipe et ciel commun au site | Acceptée (demande de l'équipe, 2026-11-14) | — |

---

## ADR-001 — Conserver Vite + React

- **Statut** : Acceptée
- **Problème** : choisir le socle de l'application.
- **Options** : (a) Vite + React — déjà installé ; (b) Next.js / Astro (SSG) ; (c) Vanilla + Web Components.
- **Analyse** :
  - (a) Présent dans le dépôt, conforme au CDC §9, équipe déjà configurée, HMR rapide, build statique natif. − Rendu côté client uniquement (SEO limité, acceptable pour un hackathon).
  - (b) SSG/SEO meilleurs, Astro très adapté au contenu. − Changement de stack, courbe d'apprentissage, contredit l'existant et le CDC.
  - (c) Aucune dépendance. − Coût de développement élevé pour l'interactivité carte/récit.
- **Décision** : (a).
- **Conséquences** : SPA → nécessite un fallback `index.html` chez l'hébergeur (ADR-013).

## ADR-002 — TypeScript strict (frontend et backend)

- **Statut** : Acceptée le 2026-11-14 (OPEN-02) — étendue au backend à la demande de l'équipe
- **Problème** : le CDC exige TypeScript ; le dépôt est en JavaScript.
- **Options** : (a) migrer maintenant ; (b) rester en JS + JSDoc ; (c) migrer plus tard.
- **Analyse** :
  - (a) ≈ 8 fichiers à renommer, coût < 1 h ; permet `Sourced<T>`, unions de statuts, props typées — protège directement l'exactitude des données. − Ajout de `typescript` en devDependency.
  - (b) Pas de nouvelle dépendance. − Typage partiel, non conforme au CDC, pas de `tsc --noEmit` exploitable en CI.
  - (c) Coût croissant avec chaque composant ajouté.
- **Décision** : (a), `strict: true` + `noUncheckedIndexedAccess`, script `typecheck` dans les deux paquets. TypeScript 7.0 (compilateur natif), `moduleResolution: bundler` côté front, `NodeNext` côté back.
- **Conséquences** : `components.json` → `tsx: true` ; `jsconfig.json` remplacé par `tsconfig*.json` ; la CI inclut `typecheck`.

## ADR-003 — Site 100 % statique, contenu JSON, pas de base de données

- **Statut** : Acceptée (CDC §7), **amendée par ADR-016** : le site n'est plus « sans serveur » ; le principe « contenu en JSON versionné, pas de base de données » est maintenu en attendant OPEN-18.
- **Problème** : où stocker et comment servir le contenu ?
- **Options** : (a) JSON versionné dans le dépôt ; (b) base de données + API ; (c) CMS headless.
- **Analyse** :
  - (a) Zéro infrastructure, revue des contenus par PR (traçabilité scientifique), rédaction et développement en parallèle. − Pas d'édition WYSIWYG ; JSON verbeux pour les récits.
  - (b) Inutile : contenu en lecture seule, quelques dizaines d'entrées ; ajoute hébergement, sécurité, latence.
  - (c) Confort de rédaction. − Compte externe, dépendance réseau, temps de mise en place.
- **Décision** : (a).
- **Conséquences** : validation par test (ADR-009) ; si la rédaction des récits en JSON s'avère pénible, envisager Markdown + frontmatter en P1 (nouvelle ADR).

## ADR-004 — Geler le backend Express existant

- **Statut** : **Remplacée par ADR-016** (l'équipe veut un frontend et un backend)
- **Problème** : `backend/` existe alors que le CDC exclut tout serveur pour le MVP.
- **Options** : (a) le supprimer ; (b) le geler (conservé, non utilisé, non déployé) ; (c) l'utiliser pour servir le contenu.
- **Analyse** :
  - (a) Dépôt plus clair. − Suppression interdite sans validation ; travail d'un membre de l'équipe.
  - (b) Aucun risque, réversible. − Dossier inutile visible (documenté dans README).
  - (c) Contredit le CDC, ajoute un point de défaillance, coût d'hébergement.
- **Décision proposée** : (b).
- **Conséquences** : la CI ne construit que `frontend/` ; README signale le statut du dossier ; suppression éventuelle = décision humaine.

## ADR-005 — Pas de Docker

- **Statut** : Acceptée
- **Problème** : faut-il conteneuriser l'application ?
- **Options** : (a) non ; (b) Dockerfile (nginx servant `dist/`).
- **Analyse** : (b) n'apporte rien à un site statique déployé sur une plateforme statique, et ajoute un artefact à maintenir. L'environnement reproductible est garanti par `package-lock.json` + version Node fixée (`.nvmrc` / `engines`).
- **Décision** : (a).
- **Conséquences** : ajouter `.nvmrc` (Node 24) en phase 1.

## ADR-006 — Routage client avec react-router, état dans l'URL

- **Statut** : Acceptée le 2026-11-14 (OPEN-04) — react-router 8, `createBrowserRouter`, table de routes dans `src/app/routes.tsx`, URLs construites par `src/app/paths.ts`
- **Problème** : 4 pages + état de sélection et d'étape à rendre adressables (NAV-004).
- **Options** : (a) react-router ; (b) routeur maison (hash ou History API) ; (c) TanStack Router.
- **Analyse** :
  - (a) Standard, documenté, `useSearchParams`, error boundaries de route, lazy routes. − Une dépendance (~ dizaines de Ko gzip).
  - (b) Zéro dépendance. − À écrire et tester (params, 404, retour, focus) : temps de hackathon mal investi.
  - (c) Typage des routes excellent. − Moins familier, configuration plus lourde.
- **Décision proposée** : (a), version stable courante au moment de l'installation, mode `createBrowserRouter`.
- **Conséquences** : l'hébergeur doit réécrire toutes les routes vers `index.html` ; tests de composants enveloppés dans un `MemoryRouter`.

## ADR-007 — Carte 2D : fond raster dans SVG + marqueurs HTML, sans librairie cartographique

- **Statut** : Proposée (OPEN-15 pour le fond)
- **Problème** : afficher une carte 2D simplifiée, accessible, tactile, synchronisée avec la galerie.
- **Options** : (a) SVG maison (fond raster + marqueurs) ; (b) Leaflet / MapLibre avec tuiles planétaires ; (c) D3-geo ; (d) carte 3D (three.js / globe).
- **Analyse** :
  - (a) Conforme au CDC (« SVG maison »), aucun réseau externe, contrôle total de l'accessibilité, fonction de projection triviale et testable. − Pas de zoom/pan (acceptable en P0).
  - (b) Zoom réel, mais tuiles externes (disponibilité, licence), accessibilité des marqueurs à reprendre, poids, et risque de « carte précise » contraire au CDC §8.
  - (c) Projections avancées inutiles pour un équirectangulaire.
  - (d) Hors périmètre, coûteux sur mobile.
- **Décision proposée** : (a) — `<svg viewBox="0 0 360 180">` pour le fond et les tracés (P1), **marqueurs `<button>` HTML superposés** en pourcentage (cible tactile fixe ≥ 44 px, focus natif), regroupement des points proches en marqueurs de site.
- **Conséquences** : coordonnées normalisées est-positif [-180, 180] ; fond centré sur le méridien 0 ; mention « schématique » obligatoire ; error boundary autour de la carte.

## ADR-008 — Pas de store global

- **Statut** : Acceptée
- **Problème** : partager la sélection entre carte, galerie, fiche, fil d'Ariane.
- **Options** : (a) URL + props ; (b) Context React ; (c) Zustand/Redux.
- **Analyse** : l'état partagé se limite à `destinationId`, `machineId`, `step`, `from` — tous déjà dans l'URL. (b) et (c) dupliqueraient cet état et créeraient des désynchronisations avec le bouton retour.
- **Décision** : (a).
- **Conséquences** : un hook `useSelectedMachine()` encapsule la lecture/écriture de `?machine`.

## ADR-009 — `Sourced<T>` + test d'intégrité du contenu

- **Statut** : Proposée (OPEN-17)
- **Problème** : garantir qu'aucun fait affiché n'est dépourvu de source et que les références sont cohérentes (CDC §7, risque R2).
- **Options** : (a) types TS seuls ; (b) types + test d'intégrité écrit à la main ; (c) types + schémas zod utilisés **uniquement dans les tests** ; (d) zod à l'exécution.
- **Analyse** :
  - (a) Les imports JSON ne sont pas vérifiés finement par TypeScript (littéraux élargis) → insuffisant.
  - (b) Aucune dépendance. − Validateurs longs à écrire et à maintenir, messages d'erreur moins précis.
  - (c) Schémas déclaratifs, messages précis, **0 octet dans le bundle** (devDependency). − Une dépendance de dev.
  - (d) Protection runtime, mais coût bundle et inutile pour un contenu figé au build.
- **Décision proposée** : (c) — schémas zod pour la structure (V1, V2, V5, V9, V11, V12) + règles relationnelles en TypeScript (V3, V4, V6–V8, V10).
- **Conséquences** : `npm test` et la CI bloquent tout contenu invalide ; les types TS sont dérivés des schémas ou alignés par un test de compatibilité.

## ADR-010 — Tailwind v4 + tokens COSMOS, primitives shadcn/base-ui conservées

- **Statut** : Acceptée le 2026-11-14 (OPEN-13) — tokens dans `src/styles/tokens.css`, `<html class="dark">`, paquet `cn` retiré au profit de `@/lib/utils`
- **Problème** : le thème actuel (shadcn neutre, Geist) ne correspond pas à l'identité COSMOS.
- **Options** : (a) remplacer les variables du thème shadcn par les tokens COSMOS et charger les 3 polices via `@fontsource` ; (b) retirer shadcn et tout écrire en CSS ; (c) garder le thème neutre.
- **Analyse** :
  - (a) Réutilise l'outillage en place ; les primitives base-ui fournissent focus-trap, ARIA (Dialog, Popover) utiles pour la fiche et les sources. − 3 paquets de polices (OFL, auto-hébergées).
  - (b) Perte de primitives accessibles à réécrire.
  - (c) Non conforme à l'identité validée.
- **Décision proposée** : (a), thème sombre unique ; retrait de `@fontsource-variable/geist`.
- **Conséquences** : tokens documentés dans DESIGN_SYSTEM.md ; `Stellar Border` réservé au décoratif (contraste 1,5–1,9:1, insuffisant pour délimiter un composant interactif).

## ADR-011 — Garder oxlint comme linter

- **Statut** : Acceptée
- **Problème** : la consigne mentionne ESLint « si configuré » ; le dépôt utilise oxlint.
- **Options** : (a) oxlint ; (b) migrer vers ESLint ; (c) les deux.
- **Analyse** : oxlint est déjà configuré (règles React hooks), très rapide, supporte TypeScript et les règles jsx-a11y. ESLint apporterait un écosystème plus large au prix d'une configuration supplémentaire sans besoin identifié.
- **Décision** : (a) ; activer le plugin `jsx-a11y` et `typescript` d'oxlint en phase 1.
- **Conséquences** : `npm run lint` = oxlint ; QUALITY_GATES y fait référence.

## ADR-012 — Vitest + Testing Library, pas d'E2E navigateur dans le MVP

- **Statut** : Proposée
- **Problème** : quel niveau de test automatisé pour un hackathon ?
- **Options** : (a) Vitest + RTL (installé) ; (b) + Playwright E2E ; (c) tests manuels seuls.
- **Analyse** : (a) couvre logique, intégrité du contenu et interactions principales (sync, récit, focus) en jsdom ; (b) plus réaliste mais installation navigateurs, CI plus lente, temps d'écriture ; (c) insuffisant pour des agents qui modifient le code.
- **Décision proposée** : (a) + smoke test manuel scripté (QG-SMOKE) sur l'URL déployée.
- **Conséquences** : les comportements dépendant de la mise en page réelle (défilement, tailles tactiles) sont vérifiés manuellement (QG-RESP, QG-A11Y).

## ADR-013 — Déploiement Vercel + CI GitHub Actions

- **Statut** : **CI acceptée** (`.github/workflows/ci.yml`, matrice frontend/backend) ; **hébergement à réexaminer** depuis ADR-016 (OPEN-05, OPEN-18)
- **Problème** : publier un site statique public avec contrôles automatisés.
- **Options** : (a) Vercel ; (b) Netlify ; (c) Cloudflare Pages ; (d) GitHub Pages.
- **Analyse** :
  - (a)(b)(c) Détection Vite, HTTPS, prévisualisation par PR, réécritures SPA simples, sous-dossier `frontend/` supporté. Différences mineures pour ce besoin.
  - (d) Gratuit et intégré, mais réécriture SPA non native (astuce `404.html`) et pas de prévisualisation par PR.
- **Décision proposée** : (a) Vercel pour sa prévisualisation par PR et sa configuration minimale ; (b)/(c) restent des remplacements à coût quasi nul.
- **Conséquences** : `frontend/vercel.json` (réécriture SPA) ; CI GitHub Actions indépendante de l'hébergeur (lint, typecheck, test, build) ; aucun secret dans le dépôt ; liaison du compte Vercel par un humain.

## ADR-014 — Moteur narratif découplé de la technique d'animation

- **Statut** : Acceptée (respecte le report volontaire du CDC §5, OPEN-10)
- **Problème** : développer le récit sans avoir choisi entre scroll storytelling et parallax.
- **Options** : (a) choisir maintenant ; (b) moteur pas-à-pas contrôlé + point d'extension d'animation unique.
- **Analyse** : (a) prendrait une décision que le CDC réserve à l'équipe. (b) satisfait déjà les exigences fixées (Previous/Next, progression, sans animation) et permet d'ajouter une mise en page scroll consommant les mêmes données.
- **Décision** : (b) — `StoryExperience` contrôlé, animation confinée à `StoryTransition`.
- **Conséquences** : le pas-à-pas devient le repli permanent (STORY-009) ; toute technique future est un nouveau layout, sans changement du modèle de données.

## ADR-015 — Internationalisation : dictionnaires typés, sans librairie i18n

- **Statut** : Acceptée le 2026-11-14 (OPEN-06, demande explicite de « prévoir l'internationalisation »)
- **Problème** : l'interface MVP est en anglais (CDC), la traduction française est P2.
- **Options** : (a) chaînes en dur dans les composants ; (b) module `i18n/en.ts` typé ; (c) i18next / FormatJS.
- **Analyse** : (a) rend la traduction coûteuse ; (c) surdimensionné pour une langue ; (b) coût nul et prépare le P2.
- **Décision** : (b) étendue — `src/i18n/messages/en.ts` (source, `as const`) et `fr.ts` typé `Messages` (TypeScript refuse une clé manquante ; un test vérifie l'égalité des clés), `I18nProvider` + `useTranslation()` → `t('cle.pointee', { var })`, clés typées (autocomplétion, faute de frappe = erreur de compilation), repli sur l'anglais puis sur la clé, `<html lang>` synchronisé. Langue par défaut : `en`. Bascule vers react-i18next possible si besoin de pluriels complexes ou de chargement à la demande.
- **Conséquences** : aucun libellé visible en dur dans les composants (revue de code) ; le contenu scientifique (JSON) n'est **pas** dans ces dictionnaires — sa traduction est un sujet distinct (P2).

## ADR-016 — Architecture frontend + backend (site dynamique)

- **Statut** : Acceptée le 2026-11-14 (décision de l'équipe : « on veut un côté front et un backend ») ; **rôle fonctionnel de l'API ouvert (OPEN-18)**
- **Problème** : le CDC §7 prévoit un site statique sans serveur ; l'équipe veut un site dynamique avec un backend.
- **Options** : (a) rester 100 % statique (ADR-003/004) ; (b) frontend React + API Express en TypeScript ; (c) framework full-stack (Next.js, Remix/React Router framework mode).
- **Analyse** :
  - (a) Le plus simple à héberger, conforme au CDC. − Contraire à la décision de l'équipe.
  - (b) Réutilise l'existant (`backend/` Express 5), séparation nette, l'API peut servir le contenu et évoluer (recherche, quiz, statistiques anonymes). − Deux artefacts à déployer, CORS / proxy, l'interface doit gérer chargement et erreur réseau.
  - (c) Un seul projet, SSR possible. − Réécriture du frontend existant, courbe d'apprentissage en plein hackathon.
- **Décision** : (b). Backend en TypeScript (`backend/src/app.ts` construit l'app, `server.ts` écoute), tests avec Vitest + supertest, contrôlé par la même CI. En développement, Vite redirige `/api/*` vers `http://localhost:3000`.
- **Conséquences** :
  - L'hébergement doit couvrir un service Node (OPEN-05 réouverte).
  - Le contrat d'API (routes, formats, erreurs) devra être documenté avant son implémentation (OPEN-18).
  - Exigence de résilience : si l'API est indisponible, l'interface affiche un message clair et ne doit jamais afficher de donnée non sourcée.
  - Écart assumé avec le CDC §7, tracé ici.

### ADR-016 — complément (2026-11-14, OPEN-18 tranchée)

- Le contenu vit dans `backend/content/` (JSON versionnés, relus par PR). Le backend le charge au démarrage, le **valide** (règles V1–V12) et **refuse de démarrer** en cas d'erreur.
- API en lecture seule, localisée par `?lang=en` ou `?lang=fr` : contrat dans ARCHITECTURE §16.
- Toujours pas de base de données : la traçabilité scientifique passe par l'historique Git.

## ADR-017 — Médias référencés par URL, pas stockés dans le dépôt

- **Statut** : Proposée (choix fait pour le lot de contenu du 2026-11-14, à valider)
- **Problème** : l'équipe veut « tous les types d'images et de vidéos » des missions. Les vidéos et les images pleine résolution pèsent des centaines de Mo, et chaque média doit rester crédité et traçable.
- **Options** : (a) télécharger les fichiers dans `frontend/public/images/` ; (b) référencer les URL officielles (NASA, JPL, YouTube) avec légende, crédit et page source ; (c) mélange : références par défaut, copies optimisées uniquement pour les images affichées en premier.
- **Analyse** :
  - (a) Fonctionne même si les sites NASA sont indisponibles et donne le contrôle du poids. − Dépôt alourdi, droits à suivre fichier par fichier, travail d'optimisation.
  - (b) Rapide, toujours fidèle à la source, aucune donnée lourde dans Git. − Dépend de la disponibilité des sites NASA (les URL peuvent changer), pas de contrôle du poids des images.
  - (c) Bon compromis pour la démo. − Demande de trier les médias « de couverture ».
- **Décision proposée** : (b) maintenant, puis (c) en phase 5 pour les images de couverture (téléchargement **après accord humain**).
- **Conséquences** : entité `Media` (type, url, pageUrl, caption recopiée, alt fr/en, credit, license, missionIds, machineIds, sourceId). Contrôle des liens (QG-LINKS) indispensable avant la release ; jpl.nasa.gov renvoie 403 aux robots, donc ses pages se vérifient à la main.

## ADR-018 — Accueil immersif « depth journey » sans bibliothèque

- **Statut** : Acceptée le 2026-11-14 (demande explicite de l'équipe ; implémentée par US-2.1, PR #3)
- **Problème** : l'équipe veut un accueil centré sur la Lune et Mars, avec rotations au survol, distorsions au scroll et entrée « dans » la planète au clic, et que le scroll donne l'impression que **la page vient vers le visiteur** plutôt qu'un défilement vertical (barre de défilement masquée). SCOPE classait ces animations en P2 et DESIGN_SYSTEM limitait les animations à 200 ms.
- **Options** : (a) garder l'accueil sobre (conforme aux docs) ; (b) bibliothèque d'animation (GSAP, Framer Motion) ou 3D (three.js) ; (c) implémentation maison : CSS 3D, filtres SVG, canvas 2D, `requestAnimationFrame`, View Transitions natives.
- **Analyse** :
  - (a) Conforme, mais contraire à la demande de l'équipe.
  - (b) Rapide à écrire. − Nouvelles dépendances (poids, licence GSAP), WebGL coûteux sur mobile.
  - (c) Aucune dépendance, contrôle total de l'accessibilité. − Plus de code à maintenir, View Transitions absentes de certains navigateurs (repli : navigation simple).
- **Décision** : (c). `DepthJourney` (piste de scroll + scène `sticky` en perspective, caméra sur l'axe z, indicateur de parcours, snap de proximité, focus clavier qui déplace la caméra), `LivePlanet` (rotation, inclinaison, distorsion `feDisplacementMap`), `WarpField` (canvas), `viewTransition` de react-router pour le morph vers `/explore/:id`. Boucle d'animation unique par composant, écritures DOM directes, aucun rendu React par frame.
- **Conséquences** :
  - Exception tracée dans SCOPE (ligne P0) et DESIGN_SYSTEM (règle « Animations ») ; les animations avancées **dans les récits** restent P2.
  - `prefers-reduced-motion: reduce` : l'accueil devient des sections classiques, aucune animation ni transition (NFR-A11Y-006).
  - Barre de défilement masquée **uniquement** sur l'accueil (`html.depth-mode`), remplacée par un indicateur accessible.
  - À vérifier avant la démo : fluidité sur mobile bas de gamme, Safari et Firefox.

---

## ADR-019 — Pages Destination et Récit en scroll immersif continu

- **Statut** : Acceptée le 2026-11-14 (demande explicite de l'équipe, option A de `docs/project/stories/US-5.6.md` ; implémentée par US-5.6)
- **Problème** : l'équipe veut que **tout le site** soit une expérience au scroll « fixe », sans navigation compliquée, et pas seulement l'accueil (ADR-018). Le PRD impose pourtant pour le récit une liste d'étapes cliquable (STORY-004), Previous/Next et une progression qui ne dépend jamais du seul défilement (STORY-005), l'étape dans l'URL (NAV-004) et un récit complet sans animation (STORY-009). SCOPE classait le « scroll storytelling » des récits en P2.
- **Options** : (A) scroll continu partout, contrôles réduits à un HUD discret ; (B) un seul long scroll pour tout le site (casse NAV-004 : URLs, retour, partage) ; (C) scroll seul, sans boutons (contraire à STORY-004/005 et au clavier).
- **Décision** : (A), sans dépendance nouvelle.
  - **Destination** : planète épinglée (`PinnedDestinationPlanet`, une variable CSS `--p` écrite au scroll) qui s'enfonce en horizon derrière les missions ; une scène par mission ; scène finale « monde suivant » ; rail de sections (`JourneyRail`, ancres natives, scroll-spy par IntersectionObserver) à partir de `md`.
  - **Récit** : les 6 étapes rendues comme scènes plein écran d'un même scroll (`StepScene`) ; l'étape au centre de l'écran est écrite dans `?step=` (`replace`), les sauts (rail `StepRail`, `StoryControls` Previous/Next/Exit, touches ← →, retour navigateur) font `push` puis défilent vers la scène et y placent le focus. Couleur d'ambiance par étape (`@property --step-accent`).
  - **Global** : en-tête « verre » fixe, sélecteur EN/FR (choix mémorisé en `localStorage`), fond étoilé partagé, squelettes de chargement, `ScrollRestoration`.
- **Conséquences** :
  - Remplace le principe « un seul pas visible » d'ADR-014 : `StoryExperience` reste piloté par l'URL, la progression ne dépend toujours pas du seul scroll.
  - Exception d'animation étendue (DESIGN_SYSTEM §4) : apparitions au scroll ≤ 700 ms, transition de couleur d'ambiance 700 ms ; jamais porteuses d'information.
  - `prefers-reduced-motion: reduce` : planète non épinglée (rendue dans le héros), aucune apparition ni défilement animé ; les scènes restent des sections lisibles.
  - Rail de la destination masqué sous `md` (le scroll suffit, EQUIP-006 reste couvert à partir de `md`).
  - À vérifier avant la démo : Safari/Firefox (View Transitions, `@property`), mobile bas de gamme (`backdrop-filter`).

## ADR-020 — Modèles 3D NASA affichés avec `@google/model-viewer`, chargé à la demande

- **Statut** : Acceptée — demande écrite de l'équipe le 2026-11-14 (« ajoute les modèles 3D avec model-viewer »)
- **Problème** : montrer en vraie 3D, que l'on peut faire tourner, les machines dont la NASA publie un modèle. Les liens « 3D » du contenu étaient des pages NASA intégrées (`gltf_embed`) : l'une renvoyait une 404 portant le logo NASA (interdit par CLAUDE.md §7), l'autre pointait vers un domaine retiré.
- **Options** :
  - (a) `<iframe>` des pages NASA ;
  - (b) `@google/model-viewer` lisant les fichiers `.glb` des « NASA 3D Resources » ;
  - (c) `three.js` seul, avec une visionneuse maison.
- **Analyse** :
  - (a) Aucune dépendance. − Pages tierces qui changent ou disparaissent, habillage et logo NASA, aucune maîtrise de l'accessibilité.
  - (b) Composant web standard : rotation à la souris, au toucher et au clavier, `alt`, rotation auto désactivable, contrôle du `touch-action` pour garder le défilement de la page. Licence Apache-2.0 ; dépend de `three` (MIT) et `lit` (BSD-3). − Bibliothèque lourde : environ 1 Mo, 291 Ko gzip.
  - (c) Plus léger en théorie. − Rotation, éclairage, chargement Draco, accessibilité et gestion des erreurs à écrire et à maintenir : disproportionné pour un hackathon.
- **Décision** : (b), avec les règles suivantes.
  - **Chargement à la demande** : `import('@google/model-viewer')` n'a lieu qu'au clic sur « Turn it in 3D » (`ModelViewer3D`). Vite en fait un fichier séparé, et le bundle principal ne grossit que d'environ 5 Ko.
  - **Médias par URL (ADR-017)** : les `.glb` sont lus sur `assets.science.nasa.gov`, qui répond `Access-Control-Allow-Origin: *` (vérifié le 2026-11-14). Aucun modèle n'est copié dans le dépôt.
  - **Aucune requête vers Google** : par défaut, `model-viewer` télécharge son décodeur Draco sur `www.gstatic.com`. Les modèles NASA étant compressés en Draco, le décodeur est servi par le site, dans `frontend/public/draco/`. Les fichiers sont copiés tels quels depuis `three@0.183.2` (Apache-2.0, voir `NOTICE.txt`) et configurés avant l'import. L'emplacement KTX2 pointe aussi vers le site (aucun modèle actuel n'utilise KTX2).
  - **Défilement préservé** : `disable-zoom`, car le zoom à la molette appelle `preventDefault` et bloquerait le parcours. `touch-action="pan-y"`.
  - **Mouvement réduit** : pas de rotation automatique.
  - **Seuls les fichiers `.glb`/`.gltf` sont affichés** (`lib/journey.ts → modelOf`). Les autres médias `3d-model` restent de simples liens vers leur page.
- **Conséquences** :
  - Dépendances ajoutées dans `frontend/` : `@google/model-viewer@^4.4.0` et `three@^0.183.2` (dépendance pair, déclarée explicitement).
  - Vite affiche un avertissement de taille pour le fichier `model-viewer`. Il est attendu, puisque ce fichier n'est chargé qu'à la demande.
  - Les tests remplacent le module (`vi.mock`), car jsdom n'a pas WebGL.
  - Le rendu réel a été vérifié dans Chromium : WebGL logiciel, 1440 et 360 px.

---

## ADR-021 — Vidéo d'introduction de l'équipe et ciel commun au site

- **Statut** : Acceptée le 2026-11-14 (demande explicite de l'équipe ; US-2.4)
- **Problème** : l'équipe fournit une vidéo (9,5 s : surface de la Lune, titre « The Next Frontier », puis la Lune et Mars sur la Voie lactée) et veut qu'elle ouvre le site, que l'accueil apparaisse à sa fin (deux planètes en surbrillance, titre « Choisis ta destination » tapé à la machine), et que le fond de la vidéo devienne le fond de tout le site.
- **Décision** :
  - Fichiers **dans le dépôt** (`frontend/public/media/`) : contrairement aux médias NASA servis par référence (ADR-017), c'est un élément d'interface fourni par l'équipe. `intro.mp4` réencodée en H.264 sans piste audio (0,69 Mo, `faststart`), `intro-poster.jpg` (première image), `space-bg.jpg` (dernière image **sans les planètes**, retouchée : diffusion du ciel et réemploi du grain d'étoiles des bords de l'image, 1696 × 956, 161 Ko).
  - `IntroVideo` : plein écran au-dessus de l'accueil, **muette** (seule une vidéo muette démarre automatiquement), bouton « Passer l'intro » (focalisé) et touche Échap ; jouée **une fois par visite** (`sessionStorage`) ; ignorée sous `prefers-reduced-motion` et si le navigateur refuse la lecture ; en portrait, vidéo entière (`object-contain`). Badge « Contient des animations » (MEDIA-001 : les planètes de la vidéo sont des images de synthèse).
  - Fondu croisé de 900 ms : l'accueil s'allume pendant que la vidéo s'efface ; planètes en halo pulsé (`.planet-glow`) ; titre révélé lettre par lettre sans décaler la mise en page (le texte complet reste lu par les lecteurs d'écran).
  - Ciel commun : classe `.space-sky` sous le champ d'étoiles de toutes les pages (voile sombre `--sky-veil`) ; vignette du champ d'étoiles allégée pour laisser voir la Voie lactée.
- **Conséquences** : la musique de la vidéo n'est pas utilisée. **Origine et licence de la vidéo à confirmer par l'équipe**, puis crédit dans About (ABOUT-001). Aucune dépendance ajoutée.
