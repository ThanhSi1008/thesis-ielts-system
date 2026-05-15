# Phase 4: External Services

## Objective
Add all third-party / cloud services the system depends on. Place on the right side or outside the main system boundary.

## Exact Nodes to Draw

### Node 1: Google Gemini API
- **Label**: `Google Gemini API` / **Sublabel**: `gemini-2.5-flash`
- **Protocol**: HTTPS (via `google-genai` Python SDK)
- **Color**: Purple (external)
- **Used by**: **Backend AI only** — writing grading, speaking grading, AI chatbot
- **NOT used by**: Backend Core

### Node 2: Cloudinary
- **Label**: `Cloudinary` / **Sublabel**: `Media CDN & File Storage`
- **Protocol**: HTTPS (via `cloudinary` Node.js SDK v2)
- **Color**: Purple (external)
- **Used by**: **Backend Core only** — file uploads/deletes via `StorageService`
- **Note**: Backend AI can *download* from Cloudinary URLs via HTTP GET, but doesn't use the SDK

### Node 3: Google OAuth
- **Label**: `Google OAuth` / **Sublabel**: `Identity Provider`
- **Used by**: **Backend Core only** (`AuthModule`)
- **Flow**: Frontend sends Google ID token → Backend Core validates → returns JWT

### Node 4: VNPay
- **Label**: `VNPay` / **Sublabel**: `Payment Gateway`
- **Used by**: **Backend Core only** (`SubscriptionsModule`)
- **Bidirectional**: Backend Core creates payment URL, VNPay sends IPN webhook callback

### Node 5: YouTube
- **Label**: `YouTube` / **Sublabel**: `Audio Source (via yt-dlp)`
- **Used by**: **Backend AI only** (`TranscriptionConsumer`)
- **How**: `yt-dlp` downloads audio in m4a for shadowing/dictation transcription

## Connection Summary

| External Service | Backend Core | Backend AI |
|-----------------|-------------|-----------|
| Google Gemini | ❌ | ✅ |
| Cloudinary | ✅ | ❌ |
| Google OAuth | ✅ | ❌ |
| VNPay | ✅ (bidirectional) | ❌ |
| YouTube | ❌ | ✅ |

## PlantUML Snippet

```plantuml
rectangle "External Services" as ext_layer #F3E5F5 {
    cloud "Google Gemini API\n(gemini-2.5-flash)" as GEMINI #9C27B0
    cloud "Cloudinary\n(Media CDN)" as CLOUD #9C27B0
    cloud "Google OAuth" as GAUTH #9C27B0
    cloud "VNPay\n(Payment Gateway)" as VNPAY #9C27B0
    cloud "YouTube\n(via yt-dlp)" as YT #9C27B0
}
```

## Validation Checklist
- [x] Gemini → Backend AI only
- [x] Cloudinary → Backend Core only
- [x] Google OAuth → Backend Core only
- [x] VNPay → bidirectional with Backend Core
- [x] YouTube → Backend AI only
- [x] No external service connects directly to any frontend

**Implemented in:** `output/system_architecture.puml` (`External Services` column + labeled edges).
