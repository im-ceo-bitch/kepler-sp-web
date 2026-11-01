# SPYDER / spyder.ac — Website v2

Professional static marketing site, product stories and safety center. Uses the original SPYDER graphic assets. No frontend framework, npm install, third-party scripts, tracking cookies, account login or wallet key handling.

## Website structure

- `site/index.html` — full home experience (hero wallet visualization, product path cards, interactive product tabs, features, security, ecosystem, roadmap, FAQ)
- `site/wallet.html` — Spyder Wallet product page
- `site/network.html` — Spyder Network concept page
- `site/chain.html` — Spyder Chain and planned SPD overview
- `site/security.html` — security center and anti-phishing guidance
- `site/privacy.html`, `site/terms.html` — website-only documents in RU/EN; require legal and company-operator review for commercial operation
- `site/404.html` — branded 404
- `site/assets/` — self-hosted website CSS, JS and SPYDER assets
- `scripts/validate_site.py` — independent static release validation without pip dependencies
- `scripts/build_pages.py` — source generator for four inner pages (run only when editing those pages)

Public stage indicators are conservative: no invented third-party audits, revenue, token listings, mainnet performance, wallet balances or app store links.

## Preview and validation

```bash
python3 -m http.server 8000 -d site
python3 scripts/validate_site.py
```

Open http://localhost:8000. Mobile/tablet sizes, focus-visible states, reduced-motion and language controls should be checked when changing the UI. `node --check` is called by the validator where Node is present.

## GitHub ZIP release

The website update archive must be named `spyder-web-update*.zip` and placed at the **repository root**. Its contents are **root-relative**, not nested in a wrapping repository folder. It **does not** contain `.github/workflows/` because the existing unpacker deliberately skips GitHub config.

Install/replace both workflow files **separately**, via GitHub UI:

- `.github/workflows/spyder-web-unpack.yml`
- `.github/workflows/spyder-cloudflare-pages.yml`

Once the ZIP is pushed to `main`, the unpack workflow validates and commits the website and removes the upload ZIP. Only a **successful** unpack triggers the deploy workflow. Malformed files or broken links abort validation before the commit; a pending ZIP blocks a direct deployment as an extra guard.

## Cloudflare Pages deployment

The deploy workflow uses `cloudflare/wrangler-action@v4`, publishes the static `site/` directory as production on the Pages project named `spyder-ac`, and requires GitHub secrets:

- `CLOUDFLARE_API_TOKEN` — token with Pages:Edit permission scoped to the appropriate account
- `CLOUDFLARE_ACCOUNT_ID` — the Cloudflare account identifier

If the project is already **Git-integrated** (Cloudflare Connect to Git), disable **automatic production branch deployments** under **Pages → Build → Branch control** before using this separate Wrangler workflow, or Cloudflare may deploy twice. A Git-integrated Pages project can still accept Wrangler deployments. If you use Direct Upload, do not connect a second build integration. The production branch must be `main` and your custom domain needs to be attached in Cloudflare.

Do not assume `spyder.ac` is live until GitHub Actions and Cloudflare deployment are green and the custom domain is confirmed. The site uses plain files and has no build output directory beyond `site/`.

## Product and compliance notes

- This website is not a web wallet; it does not process deposits, seed phrases, signatures or transactions.
- Illustrative UI and unreleased features are marked. Add verified download URLs and tested security documentation only when confirmed.
- Legal notice applies **only** to the website; a production wallet requires its own policies, verified developer/operator details, threat-model documentation and jurisdiction-specific legal review.
- Choosing RU/EN saves only a language preference in browser `localStorage`.
