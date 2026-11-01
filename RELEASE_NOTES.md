# SPYDER Web v2 — 2026-11-01

Based on the user's current `kepler-sp-web-main.zip` (the v1 website and existing Actions workflows). No existing product pages or assets were deleted.

## Improvements

- Three navigable, brand-consistent product pages: Wallet, Network and Chain/SPD, plus a dedicated Security Center and a branded 404.
- Main page: premium three-card product gallery, navigable ecosystem nodes, direct security-center CTA and enhanced details.
- RU/EN language switching on every page, with local preference persistence; legal pages show the selected language instead of two consecutive translations.
- Accessibility: keyboard-operable ARIA tabs, inert hidden mobile navigation, Escape to close, active navigation section indication, reduced-motion preferences, correct disabled tab panel semantics.
- Refinements: subtle orbital movement, pointer-responsive device, header progress indicator, scroll reveals, improved product layouts, mobile breakpoints down to 320px.
- SEO: canonical links, social card metadata, expanded sitemap.
- Added dependency-free static HTML/link/assets/anchor and JavaScript syntax validator.
- Actions: validation before the ZIP-apply commit, and deploy gating to avoid publishing a pending or invalid release. Workflows are supplied separately, not inside the ZIP.

## Known limits

The website is a static presentation, not a browser wallet. There are no verified app-store installation destinations, RPC endpoints, mainnet telemetry or independent audits shown. Illustrative wallet UI is not an actual runtime screenshot. The reviewed website notices still need operator details and legal assessment for a full public commercial release.

## Local checks

Tested HTML reference/anchor validator and Node JS syntax check; Playwright Chromium set-content harness at 1440 / 390 / 320px across the main page and 1440 / 390px across all product pages, testing interactive tabs, RU locale, mobile-menu/keyboard handling, and horizontal overflow. GitHub Actions and Cloudflare production deployment require the user's account and were not executed locally.
