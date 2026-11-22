# Spyder Network Web v6.0.0 — 2026-11-22

## What has changed

A complete editorial redesign of the existing static website, with a strong architectural focus on **Spyder Network**, not only a wallet demo. Designed with a precise, light technical visual system, dark engineering illustrations, restrained blue accents and the original Spyder symbol. Mobile/tablet/desktop responsive layouts.

**Official research presence**: prominent links to Spyder Network Whitepaper v0.2.0, GitHub release/repository, Zenodo record, two DOI references and author Aziz Kodirov. License CC BY-NC-ND 4.0 is described strictly for the Whitepaper.

**New pages**: `whitepaper.html`, `coin.html`, `roadmap.html`. Redesigned existing 10 pages: home, chain, wallet, network, download, security, support, privacy, terms, 404. Updated sitemap and OG social-sharing image.

**Economic research**: research-stage M-01 cap hypothesis, provisional allocation chart, explanatory risk disclosure and functional network fee scenario control (100K–5M tx/day; $0.005 USD-equivalent assumed fee; 90% validator share). No token-price projections, yield promises, fake live stats, fake audits, live wallet connection, or spurious app links.

**Experience and engineering**: English, Russian and Uzbek Latin; language persistence with safe fallback; mobile menu keyboard access; native FAQ details/summary; responsive CSS; no external JS/CSS analytics or app dependencies. Versioned CSS/JS URLs. Existing verified app download constraints preserved.

## Deployment

Upload only `spyder-web-update-v6.0.0.zip` to the root of the SPYDER web repository on `main`. Existing workflow `SPYDER Web — Unpack` overlays contents; existing Cloudflare Worker workflow deploys `site/` to **`spider-ac`**. No workflow files or secret changes are in the ZIP. The separate domain `spyderchain.org` has not been deployed or configured.

## Verification

- Python static site validator PASS (13 HTML pages, all links, sitemap, languages, JS syntax).
- Node DOM contract tests PASS (73 assertions).
- Headless Chromium 39-viewport test PASS (390/768/1440 px; no horizontal overflow; no JS runtime errors).
- Tested via isolated in-memory preview; **not** a production deployment. Check DNS, redirects and device rendering on live domains after actions complete.
