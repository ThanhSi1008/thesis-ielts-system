# C4 Container Diagram — Suggestions for IELTS Master English AI

## Reference Style Analysis

The image you shared uses a **grouped-boundary** layout with these key visual traits:

| Trait | What the reference does |
|---|---|
| **Dashed-border groups** | Each logical boundary (Clients, API Gateways, Core Services, Databases, Event Platform) is a dashed rectangle with a label at the top-left |
| **Color-coded containers** | Every service box has a distinct saturated color (teal, purple, orange, green, brown, etc.) |
| **Database cylinders** | Databases are rendered as classic grey cylinders, grouped together on the right |
| **External systems** | External services (e.g. Payment Gateway) use a red/coral solid box, visually distinct from internal containers |
| **Arrow labels** | Every arrow carries a short verb/protocol label ("HTTPS", "Read / Write", "Authenticate", "Publish OrderCreated", etc.) |
| **Left → Right flow** | Clients on the far left, then gateways, then services, then databases on the far right |
| **Bottom event bus** | Kafka sits at the bottom in its own "Event Platform" boundary, with publish/consume arrows going up |

---

## Suggested Container Inventory

Map your system to these **C4 containers** (a container = a separately deployable/runnable unit):

### 1. Client Containers (left side, "Clients" boundary)

| Container | Technology | Shape |
|---|---|---|
| **Web App** | Next.js 14, React | Rounded box (teal/cyan) |
| **Mobile App** | React Native, Expo 54 | Rounded box (teal/cyan) |

> [!TIP]
> Add a stick-figure **Person** ("Student / Learner") above/beside the client apps with "Uses" arrows, just like the reference shows "Customer".

### 2. Reverse Proxy / API Gateway (second column, "API Gateway" boundary)

| Container | Technology | Shape |
|---|---|---|
| **Nginx Reverse Proxy** | nginx:alpine, SSL (Let's Encrypt) | Rounded box (purple/indigo) |

The reference has two gateways (Web + App). You only have **one Nginx** that routes both `/api/v1/*` and `/ai/*`, so a **single box** is sufficient. However, you could visually split routing with two labeled arrows out of Nginx:
- `/api/v1/*` → Backend Core
- `/ai/*` → Backend AI

### 3. Core Services (center, "Application Services" boundary)

| Container | Technology | Color suggestion |
|---|---|---|
| **Backend Core** | NestJS 10, TypeScript | 🟠 Orange |
| **Backend AI** | FastAPI, Python 3.11 | 🟢 Green |
| **Grafana Alloy** | Telemetry collector | 🟤 Brown/dark |

> [!IMPORTANT]
> In the reference, each microservice is its own box. Your system is **not** a full microservice architecture — it's a **modular monolith** (Backend Core) + **AI worker** (Backend AI). 
> 
> **Option A — Accurate (recommended for thesis):** Show Backend Core and Backend AI as two large boxes. Inside Backend Core, optionally list key modules as internal text (Auth, IELTS, Exams, Vocab Lab, Subscriptions, etc.) but **don't** draw them as separate containers.
> 
> **Option B — Exploded for visual richness:** If you want the diagram to look as "full" as the reference, you could break out Backend Core's major domains as labeled sub-boxes *inside* the Backend Core boundary (similar to how the reference has Auth Service, User Service, etc.). This is technically a **C4 Component view inside a Container diagram** — a hybrid approach. Label it clearly.

### 4. Data Stores (right side, "Data Stores" boundary)

| Container | Technology | Shape |
|---|---|---|
| **PostgreSQL** | Supabase (managed), PgBouncer | 🔵 Grey cylinder |
| **Redis** | Upstash (managed), TLS | 🔴 Grey cylinder |

### 5. Message Broker (bottom, "Messaging" boundary)

| Container | Technology | Shape |
|---|---|---|
| **RabbitMQ** | CloudAMQP (managed), AMQPS | 🟡 Colored box (orange/red like Kafka in reference) |

### 6. External Services (right side, "External Services" boundary)

| Container | Provider | Color |
|---|---|---|
| **Google Gemini AI** | Google | 🔴 Coral/Red box |
| **VNPay** | VNPay | 🔴 Coral/Red box |
| **Google OAuth** | Google | 🔴 Coral/Red box |
| **Cloudinary** | Cloudinary | 🔴 Coral/Red box |
| **Google Cloud Storage** | GCP | 🔴 Coral/Red box |

### 7. Monitoring (bottom-right, "Monitoring" boundary)

| Container | Provider |
|---|---|
| **Grafana Cloud** | Prometheus + Loki + Tempo |

### 8. CI/CD (bottom-left, "CI/CD" boundary — optional)

| Container | Provider |
|---|---|
| **GitHub Actions** | GitHub |
| **Google Container Registry** | GCP |

---

## Suggested Layout (spatial arrangement)

```
┌─────────────┐   ┌──────────────────┐   ┌──────────────────────────────────┐   ┌───────────────┐
│  CLIENTS    │   │  API GATEWAY     │   │  APPLICATION SERVICES            │   │  DATA STORES  │
│             │   │                  │   │                                  │   │               │
│  ┌────────┐ │   │  ┌────────────┐  │   │  ┌─────────────┐  ┌──────────┐  │   │  ╭─────────╮  │
│  │Web App │─┼──►│  │   Nginx    │──┼──►│  │Backend Core │─►│Backend AI│  │   │  │PostgreSQL│ │
│  └────────┘ │   │  │(Rev Proxy) │  │   │  │  (NestJS)   │  │(FastAPI) │──┼──►│  ╰─────────╯  │
│             │   │  └────────────┘  │   │  └──────┬──────┘  └────┬─────┘  │   │  ╭─────────╮  │
│  ┌────────┐ │   │                  │   │         │              │        │   │  │  Redis  │  │
│  │Mob App │─┼──►│                  │   │  ┌──────┴──────┐       │        │   │  ╰─────────╯  │
│  └────────┘ │   │                  │   │  │Grafana Alloy│       │        │   │               │
│             │   │                  │   │  └─────────────┘       │        │   └───────────────┘
│ 👤 Student  │   │                  │   │                        │        │
└─────────────┘   └──────────────────┘   └────────────────────────┼────────┘   ┌───────────────┐
                                                                  │            │EXTERNAL SVCS  │
                                          ┌───────────────┐       │            │ Gemini AI     │
                                          │  MESSAGING    │       │            │ VNPay         │
                                          │  ┌──────────┐ │◄──────┘            │ Google OAuth  │
                                          │  │ RabbitMQ │ │                    │ Cloudinary    │
                                          │  └──────────┘ │                    │ GCS           │
                                          └───────────────┘                    └───────────────┘
```

---

## Connection / Arrow Map

Here are all the arrows you should draw, with labels matching the reference style:

### Client → Gateway
| From | To | Label | Line style |
|---|---|---|---|
| Web App | Nginx | `HTTPS` | Solid |
| Mobile App | Nginx | `HTTPS` | Solid |
| Student (person) | Web App | `Uses` | Dashed |
| Student (person) | Mobile App | `Uses` | Dashed |

### Gateway → Services
| From | To | Label |
|---|---|---|
| Nginx | Backend Core | `/api/v1/* (REST/JSON)` |
| Nginx | Backend AI | `/ai/* (REST/JSON)` |

### Service ↔ Service
| From | To | Label |
|---|---|---|
| Backend Core | Backend AI | `Publish grading tasks (RabbitMQ)` |
| Backend AI | Backend Core | `HTTP callback (grading results)` |

### Services → Data Stores
| From | To | Label |
|---|---|---|
| Backend Core | PostgreSQL | `Read / Write (Prisma ORM)` |
| Backend Core | Redis | `Read / Write (Cache, Sessions)` |
| Backend AI | PostgreSQL | `Read / Write (psycopg2)` |

### Services ↔ Message Broker
| From | To | Label |
|---|---|---|
| Backend Core | RabbitMQ | `Publish: grading.writing, grading.speaking` |
| Backend AI | RabbitMQ | `Consume: grading tasks` |

### Services → External
| From | To | Label |
|---|---|---|
| Backend AI | Google Gemini AI | `LLM grading (API calls)` |
| Backend AI | Google Cloud Storage | `Store audio files` |
| Backend Core | Cloudinary | `Image upload/storage` |
| Backend Core | VNPay | `Payment processing (HMAC-SHA512)` |
| Backend Core | Google OAuth | `Authentication (OAuth 2.0)` |

### Monitoring
| From | To | Label |
|---|---|---|
| Grafana Alloy | Backend Core | `Scrape /metrics` |
| Grafana Alloy | Backend AI | `Scrape /metrics` |
| Grafana Alloy | Grafana Cloud | `Metrics / Logs / Traces` |

---

## Color Palette Suggestion (matching reference aesthetic)

| Element | Color (hex) | Usage |
|---|---|---|
| Client apps | `#00BCD4` (cyan/teal) | Web App, Mobile App |
| Nginx gateway | `#9C27B0` (purple) | Reverse proxy |
| Backend Core | `#FF9800` (orange) | NestJS service |
| Backend AI | `#4CAF50` (green) | FastAPI service |
| Grafana Alloy | `#795548` (brown) | Telemetry collector |
| RabbitMQ | `#FF5722` (deep orange) | Message broker |
| Database cylinders | `#9E9E9E` (grey) | PostgreSQL, Redis |
| External services | `#F44336` (red/coral) | Gemini, VNPay, etc. |
| Boundary borders | `#90A4AE` (blue-grey) | Dashed group rectangles |
| Arrows | `#37474F` (dark grey) | Connection lines |
| Person icon | `#607D8B` | Stick figure actor |

---

## Styling Checklist

- [ ] **Dashed borders** for all logical grouping boundaries (Clients, API Gateway, Application Services, Data Stores, External Services, Messaging, Monitoring)
- [ ] **Group labels** in the top-left of each boundary box (use a lighter/pastel background tint)
- [ ] **Rounded rectangles** for all software containers
- [ ] **Cylinder shapes** for databases (PostgreSQL, Redis)
- [ ] **Stick-figure person** for the Student/Learner actor
- [ ] **White text on colored boxes** for container names
- [ ] **Technology subtitle** under each container name (e.g., "NestJS 10, TypeScript")
- [ ] **Arrow labels** on every connection (protocol, purpose, or data type)
- [ ] **Solid arrows** for synchronous calls (HTTP, direct DB)
- [ ] **Dashed arrows** for async/event-driven flows (RabbitMQ publish/consume)
- [ ] **Left-to-right flow** for the main request path
- [ ] **Bottom placement** for event bus / messaging (like Kafka in the reference)
- [ ] **Figure caption** at the bottom: *"Fig X. C4 Container Diagram — IELTS Master English AI System"*

---

## Recommended Tools

| Tool | Pros | Best for |
|---|---|---|
| **draw.io (diagrams.net)** | Free, runs in browser, export to PNG/SVG/PDF, has C4 shape library | Quick iteration, thesis exports |
| **Structurizr** | Purpose-built for C4, DSL-based, auto-layout | If you want code-as-diagram |
| **PlantUML + C4-PlantUML** | Text-based, version-controllable, C4 macros | If you prefer text → diagram |
| **Mermaid C4** | Markdown-friendly, GitHub renders it | Quick drafts |
| **Figma / PowerPoint** | Full design control | Pixel-perfect thesis diagrams |

> [!TIP]
> For a **thesis defense**, I'd recommend **draw.io** with the C4 shape library. It gives you the most visual control to match the reference style, exports cleanly to high-res PNG for your thesis paper, and is free.

---

## Key Differences From the Reference to Acknowledge

| Reference (Microservice Sample) | Your System |
|---|---|
| 7+ independent microservices | 2 services: modular monolith + AI worker |
| Each service has its own database | Shared PostgreSQL (via Prisma), shared Redis |
| Kafka event bus | RabbitMQ message broker |
| Multiple API gateways | Single Nginx reverse proxy |
| No monitoring shown | Full observability stack (Alloy → Grafana Cloud) |
| No CI/CD shown | GitHub Actions + GCR pipeline |

> [!IMPORTANT]
> Your system is architecturally simpler (fewer containers) but richer in external integrations and observability. **Lean into that** — show the monitoring and CI/CD boundaries that the reference omits. This makes your diagram more comprehensive and thesis-appropriate.

---

## Optional Enhancement: Deployment Boundary

Since your Backend Core, Backend AI, Nginx, and Grafana Alloy all run on the **same GCP VM**, you could add a **deployment boundary** (a solid-border box labeled `GCP VM (n2-standard-4)`) around those four containers. This mirrors your existing architecture diagram and adds deployment context that's valuable for a thesis.

Meanwhile, Web App sits on **Google Cloud Run** — you can indicate that with a separate deployment boundary or a small label.
