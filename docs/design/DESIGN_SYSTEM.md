# Design system — AeroReborn (palette « COSMOS »)

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

Le guide fournit des couleurs par **famille d'objets** (étoiles, planètes rocheuses `#D97757`, nébuleuses…). AeroReborn n'affiche que deux destinations : seule **Planètes rocheuses `#D97757`** est pertinente (accent de la carte Mars). Aucune teinte dédiée n'existe pour un satellite naturel : la Lune utilise `--color-text-muted`/`--color-text` (à valider). Ces couleurs sont des repères d'interface, **jamais** une représentation des couleurs réelles.

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
| Exception : accueil (ADR-017) | Animations continues pilotées par le scroll et le pointeur (caméra en profondeur, rotation, filtres SVG de distorsion, canvas d'étoiles, View Transition ≤ 900 ms). Jamais porteuses d'information ; repli en sections statiques et aucune animation sous `prefers-reduced-motion` |

## 5. Rayons, espacements

- Conserver la variable `--radius` existante (0,625 rem) et l'échelle d'espacement Tailwind.
- Espacement minimal entre cibles tactiles : 8 px.
