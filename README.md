# Spyder Network — Public Website (v6.0.0)

**Official public research presence** for Spyder Network, SpyderChain, SpyderCoin (SPD) and Spyder Wallet.

- Main public website: **https://spyder.ac/** (target custom domain)
- Separate SpyderChain domain owned by the project: **spyderchain.org** (routing/deployment is separate, and is not changed by this update)
- Whitepaper repository: https://github.com/im-ceo-bitch/spyder-network-whitepaper
- Archived Whitepaper: https://zenodo.org/records/24435471
- DOI v0.2.0: https://doi.org/10.5281/zenodo.24435471
- Concept DOI: https://doi.org/10.5281/zenodo.24435470
- Whitepaper author: **Aziz Kodirov**; published 2026-11-22
- Whitepaper license: **CC BY-NC-ND 4.0**; does **not** automatically license the website/code/marks.

> The site is **research-stage disclosure**. Model M-01, proposed emission, roadmap and validator economics are hypothetical. This website does not announce a public mainnet, token sale, exchange listing, registered trademark, independently verified audit or guaranteed SPD returns.

## Contents

13 responsive pages: overview, chain, coin, wallet, ecosystem, research/DOI, roadmap, security, app availability, questions, privacy, terms and 404. English/Russian/Uzbek Latin language switching. A non-transactional tokenomics fee stress-test, local language preference and accessible mobile navigation. No third-party libraries, analytics, backend, API keys, wallet links or real payments.

## Upload by existing GitHub ZIP workflow

**Do not unpack manually if the existing ZIP workflow is installed.**

1. Upload the deliverable archive named `spyder-web-update-v6.0.0.zip` to the repository root of branch `main`.
2. Keep **exactly one** `spyder-web-update*.zip` in root (remove any old pending archive before upload).
3. Wait for **SPYDER Web — Unpack** to apply the root-relative files and delete the ZIP.
4. Wait for **SPYDER Web — Cloudflare Worker** to validate and deploy **Worker `spider-ac`**.
5. Confirm `https://spyder.ac/`, `/whitepaper.html`, `/coin.html`, `/roadmap.html`, verify Russian & Uzbek, and hard-refresh on iPhone.

**No `.github` directory is included in this content update**. Existing workflows, Cloudflare secrets, Worker identity and domain routes remain unchanged. Uploading the ZIP does not alter `spyderchain.org` DNS or automatically publish to that domain.

## Source edits

Public HTML is generated from `scripts/build_pages.py`. Edit that script (not the generated HTML) to change content permanently.

```bash
python3 scripts/build_pages.py
python3 scripts/validate_site.py
node scripts/test_interactions.cjs
python3 -m http.server 8000 --directory site
```

CSS: `site/assets/styles.css`; JS: `site/assets/app.js`; official store/support URLs: `site/assets/site-config.js`. Leave unverified URLs blank. Images are existing Spyder brand assets; social sharing image is refreshed (`site/assets/og-spyder.png`). No CDN or font downloads.

The site's tokenomics scenario assumes 100K–5M transactions/day, USD-equivalent fee $0.005 and validator fee share 90%, strictly for mathematical illustration, not a forecast, proposal for actual mainnet tariffs or recommendation to buy SPD.

## Publish verification

- Static HTML validator: 13 pages, canonical URLs, sitemap, EN/RU/UZ attributes and local links.
- DOM contract tests: 73 assertions including navigation, locale, simulated annual fees, safe official download hosts and storage failure.
- Headless Chromium DOM and responsive checks: 13 pages × 390/768/1440 px = 39 viewports, no horizontal overflow or JS runtime errors, tested in an isolated in-memory preview.
- Screenshots: desktop/mobile visual review was performed in the authoring environment; live-domain rendering and real iPhone device testing have **not** been performed.
- No production deploy or Cloudflare credential access was performed.

## Known follow-ups

1. Before live financial operation: audit the production code, validate custody/recovery model, test independent validators and update legal documentation.
2. When official app listings exist: enter verified URL(s) into `site/assets/site-config.js`.
3. For `spyderchain.org`: configure its own domain route/site deployment deliberately; do not route it to unfinished services.
4. When new Whitepapers are archived: update publication DOI, citations, dates, model labels and links in `scripts/build_pages.py` together, rebuild, and deploy a new version.
