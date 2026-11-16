# User Flows — OrbeMoria

> Rôle BMAD : UX Designer · Version 1.0 (Phase 0) · Statut : **en attente de validation**
> Références : CDC §2–§5, [PRD.md](PRD.md). Les routes citées sont définies dans NAV-004 et [ARCHITECTURE.md §4](../architecture/ARCHITECTURE.md#4-routage-et-état-dans-lurl).

## 0. Carte des écrans

```mermaid
flowchart LR
    Home["/ <br/>Explore<br/>(choix destination)"]
    Moon["/explore/moon"]
    Mars["/explore/mars"]
    Detail["?machine=:id<br/>Fiche détaillée<br/>(panneau)"]
    Story["/stories/:storyId?step=n<br/>Récit 6 étapes"]
    About["/about<br/>About & Sources"]

    Home --> Moon
    Home --> Mars
    Moon --> Detail
    Mars --> Detail
    Detail --> Story
    Story -->|Exit / fin| Moon
    Story -->|Exit / fin| Mars
    Story -->|Autre destination| Home
    Home -.nav globale.- About
    Moon -.nav globale.- About
    Story -.SourceBadge.-> About
```

## 1. Sélection d'une destination (DEST-001 → 005)

```mermaid
flowchart TD
    A([Arrivée sur /]) --> B[Titre + introduction<br/>+ 2 grandes cartes Moon / Mars]
    B --> C{Mode d'interaction}
    C -->|Souris| D[Survol : état visuel]
    C -->|Clavier| E[Tab : focus visible]
    C -->|Toucher| F[Appui]
    D --> G[Activation de la carte entière]
    E -->|Entrée / Espace| G
    F --> G
    G --> H{prefers-reduced-motion ?}
    H -->|Non| I[Transition courte]
    H -->|Oui| J[Changement immédiat]
    I --> K([/explore/moon ou /explore/mars])
    J --> K
    B -.-> L[Nav : About & Sources]
```

**Points de contrôle** : aucune information révélée seulement au survol ; compteurs masqués tant que OPEN-07 n'est pas validé.

## 2. Exploration des équipements (EXPL, EQUIP, MAP, SYNC)

```mermaid
flowchart TD
    A([/explore/:destinationId]) --> B[En-tête : nom, contexte,<br/>« Back to destinations »]
    B --> C[Carte 2D schématique<br/>+ légende + crédit]
    B --> D[Barre « Jump to mission »]
    D --> E[Galerie groupée par mission]
    C --> E

    C -->|Activer un marqueur| F[Sélection équipement]
    E -->|Activer une carte| F
    F --> G[URL : ?machine=:id]
    G --> H[Galerie : carte mise en évidence<br/>+ défilement dans la vue]
    G --> I{Coordonnées sourcées ?}
    I -->|Oui| J[Carte : marqueur mis en évidence]
    I -->|Non| K[Mention « Location not mapped »<br/>aucun marqueur]
    H --> L[Fiche détaillée ouverte<br/>panneau desktop / plein écran mobile]
    J --> L
    K --> L

    C -. erreur de rendu .-> M[Error boundary :<br/>message + galerie seule]
    M --> E
```

### 2.1 Variante mobile (< 768 px)

```mermaid
flowchart TD
    A([/explore/mars sur téléphone]) --> B[En-tête compact]
    B --> C[Carte réduite ≤ 40 % hauteur<br/>bouton « Hide map »]
    C --> D[Galerie groupée par mission<br/>atteignable sans toucher la carte]
    D -->|Appui sur une fiche| E[Fiche plein écran]
    C -->|Appui sur un marqueur ≥ 44 px| E
    E -->|Close / retour navigateur| D
```

## 3. Consultation d'une mission

Dans le MVP, une mission n'est **pas une page** : c'est un groupe de la galerie, adressable par ancre (`#mission-{id}`), et le segment « Mission » du fil d'Ariane renvoie à cette ancre.

```mermaid
flowchart TD
    A([Page destination]) --> B{Accès à la mission}
    B -->|Jump to mission| C[Défilement vers #mission-id]
    B -->|Fil d'Ariane depuis une fiche ou un récit| C
    C --> D[Groupe : nom, période sourcée,<br/>présentation, équipements]
    D --> E{La mission a un récit principal ?}
    E -->|Oui| F[Bouton « Read the mission story »]
    E -->|Non| G[Pas de bouton ;<br/>fiches consultables]
    F --> H([/stories/:missionStoryId?step=1])
    D -->|Activer un équipement| I([Fiche détaillée])
```

## 4. Consultation d'une histoire (STORY-001 → 010)

```mermaid
flowchart TD
    A([Fiche détaillée]) --> B{Récit disponible ?}
    B -->|Récit individuel de l'équipement| C([/stories/:machineStoryId?step=1&from=:machineId])
    B -->|Sinon récit principal de la mission| D([/stories/:missionStoryId?step=1&from=:machineId])
    B -->|Aucun| Z[Pas de bouton « Discover its story »]

    C --> S
    D --> S
    S[Étape n / 6<br/>indicateur de progression]
    S --> V[Blocs avec VoiceTag :<br/>Fact · What it means · Imagine]
    V -->|SourceBadge| SB[Sources en popover<br/>sans quitter la lecture]
    SB --> S
    S -->|Next / Previous / clic sur une étape| S
    S -->|n = 6 « Your turn »| END[Fin : retour mission ·<br/>équipements associés · autre destination]
    S -->|Exit story à tout moment| X([Retour exploration])
    D -.récit principal.-> IND[Accès aux récits individuels<br/>des équipements cités]
    IND --> C
```

### 4.1 Séquence des six étapes

```mermaid
stateDiagram-v2
    direction LR
    [*] --> Signal
    Signal --> Why: Next
    Why --> How: Next
    How --> Discovery: Next
    Discovery --> Relay: Next
    Relay --> YourTurn: Next
    Why --> Signal: Previous
    How --> Why: Previous
    Discovery --> How: Previous
    Relay --> Discovery: Previous
    YourTurn --> Relay: Previous
    YourTurn --> [*]: Fin (choix de sortie)
    note right of Relay: relations documentées uniquement (SOURCE-005)
```

## 5. Retour vers l'exploration (NAV-002, NAV-003, STORY-006, STORY-008)

```mermaid
flowchart TD
    A([Récit, étape quelconque]) --> B{Action}
    B -->|Exit story| C([/explore/:destinationId?machine=:from])
    B -->|Fil d'Ariane › Destination| D([/explore/:destinationId])
    B -->|Fil d'Ariane › Mission| E([/explore/:destinationId#mission-id])
    B -->|Bouton retour navigateur| F[Étape précédente<br/>ou page précédente]
    B -->|Fin : autre destination| G([/explore/:autreDestination])
    B -->|Nav : Explore| H([/])
    C --> I[Équipement d'origine sélectionné,<br/>focus restauré sur sa carte]
    E --> J[Focus sur le titre du groupe]
```

**Règle** : à chaque retour, le focus clavier est placé sur un élément pertinent (titre de page, carte d'origine) et jamais perdu en haut du document sans annonce.

## 6. Tests UX associés (CDC §10)

| Test | Flux | Réussite |
|---|---|---|
| T1 Compréhension initiale | §1 | Identifie Moon et Mars et comprend qu'il faut choisir |
| T2 Découverte « équipement de la mission Spirit » | §2, §3 | Trouvé via le groupe de mission, sans la carte |
| T3 Carte et galerie | §2 | Correspondance marqueur ↔ fiche comprise |
| T4 Récit « ce que cet équipement a permis d'apprendre » | §4 | Atteint l'étape Discovery |
| T5 Sources | §4 (SourceBadge) | Trouve une source identifiable |
| T6 Retour « liste des équipements de Mars » | §5 | Revient sans se perdre |
