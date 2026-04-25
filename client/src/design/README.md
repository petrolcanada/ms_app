# Client Design System

Use this folder as the first stop for shared visual decisions.

## Source of Truth

- `tokens.js` owns semantic colors, font stacks, radius names, shadows, card variants, typography roles, and chart defaults.
- `theme.js` consumes these tokens to build the MUI theme.
- `styles/global.css` still exposes CSS custom properties for dark/light rendering and non-MUI surfaces. Keep values aligned with `tokens.js` until CSS variable generation is introduced.

## Component Rules

- Use `components/ui/AppCard.jsx` for cards and panels before creating a local card style.
- Use `components/charts/ChartCard.jsx`, `ChartTooltip.jsx`, and `rechartsTheme.js` for Recharts wrappers, tooltips, axes, grids, and series colors.
- Keep feature components focused on data and layout. Avoid local hex colors, raw shadows, and new border radius values unless a new token is added first.

## Recommended Migration Order

1. Replace page-local card wrappers with `AppCard`.
2. Move repeated select, tab, table, and badge styles into `components/ui`.
3. Replace hardcoded chart colors and tooltip styles with chart tokens.
4. Add a lint/check script for raw color and radius drift once the main screens are migrated.
