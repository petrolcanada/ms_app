# FundLens — Design Direction

## Concept: "Precision Glass"

A dark-mode fintech dashboard where **data is the design**. Numbers are treated as first-class typography — sized, weighted, and color-coded to make buy/sell decisions almost intuitive at a glance. Think a Bloomberg terminal reimagined by a Swiss typographer.

---

## Design Principles

1. **Data Density with Clarity** — Pack information tightly, but use visual hierarchy (size, weight, color, spacing) to make it scannable in seconds.
2. **Color as Data** — Green/emerald for positive performance, coral/red for negative. Color is never decorative — it always encodes meaning.
3. **Signal System** — Each fund row includes a composite "Signal" badge (Strong / Buy / Hold / Weak) synthesized from performance + fees + ratings, giving users an at-a-glance recommendation.
4. **Typography as UI** — Financial numbers in monospace at generous sizes. Weight and opacity create hierarchy without needing borders or boxes.
5. **Restrained Motion** — Smooth transitions on hover, staggered fade-ins for table rows, but nothing flashy or distracting.

---

## Typography

| Role       | Font             | Weights      | Notes                                      |
|------------|------------------|--------------|---------------------------------------------|
| Headings   | Sora             | 400–700      | Geometric, precise, confident               |
| Body       | Be Vietnam Pro   | 300–600      | Clean, distinctive, readable at small sizes |
| Data       | Fira Code        | 400, 500     | Monospace for financial figure alignment     |

## Color Tokens

| Token            | Value                          | Usage                        |
|------------------|--------------------------------|------------------------------|
| `--bg-void`      | `#04060C`                      | Page background              |
| `--bg-base`      | `#080D16`                      | Content area                 |
| `--bg-surface`   | `#0E1521`                      | Cards, table rows            |
| `--bg-elevated`  | `#1A2438`                      | Hover states, elevated cards |
| `--border`       | `#1E293B`                      | Borders, dividers            |
| `--text-1`       | `#E2E8F0`                      | Primary text                 |
| `--text-2`       | `#94A3B8`                      | Secondary text               |
| `--text-3`       | `#64748B`                      | Tertiary / muted text        |
| `--emerald`      | `#10B981`                      | Positive values, buy signals |
| `--red`          | `#EF4444`                      | Negative values, sell signals|
| `--blue`         | `#3B82F6`                      | Neutral info, links          |
| `--amber`        | `#F59E0B`                      | Caution, warnings            |

## Radius & Spacing

- Border radius: `8px` (standard), `12px` (cards), `20px` (pills/badges)
- Base spacing unit: `4px` — all spacing is a multiple of 4
- Content max-width: `1400px`

---

## Key Pages

| Page              | File                    | Purpose                                         |
|-------------------|-------------------------|--------------------------------------------------|
| Fund Explorer     | `fund-explorer.html`    | Main dashboard — search, filter, browse funds    |
| Fund Detail       | `fund-detail.html`      | Deep-dive into a single fund across all domains  |
| Fund Screener     | `screener.html`         | Rank & compare funds with heatmap table          |

---

## Signal System

The **Signal** is the unique differentiator — a composite score synthesized from multiple data domains:

| Signal   | Color   | Criteria (conceptual)                        |
|----------|---------|----------------------------------------------|
| Strong   | Emerald | Top-quartile perf + low fees + high ratings  |
| Buy      | Emerald | Above-avg perf + reasonable fees             |
| Hold     | Blue    | Average across metrics                       |
| Weak     | Amber   | Below-avg perf or high fees                  |
| Avoid    | Red     | Bottom-quartile perf + high fees + low rating|

---

## Implementation Notes

- All mockups are **self-contained HTML** — open them directly in a browser
- Fonts loaded from Google Fonts CDN
- Realistic Canadian mutual fund / ETF sample data
- CSS-only animations (no JS libraries needed for motion)
- Designed at **1440px viewport** (desktop-first)
- These mockups serve as the visual specification for the React build
