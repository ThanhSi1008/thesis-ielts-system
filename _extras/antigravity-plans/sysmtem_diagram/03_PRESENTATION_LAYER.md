# Phase 3: Presentation Layer Nodes

## Objective
Add the frontend client nodes to the top of the diagram.

## Exact Nodes to Draw

### Node 1: Frontend Web
- **Label**: `Frontend Web`
- **Sublabel**: `Next.js (React) + TailwindCSS`
- **Port**: `:3001`
- **Color**: Blue (presentation)
- **HTTP Client**: Axios (configured in `src/lib/api.ts`)
- **Auth Storage**: `localStorage` (keys: `accessToken`, `refreshToken`)
- **API Base URL**: `http://localhost:3000/api/v1` (connects to backend-core)
- **Also connects to**: Backend AI directly at `:8000/api/v1/chat` for the AI chatbot feature

#### Key Pages/Routes (for context, optional to show):
- `/login`, `/register` — Auth
- `/ielts/intensive/*`, `/ielts/advanced/*` — IELTS exam taking & results
- `/grammar/*` — Grammar lessons
- `/pronunciation/*` — Pronunciation practice
- `/vocab-lab/*` — Vocabulary lab
- `/shadowing-dictation/*` — Shadowing & Dictation
- `/community/*` — Community posts
- `/admin/*` — Admin panel
- `/pricing`, `/payment/*` — Subscription & payment
- `/profile/*` — User profile

### Node 2: Frontend Mobile
- **Label**: `Frontend Mobile`
- **Sublabel**: `Expo (React Native) + Expo Router`
- **Port**: N/A (native app)
- **Color**: Blue (presentation)
- **HTTP Client**: `fetch` API (via custom `ApiClient` class in `services/api-client.ts`)
- **Auth Storage**: `AsyncStorage` (keys: `accessToken`, `refreshToken`, `userData`)
- **API Base URL**: `http://192.168.1.24:3000/api/v1` (connects to backend-core on local network)
- **Does NOT connect to**: Backend AI. The mobile app has NO direct connection to the AI service.

#### Key Screens (for context, optional to show):
- Auth (login/register)
- IELTS exams
- Grammar lessons
- Vocabulary
- Shadowing
- VocabLab
- Profile & results

## CRITICAL DIFFERENCE Between Web and Mobile

| Aspect | Frontend Web | Frontend Mobile |
|--------|-------------|-----------------|
| **Backend Core** | ✅ Connects | ✅ Connects |
| **Backend AI (Chat)** | ✅ Connects directly | ❌ Does NOT connect |
| **HTTP Client** | Axios | fetch API |
| **Token Storage** | localStorage | AsyncStorage |

> This difference is IMPORTANT. The web frontend has a direct arrow to Backend AI for the chatbot. The mobile app does NOT.

## Layout Suggestion
Place both frontends at the **top** of the diagram:
```
┌─────────────────┐       ┌─────────────────┐
│  Frontend Web   │       │ Frontend Mobile  │
│  (Next.js :3001)│       │ (Expo/RN)        │
│                 │       │                  │
│  Axios + JWT    │       │  fetch + JWT     │
└────────┬────────┘       └────────┬─────────┘
         │                         │
         └─────────┬───────────────┘
                   │
                   ▼
           Backend Core (:3000)
```

Plus the additional direct arrow from Frontend Web to Backend AI.

## PlantUML Snippet

```plantuml
' === PRESENTATION LAYER ===
rectangle "Presentation Layer" as pres_layer #E3F2FD {
    rectangle "Frontend Web\n(Next.js :3001)\nAxios + JWT\nlocalStorage" as FW #2196F3
    rectangle "Frontend Mobile\n(Expo / React Native)\nfetch + JWT\nAsyncStorage" as FM #42A5F5
}
```

## Validation Checklist
- [x] Frontend Web shows port `:3001`
- [x] Frontend Mobile shows NO port (native app)
- [x] Both show their HTTP client library (Axios vs fetch)
- [x] Both show their auth token storage mechanism
- [x] Web has 2 arrows: one to Backend Core, one to Backend AI (chat)
- [x] Mobile has 1 arrow: only to Backend Core

**Implemented in:** `output/system_architecture.puml` (Presentation Layer + labeled `FW`/`FM` links). Remaining edges in Phase 5.
