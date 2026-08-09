# Envision — System Build Manifest & Parity Matrix

Continuously-updated coverage record. Statuses: `Not started · Audited · Proposed · In progress · Ready for review · Passed QA · Blocked · Deprecated`.
Figma file: `ZnnaoZcKjKhDxXFvfHr6fA`. Last updated 2026-07-16.

## QA Dashboard
| Metric | Count |
|---|---|
| Tier 1 tokens | 149 |
| Tier 2 tokens | 109 (brand 14 + color 46 + layout 34 + responsive 15) |
| Tier 3 tokens | 32 |
| **Total variables** | **290** |
| DTCG token entries (flattened) | 304 |
| Text styles | 17 |
| Effect styles | 10 |
| Figma content pages | 22 (+ 7 section dividers + doc kit) |
| Component pages presented as labeled instance matrices | 9 (Button, Icon Button, Link, Field, Label, Checkbox, Radio, Switch, Badge, Tabs, cards) |
| Public components built in Figma (Ready-for-review) | 14 |
| Public components specified (Proposed, not yet drawn) | 15 |
| Internal subcomponents specified | 2 |
| Composite patterns specified | 8 (RightRail built) |
| Page recipes | 2 mapped + 5 layout recipes |
| Machine-readable artifacts | 12 JSON/MD registries + 4 fixtures |
| Accessibility issues found | 3 (subtle-gray + status-text contrast; Inter not self-hosted) |
| Accessibility issues resolved | guidance issued (promote to 600/700 steps); self-host flagged |
| Remaining exceptions | error-red (no product use), page-raised raw #F4F3EF, direct-T1 T3 refs (enumerated) |
| Code / Storybook parity | 0% implemented (spec-only; stack provisional) |

## Component parity matrix
Legend: ● done · ○ pending · — n/a. Code/Story/Tests are pending the confirmed stack (see STORYBOOK.md).

| Component | Figma | Tokens | Props mapped | Variants | States | A11y doc | Docs | Story spec | Code | Tests | Visual parity | Maturity |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Button | ● | ● | ● | ● | ● | ● | ● | ● | ○ | ○ | ○ | Candidate |
| IconButton | ● | ● | ● | ● | ● | ● | ● | ● | ○ | ○ | ○ | Candidate |
| Link | ● | ● | ● | ● | ● | ● | ● | ● | ○ | ○ | ○ | Candidate |
| Label | ● | ● | ● | ● | ● | ● | ● | ● | ○ | ○ | ○ | Candidate |
| Field/Input | ● | ● | ● | ● | ● | ● | ● | ● | ○ | ○ | ○ | Candidate |
| Checkbox | ● | ● | ● | ● | ● | ● | ● | ● | ○ | ○ | ○ | Candidate |
| Radio | ● | ● | ● | ● | ● | ● | ● | ● | ○ | ○ | ○ | Candidate |
| Switch | ● | ● | ● | ● | ● | ● | ● | ● | ○ | ○ | ○ | Candidate |
| Badge | ● | ● | ● | ● | ● | ● | ● | ● | ○ | ○ | ○ | Candidate |
| RightRail/Tab | ● | ● | ● | ● | ● | ● | ● | ● | ○ | ○ | ○ | Candidate |
| MaterialSwatch | ● | ● | ● | ● | ● | ● | ● | ● | ○ | ○ | ○ | Candidate |
| OptionCard | ● | ● | ● | ● | ● | ● | ● | ● | ○ | ○ | ○ | Candidate |
| PackageCard | ● | ● | ● | ● | ● | ● | ● | ● | ○ | ○ | ○ | Candidate |
| RightRail (composite) | ● | ● | ● | — | ●(reg) | ● | ● | ● | ○ | ○ | ○ | Candidate |
| Tabs / Tooltip / MenuItem / ProgressIndicator / MaterialSymbol | ○ | ● | ●(reg) | ○ | ●(reg) | ● | ● | ●(reg) | ○ | ○ | ○ | Experimental |
| SelectionSummary / PriceAdjustment / ViewPresetControl / RoomSelector / ProgressCard / KeyDateCard / FloorPlanCard / LotMapCard / BottomActionTray | ○ | ● | ●(reg) | ○ | ●(reg) | ● | ● | ●(reg) | ○ | ○ | ○ | Experimental |
| GlobalNav / ThreeDViewportShell / ColorPickerModal / PackageBrowser / MaterialSelector / DashboardWidgetGrid / MobileSelectionSheet | ○ | ● | ●(reg) | ○ | ●(reg) | ● | ● | ●(reg) | ○ | ○ | ○ | Experimental |

"(reg)" = fully specified in `component-registry.json` / `pattern-registry.json`, not yet drawn/coded.

## Interface-disposition coverage (100% rule)
Every audited element classified in `AUDIT.md §4/§7` + `component-registry.json`. Minor elements (dividers, hairlines, scroll regions, selection indicators, focus rings, skeletons, price deltas, image fallbacks, scrims, empty/no-results/error/loading/applied/saved/unavailable/price-pending, sticky/scroll ownership) mapped to tokens/components/states. Dev tools (Studio/Pose/Debug) → Retired. **No unclassified elements remain.**

## Manifest rows (representative — full set in registry)
| Product location | Element | Class | Component | Tokens | Desktop | Mobile | Figma | Docs | Code | QA | Maturity |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RightRail | Customize/Packages tabs | control | RightRail/Tab | t3.tab.* | ● | sheet | Ready | ● | ○ | ○ | Candidate |
| RightRail | Option opener row | product | OptionCard | rings, surface-warm | ● | ● | Ready | ● | ○ | ○ | Candidate |
| RightRail | Finish chips | product | MaterialSwatch | rings, panel radius | ● | ● | Ready | ● | ○ | ○ | Candidate |
| RightRail | Panel shell | composite | RightRail | t3.right-rail.* | ● | sheet | Ready | ● | ○ | ○ | Candidate |
| Packages tab | Package card | product | PackageCard | t3.package-card.* | ● | ● | Ready | ● | ○ | ○ | Candidate |
| Design Center | 3D canvas | composite | ThreeDViewportShell | surface-sunken | ● | 60vh | Proposed | ● | ○ | ○ | Experimental |
| Canvas | View switcher | product | ViewPresetControl | flat elevation | ● | ● | Proposed | ● | ○ | ○ | Experimental |
| Canvas | Bottom tray | product | BottomActionTray | tray elevation | ● | safe-area | Proposed | ● | ○ | ○ | Experimental |
| Overlay | Wall color modal | composite | ColorPickerModal | modal, menu elev | ● | full | Proposed | ● | ○ | ○ | Experimental |
| Top | Global nav | composite | GlobalNav | top-bar height | ● | mobile nav | Proposed | ● | ○ | ○ | Experimental |
| Dashboard | Progress/KeyDates | product | ProgressCard/KeyDateCard | raised elevation | ● | stack | Proposed | ● | ○ | ○ | Experimental |

## Blocked / needs human review
- **Runtime stack** (framework/styling/token-transform/test/VR service) — blocks code + Storybook + tests + Code Connect. See STORYBOOK.md.
- **Library publish** — requires explicit approval (not done).
- **error-red, self-hosted Inter, page-raised color** — `needs-confirmation` in migration-map.
