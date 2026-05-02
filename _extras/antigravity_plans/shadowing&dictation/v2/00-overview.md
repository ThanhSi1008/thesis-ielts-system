# V2 Plan: Total Physical Separation of Shadowing and Dictation

> **Goal**: Completely tear apart the unified "Shadowing & Dictation" module into two entirely independent, parallel systems. They will share absolutely nothing: separate database tables, separate backend modules, and completely isolated frontend routes.

## Rationale
While sharing a database table (`ShadowingVideo`) makes sense for content deduplication, it tightly couples the features. A physical separation allows the Dictation module to evolve its data schema (e.g., adding specific listening exercises) independently from the Shadowing module (e.g., adding phonetic grading or audio wave-forms). 

## Refactoring Phases

### Phase 1: Database Total Separation
- Duplicate the models in Prisma.
- `ShadowingVideo` -> `ShadowingVideo` & `DictationVideo`
- `ShadowingFolder` -> `ShadowingFolder` & `DictationFolder`
- `ShadowingDictationProgress` -> `ShadowingProgress` & `DictationProgress`
- Duplicate the seeding scripts so `npx prisma db seed` seeds both distinct tables.

### Phase 2: Backend Total Separation
- Eradicate the unified `ShadowingModule`.
- Create `src/modules/shadowing/` (ShadowingModule, ShadowingService, ShadowingController)
- Create `src/modules/dictation/` (DictationModule, DictationService, DictationController)
- Ensure all queries target their respective isolated tables.

### Phase 3: Frontend Routing & API Separation
- Delete the `frontend-web/src/app/shadowing-dictation` directory.
- Create `frontend-web/src/app/shadowing` (Top-level route).
- Create `frontend-web/src/app/dictation` (Top-level route).
- Split `shadowing.api.ts` into `shadowing.api.ts` and `dictation.api.ts`.
- Update the main Navigation Bar to show two distinct tabs.

### Phase 4: Frontend Implementation (Dictation)
- Build the isolated `/dictation` Library Page.
- Build the isolated `/dictation/my-videos` management page.
- Build the isolated `/dictation/[id]` practice page.
- Implement Dictation-specific hooks (`useDictation.ts`).

### Phase 5: Frontend Implementation (Shadowing)
- Build the isolated `/shadowing` Library Page.
- Build the isolated `/shadowing/my-videos` management page.
- Build the isolated `/shadowing/[id]` practice page.
- Implement Shadowing-specific hooks (`useShadowing.ts`).

---
*See the detailed markdown files in this folder for exact implementation steps for each phase.*
