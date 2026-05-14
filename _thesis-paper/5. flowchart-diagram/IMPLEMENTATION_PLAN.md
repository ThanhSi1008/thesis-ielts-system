# Flowchart Implementation Plan

## Overview

This plan rebuilds `flowchart.drawio` in 7 phases. Each phase is self-contained — an implementing model only needs:
1. The current `flowchart.drawio` file
2. The specific phase instructions below

**Target file:** `flowchart.drawio` (Draw.io XML format)
**Goal:** Complete site-map flowchart for a TOEIC/IELTS learning web app

---

## XML Reference

Every node in drawio follows this pattern:

```xml
<!-- Node -->
<mxCell id="UNIQUE_ID" parent="1" style="STYLE_STRING" value="LABEL" vertex="1">
  <mxGeometry height="H" width="W" x="X" y="Y" as="geometry" />
</mxCell>

<!-- Edge (connection) -->
<mxCell id="UNIQUE_ID" edge="1" parent="1" source="SOURCE_ID" target="TARGET_ID"
  style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;">
  <mxGeometry relative="1" as="geometry" />
</mxCell>
```

**Node style for all phases:** `rounded=1;whiteSpace=wrap;html=1;`
**Edge style for all phases:** `edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;`

**ID convention:** Use prefix `p{phase}_{sequential}` (e.g., `p1_1`, `p1_2`, `p2_1`).

All new XML cells must be inserted **before** the `</root>` closing tag.

---

## Existing Node IDs (Reference)

These nodes already exist in the file. Use these IDs as edge sources/targets:

| ID | Label | Position (x, y) |
|---|---|---|
| `55mgsWNp9IpDhDoLJPvM-3` | Homepage | (395, 120) |
| `55mgsWNp9IpDhDoLJPvM-4` | Sign in | (395, 240) |
| `55mgsWNp9IpDhDoLJPvM-5` | Sign up | (560, 240) |
| `55mgsWNp9IpDhDoLJPvM-13` | User | (130, 360) |
| `55mgsWNp9IpDhDoLJPvM-20` | IELTS | (-220, 450) |
| `55mgsWNp9IpDhDoLJPvM-21` | Shadowing & Dictation | (70, 440) |
| `55mgsWNp9IpDhDoLJPvM-22` | Community | (250, 440) |
| `55mgsWNp9IpDhDoLJPvM-23` | Pricing | (390, 440) |
| `55mgsWNp9IpDhDoLJPvM-24` | Vocab Lab | (540, 440) |
| `55mgsWNp9IpDhDoLJPvM-25` | My Profile | (750, 440) |
| `55mgsWNp9IpDhDoLJPvM-26` | Sign out | (1010, 440) |
| `55mgsWNp9IpDhDoLJPvM-31` | Account Detail | (820, 490) |
| `55mgsWNp9IpDhDoLJPvM-33` | Security | (820, 550) |
| `55mgsWNp9IpDhDoLJPvM-34` | Gamification | (820, 610) |
| `55mgsWNp9IpDhDoLJPvM-35` | Danger Zone | (820, 670) |
| `55mgsWNp9IpDhDoLJPvM-47` | Decks | (560, 510) |
| `55mgsWNp9IpDhDoLJPvM-48` | Add | (560, 570) |
| `55mgsWNp9IpDhDoLJPvM-49` | Browse | (560, 630) |
| `55mgsWNp9IpDhDoLJPvM-50` | Vocab Lab Statistics | (560, 690) |
| `55mgsWNp9IpDhDoLJPvM-51` | Vocab Lab Community | (560, 750) |
| `55mgsWNp9IpDhDoLJPvM-52` | Shadowing | (105, 510) |
| `55mgsWNp9IpDhDoLJPvM-53` | Dictation | (105, 570) |
| `55mgsWNp9IpDhDoLJPvM-54` | My Shadowing | (105, 630) |
| `55mgsWNp9IpDhDoLJPvM-55` | My Dictation | (105, 690) |
| `55mgsWNp9IpDhDoLJPvM-56` | Feed | (265, 510) |
| `55mgsWNp9IpDhDoLJPvM-57` | My Activity | (265, 570) |
| `55mgsWNp9IpDhDoLJPvM-58` | Leader Board | (265, 630) |
| `55mgsWNp9IpDhDoLJPvM-59` | Dashboard | (-190, 520) |
| `55mgsWNp9IpDhDoLJPvM-60` | Foundation | (-190, 590) |
| `55mgsWNp9IpDhDoLJPvM-61` | Vocabulary | (-150, 660) |
| `55mgsWNp9IpDhDoLJPvM-62` | Pronunciation | (-150, 780) |
| `55mgsWNp9IpDhDoLJPvM-63` | Grammar | (-150, 720) |
| `55mgsWNp9IpDhDoLJPvM-64` | IELTS Basic | (-200, 840) |
| `55mgsWNp9IpDhDoLJPvM-66` | IELTS Advanced | (-200, 900) |
| `55mgsWNp9IpDhDoLJPvM-67` | IELTS Intensive | (-200, 960) |
| `55mgsWNp9IpDhDoLJPvM-68` | Mock Test | (-160, 1030) |
| `55mgsWNp9IpDhDoLJPvM-69` | Test History | (-160, 1090) |
| `55mgsWNp9IpDhDoLJPvM-70` | Roadmap | (-200, 1150) |
| `55mgsWNp9IpDhDoLJPvM-71` | IELTS Statistics | (-200, 1210) |
| `55mgsWNp9IpDhDoLJPvM-72` | Calculator | (-200, 1270) |
| `55mgsWNp9IpDhDoLJPvM-73` | Student/Teacher | (-200, 1330) |

---

## IMPORTANT: Before Starting Any Phase

1. **Delete the duplicate IELTS sub-tree** — Remove ALL nodes with IDs `55mgsWNp9IpDhDoLJPvM-107` through `55mgsWNp9IpDhDoLJPvM-128` (these are the disconnected nodes positioned around x:-2300 to x:-1320). These are lines ~157-222 in the current file.

---

## Phase 1: Connect All Existing Nodes with Edges

**Goal:** Wire up every existing floating node to its parent.

### Edges to Add

| Edge ID | Source (Parent) | Target (Child) |
|---|---|---|
| `p1_e1` | `55mgsWNp9IpDhDoLJPvM-13` (User) | `55mgsWNp9IpDhDoLJPvM-20` (IELTS) |
| `p1_e2` | `55mgsWNp9IpDhDoLJPvM-13` (User) | `55mgsWNp9IpDhDoLJPvM-21` (Shadowing & Dictation) |
| `p1_e3` | `55mgsWNp9IpDhDoLJPvM-13` (User) | `55mgsWNp9IpDhDoLJPvM-22` (Community) |
| `p1_e4` | `55mgsWNp9IpDhDoLJPvM-13` (User) | `55mgsWNp9IpDhDoLJPvM-23` (Pricing) |
| `p1_e5` | `55mgsWNp9IpDhDoLJPvM-13` (User) | `55mgsWNp9IpDhDoLJPvM-24` (Vocab Lab) |
| `p1_e6` | `55mgsWNp9IpDhDoLJPvM-13` (User) | `55mgsWNp9IpDhDoLJPvM-25` (My Profile) |
| `p1_e7` | `55mgsWNp9IpDhDoLJPvM-13` (User) | `55mgsWNp9IpDhDoLJPvM-26` (Sign out) |
| `p1_e8` | `55mgsWNp9IpDhDoLJPvM-20` (IELTS) | `55mgsWNp9IpDhDoLJPvM-59` (Dashboard) |
| `p1_e9` | `55mgsWNp9IpDhDoLJPvM-20` (IELTS) | `55mgsWNp9IpDhDoLJPvM-60` (Foundation) |
| `p1_e10` | `55mgsWNp9IpDhDoLJPvM-20` (IELTS) | `55mgsWNp9IpDhDoLJPvM-64` (IELTS Basic) |
| `p1_e11` | `55mgsWNp9IpDhDoLJPvM-20` (IELTS) | `55mgsWNp9IpDhDoLJPvM-66` (IELTS Advanced) |
| `p1_e12` | `55mgsWNp9IpDhDoLJPvM-20` (IELTS) | `55mgsWNp9IpDhDoLJPvM-67` (IELTS Intensive) |
| `p1_e13` | `55mgsWNp9IpDhDoLJPvM-20` (IELTS) | `55mgsWNp9IpDhDoLJPvM-68` (Mock Test) |
| `p1_e14` | `55mgsWNp9IpDhDoLJPvM-20` (IELTS) | `55mgsWNp9IpDhDoLJPvM-69` (Test History) |
| `p1_e15` | `55mgsWNp9IpDhDoLJPvM-20` (IELTS) | `55mgsWNp9IpDhDoLJPvM-70` (Roadmap) |
| `p1_e16` | `55mgsWNp9IpDhDoLJPvM-20` (IELTS) | `55mgsWNp9IpDhDoLJPvM-71` (IELTS Statistics) |
| `p1_e17` | `55mgsWNp9IpDhDoLJPvM-20` (IELTS) | `55mgsWNp9IpDhDoLJPvM-72` (Calculator) |
| `p1_e18` | `55mgsWNp9IpDhDoLJPvM-20` (IELTS) | `55mgsWNp9IpDhDoLJPvM-73` (Student/Teacher) |
| `p1_e19` | `55mgsWNp9IpDhDoLJPvM-60` (Foundation) | `55mgsWNp9IpDhDoLJPvM-61` (Vocabulary) |
| `p1_e20` | `55mgsWNp9IpDhDoLJPvM-60` (Foundation) | `55mgsWNp9IpDhDoLJPvM-63` (Grammar) |
| `p1_e21` | `55mgsWNp9IpDhDoLJPvM-60` (Foundation) | `55mgsWNp9IpDhDoLJPvM-62` (Pronunciation) |
| `p1_e22` | `55mgsWNp9IpDhDoLJPvM-21` (S&D) | `55mgsWNp9IpDhDoLJPvM-52` (Shadowing) |
| `p1_e23` | `55mgsWNp9IpDhDoLJPvM-21` (S&D) | `55mgsWNp9IpDhDoLJPvM-53` (Dictation) |
| `p1_e24` | `55mgsWNp9IpDhDoLJPvM-21` (S&D) | `55mgsWNp9IpDhDoLJPvM-54` (My Shadowing) |
| `p1_e25` | `55mgsWNp9IpDhDoLJPvM-21` (S&D) | `55mgsWNp9IpDhDoLJPvM-55` (My Dictation) |
| `p1_e26` | `55mgsWNp9IpDhDoLJPvM-22` (Community) | `55mgsWNp9IpDhDoLJPvM-56` (Feed) |
| `p1_e27` | `55mgsWNp9IpDhDoLJPvM-22` (Community) | `55mgsWNp9IpDhDoLJPvM-57` (My Activity) |
| `p1_e28` | `55mgsWNp9IpDhDoLJPvM-22` (Community) | `55mgsWNp9IpDhDoLJPvM-58` (Leader Board) |
| `p1_e29` | `55mgsWNp9IpDhDoLJPvM-24` (Vocab Lab) | `55mgsWNp9IpDhDoLJPvM-47` (Decks) |
| `p1_e30` | `55mgsWNp9IpDhDoLJPvM-24` (Vocab Lab) | `55mgsWNp9IpDhDoLJPvM-48` (Add) |
| `p1_e31` | `55mgsWNp9IpDhDoLJPvM-24` (Vocab Lab) | `55mgsWNp9IpDhDoLJPvM-49` (Browse) |
| `p1_e32` | `55mgsWNp9IpDhDoLJPvM-24` (Vocab Lab) | `55mgsWNp9IpDhDoLJPvM-50` (Vocab Lab Statistics) |
| `p1_e33` | `55mgsWNp9IpDhDoLJPvM-24` (Vocab Lab) | `55mgsWNp9IpDhDoLJPvM-51` (Vocab Lab Community) |
| `p1_e34` | `55mgsWNp9IpDhDoLJPvM-26` (Sign out) | `55mgsWNp9IpDhDoLJPvM-3` (Homepage) |

**Note:** My Profile (`-25`) already has edges to its children (Account Detail, Security, Gamification, Danger Zone) via existing edge IDs `-43`, `-44`, `-45`, `-46`. No need to add those.

---

## Phase 2: Add IELTS Foundation Sub-pages

**Goal:** Add deeper pages under Vocabulary, Grammar, and Pronunciation.

### New Nodes

| Node ID | Label | x | y | w | h | Connect FROM (parent) |
|---|---|---|---|---|---|---|
| `p2_1` | Book List | -50 | 660 | 90 | 40 | `55mgsWNp9IpDhDoLJPvM-61` (Vocabulary) |
| `p2_2` | Unit List | -50 | 730 | 90 | 40 | `p2_1` (Book List) |
| `p2_3` | Lessons | -50 | 800 | 80 | 40 | `p2_2` (Unit List) |
| `p2_4` | Topic List | -50 | 720 | 90 | 40 | `55mgsWNp9IpDhDoLJPvM-63` (Grammar) |
| `p2_5` | Lessons | -50 | 790 | 80 | 40 | `p2_4` (Topic List) |
| `p2_6` | Sound Map | -40 | 780 | 100 | 40 | `55mgsWNp9IpDhDoLJPvM-62` (Pronunciation) |
| `p2_7` | Practice | -40 | 850 | 90 | 40 | `p2_6` (Sound Map) |

**Layout note:** Position Pronunciation children (p2_6, p2_7) to the right of the Grammar children to avoid overlap. Adjust x to ~70 for p2_6 and p2_7 if needed.

### Edges to Add

One edge per row in the table above, connecting the `Connect FROM` parent to the new node.

---

## Phase 3: Add IELTS Basic Sub-pages

**Goal:** Add Onboarding, 4 Skill pages, Lessons, Exercises, Roadmap, Library under IELTS Basic.

### New Nodes

| Node ID | Label | x | y | w | h | Connect FROM |
|---|---|---|---|---|---|---|
| `p3_1` | Onboarding | -320 | 910 | 100 | 40 | `55mgsWNp9IpDhDoLJPvM-64` (IELTS Basic) |
| `p3_2` | Listening | -200 | 910 | 90 | 40 | `55mgsWNp9IpDhDoLJPvM-64` (IELTS Basic) |
| `p3_3` | Reading | -90 | 910 | 80 | 40 | `55mgsWNp9IpDhDoLJPvM-64` (IELTS Basic) |
| `p3_4` | Speaking | -200 | 970 | 90 | 40 | `55mgsWNp9IpDhDoLJPvM-64` (IELTS Basic) |
| `p3_5` | Writing | -90 | 970 | 80 | 40 | `55mgsWNp9IpDhDoLJPvM-64` (IELTS Basic) |
| `p3_6` | Lessons | -150 | 1040 | 80 | 40 | All 4 skill nodes above |
| `p3_7` | Exercises | -150 | 1110 | 90 | 40 | `p3_6` (Lessons) |
| `p3_8` | Roadmap | -320 | 970 | 90 | 40 | `55mgsWNp9IpDhDoLJPvM-64` (IELTS Basic) |
| `p3_9` | Library | -320 | 1040 | 80 | 40 | `55mgsWNp9IpDhDoLJPvM-64` (IELTS Basic) |

**Note for Lessons (`p3_6`):** Draw edges from all 4 skill nodes (`p3_2`, `p3_3`, `p3_4`, `p3_5`) to the single "Lessons" node.

---

## Phase 4: Add IELTS Advanced & Intensive Sub-pages

### New Nodes — Advanced

| Node ID | Label | x | y | w | h | Connect FROM |
|---|---|---|---|---|---|---|
| `p4_1` | Listening | -80 | 970 | 90 | 40 | `55mgsWNp9IpDhDoLJPvM-66` (Advanced) |
| `p4_2` | Reading | 30 | 970 | 80 | 40 | `55mgsWNp9IpDhDoLJPvM-66` (Advanced) |
| `p4_3` | Writing | 130 | 970 | 80 | 40 | `55mgsWNp9IpDhDoLJPvM-66` (Advanced) |
| `p4_4` | Speaking | 230 | 970 | 90 | 40 | `55mgsWNp9IpDhDoLJPvM-66` (Advanced) |
| `p4_5` | Part Detail | -20 | 1040 | 100 | 40 | `p4_1` AND `p4_2` |
| `p4_6` | Statistics | 330 | 970 | 90 | 40 | `55mgsWNp9IpDhDoLJPvM-66` (Advanced) |

### New Nodes — Intensive

| Node ID | Label | x | y | w | h | Connect FROM |
|---|---|---|---|---|---|---|
| `p4_7` | Exam List | -310 | 1030 | 100 | 40 | `55mgsWNp9IpDhDoLJPvM-67` (Intensive) |
| `p4_8` | Exam Taking | -310 | 1100 | 110 | 40 | `p4_7` (Exam List) |
| `p4_9` | Result | -310 | 1170 | 80 | 40 | `p4_8` (Exam Taking) |

---

## Phase 5: Add Shadowing & Dictation Detail Pages

### New Nodes

| Node ID | Label | x | y | w | h | Connect FROM |
|---|---|---|---|---|---|---|
| `p5_1` | Video List | 20 | 580 | 90 | 40 | `55mgsWNp9IpDhDoLJPvM-52` (Shadowing) |
| `p5_2` | Video Detail | 20 | 650 | 100 | 40 | `p5_1` (Video List) |
| `p5_3` | My Videos | 130 | 580 | 90 | 40 | `55mgsWNp9IpDhDoLJPvM-52` (Shadowing) |
| `p5_4` | Video List | 20 | 760 | 90 | 40 | `55mgsWNp9IpDhDoLJPvM-53` (Dictation) |
| `p5_5` | Video Detail | 20 | 830 | 100 | 40 | `p5_4` (Video List) |
| `p5_6` | My Videos | 130 | 760 | 90 | 40 | `55mgsWNp9IpDhDoLJPvM-53` (Dictation) |

---

## Phase 6: Add Vocab Lab Detail Pages

### New Nodes

| Node ID | Label | x | y | w | h | Connect FROM |
|---|---|---|---|---|---|---|
| `p6_1` | Deck Detail | 660 | 510 | 100 | 40 | `55mgsWNp9IpDhDoLJPvM-47` (Decks) |
| `p6_2` | Study Session | 660 | 580 | 110 | 40 | `p6_1` (Deck Detail) |

---

## Phase 7: Add Profile Subscription + Payment Flow + Admin Panel

### 7A — Profile: Add Subscription

| Node ID | Label | x | y | w | h | Connect FROM |
|---|---|---|---|---|---|---|
| `p7_1` | Subscription | 820 | 730 | 110 | 40 | `55mgsWNp9IpDhDoLJPvM-25` (My Profile) |

### 7B — Payment Flow (from Pricing)

| Node ID | Label | x | y | w | h | Connect FROM |
|---|---|---|---|---|---|---|
| `p7_2` | Payment Checkout | 390 | 510 | 140 | 40 | `55mgsWNp9IpDhDoLJPvM-23` (Pricing) |
| `p7_3` | VNPay Return | 390 | 580 | 120 | 40 | `p7_2` (Payment Checkout) |

### 7C — Admin Panel

| Node ID | Label | x | y | w | h | Connect FROM |
|---|---|---|---|---|---|---|
| `p7_4` | Admin | 1200 | 360 | 80 | 40 | `55mgsWNp9IpDhDoLJPvM-13` (User) |
| `p7_5` | Admin Dashboard | 1200 | 510 | 130 | 40 | `p7_4` (Admin) |
| `p7_6` | Shadowing Mgmt | 1200 | 580 | 140 | 40 | `p7_4` (Admin) |
| `p7_7` | Dictation Mgmt | 1200 | 650 | 130 | 40 | `p7_4` (Admin) |
| `p7_8` | Subscriptions Mgmt | 1200 | 720 | 150 | 40 | `p7_4` (Admin) |

---

## Execution Order

| Phase | Description | Depends On |
|---|---|---|
| Pre-work | Delete duplicate IELTS sub-tree (IDs `-107` to `-128`) | — |
| Phase 1 | Connect all existing nodes with edges | Pre-work |
| Phase 2 | IELTS Foundation sub-pages | Phase 1 |
| Phase 3 | IELTS Basic sub-pages | Phase 1 |
| Phase 4 | IELTS Advanced + Intensive sub-pages | Phase 1 |
| Phase 5 | Shadowing & Dictation detail pages | Phase 1 |
| Phase 6 | Vocab Lab detail pages | Phase 1 |
| Phase 7 | Profile + Payment + Admin | Phase 1 |

> Phases 2-7 are independent of each other and can be done in any order after Phase 1.

---

## Final Validation

After all phases, verify:
- [ ] Every node has at least one incoming edge (except Homepage)
- [ ] No floating/disconnected nodes remain
- [ ] No overlapping nodes (adjust positions in Draw.io)
- [ ] The duplicate sub-tree (x:-2300 region) is fully removed
- [ ] Open in Draw.io and visually confirm the hierarchy is readable
