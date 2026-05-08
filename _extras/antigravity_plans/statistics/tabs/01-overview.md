# IELTS Statistics: Overview Tab Requirements

## Core Requirements (Exactly 5)

| # | Requirement | Data Source |
|:--|:---|:---|
| 1.1 | **Estimated Overall Band & Target Gap** | Computed from Intensive mock history vs `IeltsProfile.targetBand` |
| 1.2 | **IELTS-Specific Daily Goal Tracker** | `IeltsProfile.dailyCommitmentMins` (Strictly IELTS time tracked today) |
| 1.3 | **Weekly IELTS Activity Heatmap** | 7-day grid mapping intensity of IELTS study sessions |
| 1.4 | **Recent IELTS Activity Feed** | Chronological timeline of latest completed lessons/mock tests |
| 1.5 | **Exam Countdown & Readiness Score** | Days to `IeltsProfile.examDate` + readiness % based on recent bands |

## Revamped Premium UI Concept
* **Aesthetic**: Glassmorphic Hero Dashboard. Move away from flat, boring cards.
* **Band Gap Indicator**: A large, glowing radial progress ring with smooth stroke animations on load. The center displays the estimated band, surrounded by a soft neon glow that changes color (red to green) as it approaches the target band.
* **Heatmap**: Instead of flat GitHub squares, use rounded, pill-shaped indicators with a vibrant primary-color opacity scale. Hovering over a day triggers a sleek floating tooltip with a glass blur backdrop, detailing exact minutes spent per skill.
* **Typography**: Use modern, bold sans-serif headers (e.g., Inter or Outfit) to make the numbers feel monumental.
