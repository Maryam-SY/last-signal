# Design system — OrbeMoria (palette « COSMOS »)

> Rôle BMAD : UX Designer · Version 1.0 (Phase 0) · Statut : **en attente de validation** (OPEN-01, OPEN-13)
> Source : `identite_visuelle_cosmos_couleurs_typographies.pdf` (« COSMOS · Explore Beyond »). « COSMOS » est le nom de la palette, **pas** le nom du produit (OPEN-01).
> Implémentation : `frontend/src/styles/tokens.css` (US-1.4), ADR-010.

## 1. Couleurs

### 1.1 Structure (fonds)

| Token | Nom | Hex | Usage |
|---|---|---|---|
| `--color-bg` | Void Black | `#080B12` | Fond principal |
| `--color-bg-elevated` | Deep Space | `#111827` | Sections, navigation, en-tête |
| `--color-surface` | Nebula Surface | `#1C2638` | Cartes, panneaux, fiches |
| `--color-border-subtle` | Stellar Border | `#334155` | Séparateurs **décoratifs uniquement** |

### 1.2 Identité (accents — avec parcimonie)

| Token | Nom | Hex | Usage proposé |
|---|---|---|---|
| `--color-accent` | Cosmic Indigo | `#8B9DFF` | Actions principales, liens, **anneau de focus** |
| `--color-accent-2` | Stellar Cyan | `#61D6E8` | Sélection (marqueur, carte sélectionnée), progression |
| `--color-accent-3` | Nebula Purple | `#B58AFF` | Voix « Imagine » |
| `--color-highlight` | Stellar Gold | `#E5C58D` | Découvertes (étape Discovery), voix « Fact » |

### 1.3 Contenu (texte)

| Token | Nom | Hex | Usage |
|---|---|---|---|
| `--color-text` | Starlight | `#F1F5F9` | Texte principal |
| `--color-text-muted` | Moon Dust | `#94A3B8` | Texte secondaire, légendes, crédits |

### 1.4 Repères d'objets célestes

Le guide fournit des couleurs par **famille d'objets** (étoiles, planètes rocheuses `#D97757`, nébuleuses…). OrbeMoria n'affiche que deux destinations : seule **Planètes rocheuses `#D97757`** est pertinente (accent de la carte Mars). Aucune teinte dédiée n'existe pour un satellite naturel : la Lune utilise `--color-text-muted`/`--color-text` (à valider). Ces couleurs sont des repères d'interface, **jamais** une représentation des couleurs réelles.

**Accent de monde (US-5.6)** : `--world-accent` (utilitaire Tailwind `world`) vaut Stellar Cyan sur la Lune et Rocky `#D97757` sur Mars (`[data-world]`). Couleur d'ambiance par étape de récit : Signal/Relay = Cyan, Why = Indigo, How/Your turn = Purple, Discovery = Gold (`components/story/storySteps.ts`).

## 2. Contrastes vérifiés (WCAG 2.2, calculés le 2026-11-14)

| Premier plan | sur Void `#080B12` | sur Deep Space `#111827` | sur Surface `#1C2638` | Verdict |
|---|---|---|---|---|
| Starlight `#F1F5F9` | 17,97 | 16,19 | 13,85 | ✅ tout usage |
| Moon Dust `#94A3B8` | 7,68 | 6,92 | 5,92 | ✅ texte courant |
| Cosmic Indigo `#8B9DFF` | 7,84 | 7,07 | 6,04 | ✅ texte et focus |
| Stellar Cyan `#61D6E8` | 11,52 | 10,38 | 8,88 | ✅ |
| Nebula Purple `#B58AFF` | 7,54 | 6,80 | 5,81 | ✅ |
| Stellar Gold `#E5C58D` | 11,91 | 10,73 | 9,18 | ✅ |
| Rocheuses `#D97757` | 6,30 | 5,68 | 4,86 | ✅ texte courant (limite sur Surface) |
| **Stellar Border `#334155`** | **1,90** | **1,71** | **1,47** | ❌ < 3:1 → **décoratif uniquement** |
| Void sur bouton Indigo | 7,84 | — | — | ✅ texte de bouton plein |

**Conséquences** :
- Les composants interactifs (cartes cliquables, champs, marqueurs) ne sont **pas** délimités par la seule bordure `#334155` : utiliser une différence de surface + un indicateur conforme (bordure ≥ 3:1 comme Moon Dust, ou icône/texte).
- Focus : anneau 2 px `--color-accent` + décalage 2 px (≥ 3:1 sur tous les fonds).
- Sélection : `--color-accent-2` **et** changement de forme/contour/épaisseur (NFR-A11Y-004).

## 3. Typographie

| Rôle | Police | Usage | Licence |
|---|---|---|---|
| Titres, accroches | **Space Grotesk** | `h1`–`h3`, titres d'étapes, noms de destination | SIL OFL 1.1 |
| Texte, interface | **Inter** | Paragraphes, boutons, navigation | SIL OFL 1.1 |
| Données scientifiques | **IBM Plex Mono** | Coordonnées, dates, identifiants NSSDCA | SIL OFL 1.1 |

- Chargement local via `@fontsource` (pas d'appel à Google Fonts au runtime) ; `font-display: swap`.
- Échelle proposée (mobile → desktop) : corps 16 px (min), `h1` 32 → 48 px, `h2` 24 → 32 px, interligne corps 1,5.
- IBM Plex Mono **uniquement** pour des valeurs sourcées : ne pas donner une « apparence de précision » à une valeur approximative.

## 4. Composants : règles visuelles

| Élément | Règle |
|---|---|
| `StatusBadge` | Icône + libellé texte ; couleur de renfort facultative |
| `VoiceTag` | Libellé texte (« Fact », « What it means », « Imagine ») + icône ; Fact = Gold, Interprétation = Indigo, Imagination = Purple |
| `MapMarker` | Cible 44 × 44 px ; repos : cercle contour Starlight ; sélectionné : cercle plein Cyan + anneau + taille ×1,25 |
| Cartes cliquables | Surface `#1C2638`, survol : éclaircissement, focus : anneau Indigo |
| Animations | Durée ≤ 200 ms, `opacity`/`transform` uniquement, supprimées sous `prefers-reduced-motion` |
| Couche « Transmission » (ADR-025, US-5.14) | Grain de film + vignette fixes (opacité ≤ 0,07, pas de mode de fusion) ; coins HUD (`HudCorners`) ; voyant d'état (`.led`, vert = fonctionne, or = contact perdu, rouge sombre = fin) **toujours avec son libellé** ; barres de signal décoratives ; titres « décodés » (`DecodeText`, texte réel en `sr-only`) ; actes colorés : Départ = Indigo, Mission = accent du monde, Prolongations = Gold, Silence = Moon Dust, Encore en service = vert `#4ade80` ; anneau de curseur sur écrans à souris seulement. Tout en `opacity`/`transform`, coupé sous `prefers-reduced-motion` |
| Exception : Destination et Récit (ADR-019) | Planète épinglée pilotée par le scroll, apparitions au scroll (`Reveal`, ≤ 700 ms), couleur d'ambiance par étape (700 ms), barre de progression. Jamais porteuses d'information ; supprimées sous `prefers-reduced-motion` |
| Panneaux « verre » | Utilitaire `glass` : fond Deep Space 55-72 % + flou ; le fond seul garantit le contraste si le flou n'est pas supporté |
| Ciel du site (ADR-021) | `.space-sky` : image `public/media/space-bg.jpg` (Voie lactée de la vidéo d'intro, planètes retirées) + voile Void Black (`--sky-veil`, 0,55 par défaut, 0,25 sur l'accueil), sous le champ d'étoiles ; le texte reste sur des panneaux ou un fond assez sombre |
| Exception : intro (ADR-021) | Vidéo plein écran ≤ 10 s, muette, passable (bouton + Échap), une fois par visite, fondu 900 ms ; titre tapé (70 ms/lettre) et halo pulsé des planètes ; rien sous `prefers-reduced-motion` |
| Exception : accueil (ADR-018) | Animations continues pilotées par le scroll et le pointeur (caméra en profondeur, rotation, filtres SVG de distorsion, canvas d'étoiles, View Transition ≤ 900 ms). Jamais porteuses d'information ; repli en sections statiques et aucune animation sous `prefers-reduced-motion` |

## 5. Rayons, espacements

- Conserver la variable `--radius` existante (0,625 rem) et l'échelle d'espacement Tailwind.
- Espacement minimal entre cibles tactiles : 8 px.

## 6. Logo (2026-11-16, remplace le « A » du 2026-11-15)

- **Logo de référence** : `docs/design/brand/orbemoria-logo.webp` (1536 × 1024), fourni par l'équipe : un petit rover à antenne parabolique sur une lune qui sort d'un livre ouvert, une orbite, le mot-symbole « ORBEMORIA », la phrase « Every object has a story. » et « Explore · Discover · Learn ». Illustration de marque, pas une image de mission : elle n'apparaît pas comme média dans l'interface. Pas de logo ni d'élément graphique de la NASA.
- **Marque réduite** (en-tête, pied de page, icônes) : le « O » du logo, un anneau blanc (`#f8f5f2`) traversé par une orbite dorée (`#f5b860`, qui passe derrière puis devant l'anneau), une étoile au centre (`#fff4dc`, halo doré). Le logo complet est illisible en dessous d'environ 200 px de large ; la marque réduite reste reconnaissable à 16 px (vérifié sur fond sombre et clair).
- **Couleurs** : l'or `#f5b860` et les violets du logo complet ne font pas partie des tokens COSMOS (`stellar-gold` vaut `#e5c58d`). Ils restent réservés au logo tant que l'équipe n'a pas décidé d'aligner la palette.
- **Fichiers** (`frontend/public/`) : `favicon.svg` (tuile arrondie, source des icônes), `favicon.ico` (16, 32, 48), `apple-touch-icon.png` (180, plein cadre), `icon-192.png`, `icon-512.png` (tuile arrondie, coins transparents), `icon-maskable-512.png` (dessin réduit à 80 % dans la zone sûre), `og-image.jpg` (1200 × 630 : le logo complet et la mention « Independent project · not affiliated with NASA »). Dans l'interface : `LogoMark` (`components/brand/LogoMark.tsx`), version sans tuile ; l'étoile scintille (coupé sous `prefers-reduced-motion`).

