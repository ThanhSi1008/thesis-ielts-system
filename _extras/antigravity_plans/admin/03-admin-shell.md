# Phase 3: Shared Admin Shell — Verified Reference

**Status:** ✅ Fully implemented (Phases 1 & 2 complete)

This document is the definitive reference for the admin shell infrastructure. Any future IELTS module admin (Phases 4–6) must extend — not re-implement — these pieces.

---

## Implemented Shell Files

| File | Lines | Purpose |
|---|---|---|
| `frontend-web/src/app/admin/layout.tsx` | 22 | Outer shell: `AdminGuard` + `AdminSidebar` + `<main>` |
| `frontend-web/src/app/admin/_components/AdminGuard.tsx` | 34 | Route protection — redirects non-ADMIN to `/` |
| `frontend-web/src/app/admin/_components/AdminSidebar.tsx` | 168 | Left sidebar with nav groups and "Soon" badges |
| `frontend-web/src/app/admin/page.tsx` | ~110 | Dashboard home with live stat cards |
| `frontend-web/src/services/admin.api.ts` | ~90 | `adminShadowingApi` + `adminDictationApi` |
| `frontend-web/src/components/Navbar.tsx` | modified | Admin link in profile dropdown (role-gated) |

---

## 1. `AdminGuard` — Route Protection

**File:** `frontend-web/src/app/admin/_components/AdminGuard.tsx`

**Behavior:**
- Reads `user` and `loading` from `useAuth()` (from `AuthContext`)
- While `loading = true`: shows a centered spinner
- If `user.role !== "ADMIN"` (or no user): calls `router.replace("/")` and renders `null`
- If `user.role === "ADMIN"`: renders `<>{children}</>`

**Used in:** `admin/layout.tsx` — wraps the entire admin section

**Do NOT duplicate this logic in individual admin pages.** The layout already handles it.

---

## 2. `AdminSidebar` — Navigation

**File:** `frontend-web/src/app/admin/_components/AdminSidebar.tsx`

**Structure:**
```
aside (w-[240px], sticky, border-r)
├── Header ("Admin" label + "Dashboard" text)
├── nav
│   ├── Group: "Content Management"
│   │   ├── Shadowing Lessons → /admin/shadowing    [ACTIVE]
│   │   └── Dictation Lessons → /admin/dictation    [ACTIVE]
│   └── Group: "IELTS"
│       ├── Basic   → /admin/ielts-basic    [disabled, "Soon" badge]
│       ├── Advanced → /admin/ielts-advanced [disabled, "Soon" badge]
│       └── Intensive → /admin/ielts-intensive [disabled, "Soon" badge]
└── Footer ("← Back to Site" link)
```

**`NavItem` interface:**
```typescript
interface NavItem {
  key: string;
  label: string;
  href: string;
  match: (p: string) => boolean;  // for active highlight
  icon: React.ReactNode;
  disabled?: boolean;             // shows "Soon" badge, not clickable
}
```

**Active state:** `item.match(pathname)` using `usePathname()` — highlights with `bg-primary/10 text-primary`

### To enable an IELTS module (when its admin phase is implemented):

In `NAV_GROUPS`, change `disabled: true` → `disabled: false` for the target item:

```diff
 {
   key: "ielts-basic",
   label: "Basic",
   href: "/admin/ielts-basic",
   match: (p) => p.startsWith("/admin/ielts-basic"),
   icon: <GraduationIcon />,
-  disabled: true,
+  disabled: false,
 },
```

### To add a brand-new module to the sidebar:

Add a new entry to the relevant `NavGroup.items` array:

```typescript
{
  key: "new-module",
  label: "New Module",
  href: "/admin/new-module",
  match: (p: string) => p.startsWith("/admin/new-module"),
  icon: <YourIcon />,        // inline SVG component
  disabled: false,
}
```

---

## 3. `admin/layout.tsx` — Shell Layout

**File:** `frontend-web/src/app/admin/layout.tsx`

```tsx
// Key structure:
<AdminGuard>
  <div className="flex h-[calc(100vh-56px)] overflow-hidden bg-gray-50 dark:bg-gray-950 relative">
    <AdminSidebar />
    <main className="flex-1 h-full overflow-y-auto">
      {children}
    </main>
  </div>
</AdminGuard>
```

**Height:** `h-[calc(100vh-56px)]` accounts for the global 56px Navbar.
**Overflow:** sidebar is fixed width, main area scrolls independently.
**Metadata:** `title: "Admin Dashboard | TOEIC Master AI"` — override per-page with `export const metadata` in individual page files.

---

## 4. `admin.api.ts` — API Service

**File:** `frontend-web/src/services/admin.api.ts`

Currently exports:
- `adminShadowingApi` — CRUD + YouTube import for `/admin/shadowing/lessons`
- `adminDictationApi` — CRUD + YouTube import for `/admin/dictation/lessons`

### To add a new module's API:

Append a new named export to this file:

```typescript
import type { YourType } from './your.api';

export const adminIeltsBasicApi = {
  getSkills: () =>
    api.get('/admin/ielts-basic/skills').then(r => r.data),

  getLessons: (skillId: string) =>
    api.get(`/admin/ielts-basic/skills/${skillId}/lessons`).then(r => r.data),

  createLesson: (skillId: string, dto: CreateLessonPayload) =>
    api.post(`/admin/ielts-basic/skills/${skillId}/lessons`, dto).then(r => r.data),

  updateLesson: (lessonId: string, dto: UpdateLessonPayload) =>
    api.patch(`/admin/ielts-basic/lessons/${lessonId}`, dto).then(r => r.data),

  deleteLesson: (lessonId: string) =>
    api.delete(`/admin/ielts-basic/lessons/${lessonId}`).then(r => r.data),
};
```

---

## 5. Navbar Admin Link

**File:** `frontend-web/src/components/Navbar.tsx`

Implemented in the profile dropdown:
```tsx
{user.role === "ADMIN" && (
  <Link href="/admin" ...>
    {/* Settings cog icon */}
    Admin Dashboard
  </Link>
)}
```

**No changes needed** for future module additions — the link always points to `/admin` (the dashboard home).

---

## Backend Conventions (All Phases)

### Guard Stack
```
Request
  → JwtAuthGuard   (validates JWT, injects user into req.user)
  → RolesGuard     (reads @Roles() metadata, checks req.user.role)
  → Controller method
```

### Existing Guards (DO NOT re-create)
| Guard/Decorator | Location |
|---|---|
| `JwtAuthGuard` | `modules/auth/guards/jwt-auth.guard.ts` |
| `RolesGuard` | `common/guards/roles.guard.ts` |
| `@Roles('ADMIN')` | `common/decorators/roles.decorator.ts` |

### Controller Template for a New Admin Module
```typescript
@Controller("admin/{module}/...")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
export class Admin{Module}Controller {
  constructor(private readonly service: Admin{Module}Service) {}
  // CRUD methods
}
```

---

## Frontend Directory Template (New Module)

```
frontend-web/src/app/admin/{module}/
├── page.tsx                           # List page (table + delete modal + import modal)
├── new/
│   └── page.tsx                       # Create form page (thin shell)
├── [id]/
│   └── edit/
│       └── page.tsx                   # Edit form page (loads data then renders EditForm)
├── _hooks/
│   ├── useAdmin{Module}List.ts        # Fetch, delete, import mutations (SRP)
│   └── useAdmin{Module}Form.ts        # Form state, validation, submit (SRP)
└── _components/
    ├── {Module}LessonForm.tsx         # Shared create/edit form (3 sections: Info, Media, Content)
    └── {Module}ContentEditor.tsx      # Domain-specific content array editor
```

### List Hook Pattern
```typescript
export function useAdmin{Module}List() {
  const [items, setItems] = useState<{Type}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // fetchItems, deleteItem, importYoutube, refreshItem

  return { items, isLoading, error, deleteItem, importYoutube, isImporting, refetch };
}
```

### Form Hook Pattern
```typescript
export function useAdmin{Module}Form(initialData?: {Type}) {
  const [formData, setFormData] = useState<{FormData}>(() =>
    initialData ? mapToFormData(initialData) : DEFAULT_FORM
  );
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // setField, addItem, removeItem, updateItem, moveItem, validate, buildPayload

  return { formData, errors, isSubmitting, setField, ..., submitCreate, submitUpdate };
}
```

---

## Module Roadmap

| Module | Admin Route | Backend Route | Status |
|---|---|---|---|
| Shadowing | `/admin/shadowing` | `admin/shadowing/lessons` | ✅ Done (Phase 1) |
| Dictation | `/admin/dictation` | `admin/dictation/lessons` | ✅ Done (Phase 2) |
| IELTS Basic | `/admin/ielts-basic` | `admin/ielts-basic/...` | 🔲 Future (Phase 4) |
| IELTS Advanced | `/admin/ielts-advanced` | `admin/ielts-advanced/...` | 🔲 Future (Phase 5) |
| IELTS Intensive | `/admin/ielts-intensive` | `admin/ielts-intensive/...` | 🔲 Future (Phase 6) |

> **IELTS modules** require a separate schema-level plan before admin UI can be built. Each involves a nested hierarchy (`Skill → Lesson/Test → Exercise/Part → QuestionGroup → Question`). Consult the IELTS schema docs before starting those phases.

---

## Validation Checklist (Completed)

- [x] `AdminGuard` blocks non-ADMIN users at the layout level
- [x] `AdminSidebar` shows active state via `usePathname()`
- [x] IELTS items in sidebar show "Soon" badge and are not clickable
- [x] Admin layout uses `h-[calc(100vh-56px)]` to sit below the global Navbar
- [x] "Admin Dashboard" link in Navbar is visible only when `user.role === "ADMIN"`
- [x] `admin.api.ts` exports both `adminShadowingApi` and `adminDictationApi`
- [x] Dashboard home page shows live counts for both Shadowing and Dictation lessons
