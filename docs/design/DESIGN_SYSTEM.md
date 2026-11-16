# Design system — OrbeMoria (palette « Cosmic Knowledge »)

> Rôle BMAD : UX Designer · Version 2.0 (2026-11-16) · Palette **ORBEMORIA « Cosmic Knowledge »**, décidée par l'équipe : elle remplace la palette COSMOS (v1.0, 2026-11-14, source `identite_visuelle_cosmos_couleurs_typographies.pdf`).
> Principe : une seule identité pour le site, le logo, les icônes et les futures applications. Bleu nuit et cyan dominants, or pâle en accent précieux, lavande secondaire réservée à la mémoire et aux archives.
> Implémentation : `frontend/src/styles/tokens.css` (variables `--orbemoria-*`, utilitaires Tailwind ci-dessous), ADR-010.

## 1. Couleurs

### 1.1 Structure (fonds)

| Variable | Utilitaire | Nom | Hex | Usage |
|---|---|---|---|---|
| `--orbemoria-midnight` | `void` | Midnight Universe | `#071426` | Fond principal : profondeur, bleu nuit sans être noir |
| `--orbemoria-deep-space` | `deep-space` | Deep Space | `#0B1F35` | Navigation, cartes, menus, panneaux, sections |
| `--orbemoria-surface` | `nebula-surface` | Surface (dérivée) | `#102A44` | Surface surélevée sur Deep Space |
| `--orbemoria-border` | `stellar-border` | Bordure (dérivée) | `#1F4A5E` | Cyan très atténué : séparateurs **décoratifs uniquement** |

### 1.2 Identité

| Variable | Utilitaire | Nom | Hex | Usage |
|---|---|---|---|---|
| `--orbemoria-cosmic-cyan` | `cosmic-cyan` | Cosmic Cyan | `#36D6E7` | Couleur d'interaction : boutons principaux, liens, éléments actifs, **anneau de focus**, sélection |
| `--orbemoria-ice-cyan` | `ice-cyan` | Ice Cyan | `#A8F0F2` | Effets lumineux, illustrations, éléments de soutien |
| `--orbemoria-pale-gold` | `pale-gold` | Pale Gold | `#E8D6A5` | Identité du logo, détails précieux, badges, éléments éducatifs, boutons secondaires (transparent + bordure or) |
| `--orbemoria-archive-lavender` | `archive-lavender` | Archive Lavender | `#9B8CE8` | Accent secondaire : archives, mémoire, histoire, découverte. Avec parcimonie |

### 1.3 Contenu (texte)

| Variable | Utilitaire | Nom | Hex | Usage |
|---|---|---|---|---|
| `--orbemoria-starlight` | `starlight` | Blanc cassé | `#F1F5F9` | Titres et texte principal |
| `--orbemoria-moon-dust` | `moon-dust` | Moon Dust | `#A3B8CC` | Texte secondaire, légendes, crédits |

### 1.4 Repères d'objets célestes

Seule **Planètes rocheuses `#D97757`** est utilisée (accent de Mars). Ces couleurs sont des repères d'interface, **jamais** une représentation des couleurs réelles. Les couleurs réelles des astres (textures, `content/celestialBodies.ts`) ne font pas partie de la palette.

**Accent de monde (US-5.6)** : `--world-accent` (utilitaire `world`) vaut Cosmic Cyan sur la Lune et Rocky `#D97757` sur Mars (`[data-world]`). Couleur d'ambiance par étape de récit : Signal/Relay = Cosmic Cyan, Why = Ice Cyan, How/Your turn = Archive Lavender, Discovery = Pale Gold (`components/story/storySteps.ts`).

### 1.5 Répartition

| Élément | Couleur |
|---|---|
| Fond général | Midnight Universe |
| Navigation, cartes | Deep Space |
| Titres | Blanc cassé |
| Boutons principaux | Cosmic Cyan, texte Midnight |
| Boutons secondaires | Transparent + Pale Gold |
| Liens actifs | Cosmic Cyan |
| Archives, mémoire | Archive Lavender |
| Bordures | Cyan très atténué (décoratif) |
| Logo | Blanc + Cyan + Pale Gold |

Correspondance avec COSMOS (v1.0) : Void Black → Midnight Universe, Nebula Surface → Surface, Stellar Border → Bordure, Cosmic Indigo **et** Stellar Cyan → Cosmic Cyan, Nebula Purple → Archive Lavender, Stellar Gold → Pale Gold.

## 2. Contrastes vérifiés (WCAG 2.2, calculés le 2026-11-16)

| Premier plan | sur Midnight `#071426` | sur Deep Space `#0B1F35` | sur Surface `#102A44` | Verdict |
|---|---|---|---|---|
| Blanc cassé `#F1F5F9` | 16,86 | 15,19 | 13,34 | ✅ tout usage |
| Moon Dust `#A3B8CC` | 9,05 | 8,15 | 7,16 | ✅ texte courant |
| Cosmic Cyan `#36D6E7` | 10,49 | 9,46 | 8,30 | ✅ texte et focus |
| Ice Cyan `#A8F0F2` | 14,43 | 13,01 | 11,42 | ✅ |
| Pale Gold `#E8D6A5` | 12,83 | 11,57 | 10,16 | ✅ |
| Archive Lavender `#9B8CE8` | 6,43 | 5,79 | 5,09 | ✅ texte courant |
| Rocheuses `#D97757` | 5,92 | 5,33 | 4,68 | ✅ texte courant (limite sur Surface) |
| **Bordure `#1F4A5E`** | **1,93** | **1,74** | **1,53** | ❌ < 3:1 → **décoratif uniquement** |
| Midnight sur bouton Cosmic Cyan | 10,49 | — | — | ✅ texte de bouton plein |

**Conséquences** :
- Les composants interactifs (cartes cliquables, champs, marqueurs) ne sont **pas** délimités par la seule bordure `#1F4A5E` : différence de surface + un indicateur conforme (bordure ≥ 3:1 comme Moon Dust ou Pale Gold, ou icône/texte).
- Focus : anneau 2 px Cosmic Cyan + décalage 2 px (≥ 8:1 sur tous les fonds).
- Sélection : Cosmic Cyan **et** changement de forme/contour/épaisseur (NFR-A11Y-004).
- Ne jamais utiliser un surface `#12304D` ou plus clair sous un texte Rocheuses : il tombe sous 4,5:1.

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
- **Marque réduite** (en-tête, pied de page, icônes) : le « O » du logo, un anneau blanc cassé (`#F1F5F9`) traversé par une orbite Pale Gold (`#E8D6A5`, qui passe derrière puis devant l'anneau), une étoile au centre (`#E9FBFC`, halo Cosmic Cyan), sur une tuile Midnight → `#0B2A4A` pour les icônes. Le logo complet est illisible en dessous d'environ 200 px de large ; la marque réduite reste reconnaissable à 16 px (vérifié sur fond sombre et clair).
- **Couleurs** : la marque réduite et les icônes suivent la palette « Cosmic Knowledge » (Blanc + Cyan + Pale Gold). Le logo complet de référence (or saturé, violets) est **à harmoniser** : version 2 prévue avec le symbole orbital en or pâle et cyan, le livre ouvert en cyan et blanc, la lune en bleu glacé, ORBEMORIA en blanc, violet seulement si nécessaire. `og-image.jpg` sera régénérée depuis cette version 2.
- **Fichiers** (`frontend/public/`) : `favicon.svg` (tuile arrondie, source des icônes), `favicon.ico` (16, 32, 48), `apple-touch-icon.png` (180, plein cadre), `icon-192.png`, `icon-512.png` (tuile arrondie, coins transparents), `icon-maskable-512.png` (dessin réduit à 80 % dans la zone sûre), `og-image.jpg` (1200 × 630 : le logo complet et la mention « Independent project · not affiliated with NASA »). Dans l'interface : `LogoMark` (`components/brand/LogoMark.tsx`), version sans tuile ; l'étoile scintille (coupé sous `prefers-reduced-motion`).

