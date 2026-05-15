# Phase 2: Backend Total Separation

## 1. Delete Unified Module
Remove `src/modules/shadowing` entirely.

## 2. Create Shadowing Module (`src/modules/shadowing`)
- **ShadowingModule**: Encapsulates all shadowing logic.
- **Controllers**: 
  - `ShadowingSystemLessonsController` (`GET /shadowing/system-lessons`)
  - `ShadowingUserVideosController` (`GET|POST /shadowing/videos`)
  - `ShadowingFoldersController` (`GET|POST /shadowing/folders`)
  - `ShadowingProgressController` (`GET|POST /shadowing/progress`)
- **Services**: Each controller will have its own service that explicitly queries `this.prisma.shadowingVideo`, `this.prisma.shadowingFolder`, and `this.prisma.shadowingProgress`.
- **DTOs**: `CreateShadowingVideoDto`, `UpdateShadowingVideoDto`, `UpsertShadowingProgressDto`.

## 3. Create Dictation Module (`src/modules/dictation`)
- **DictationModule**: Encapsulates all dictation logic.
- **Controllers**: 
  - `DictationSystemLessonsController` (`GET /dictation/system-lessons`)
  - `DictationUserVideosController` (`GET|POST /dictation/videos`)
  - `DictationFoldersController` (`GET|POST /dictation/folders`)
  - `DictationProgressController` (`GET|POST /dictation/progress`)
- **Services**: Each service explicitly queries `this.prisma.dictationVideo`, `this.prisma.dictationFolder`, and `this.prisma.dictationProgress`.
- **DTOs**: `CreateDictationVideoDto`, `UpdateDictationVideoDto`, `UpsertDictationProgressDto` (includes `difficulty`).

## 4. Notifications Integration
In `DictationProgressService`, ensure `NotificationsService.notifyDictationComplete` is called when a lesson is finished. No such notification exists for Shadowing unless specified.

## 5. AppModule Registry
Import both `ShadowingModule` and `DictationModule` independently into `app.module.ts`.
