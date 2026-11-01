# spyder.ac — SPYDER Website

Production-oriented static product website built from the approved SPYDER design prototype. HTML/CSS/JS only: no dependency install, no build process, no remote scripts. Cloudflare Pages publishes `site/`.

## Source alignment
- Brand symbols, wordmarks, and favicon originate from the attached `kepler-spider-main 4.zip` SwiftUI repository assets.
- Wallet layout follows WalletHomeView.swift (wallet header, balance card, supported Bitcoin/Ethereum/Solana and main navigation); no simulated asset values are presented as real.
- Messages and Touch are presented as product previews; in the app Touch still includes a simulated discovery mode.
- Website does not implement wallet transactions or web key entry.

## Quick start
`python3 -m http.server 8000 -d site` then open http://localhost:8000.

## Deployment
1. Install separately supplied `.github/workflows/spyder-web-unpack.yml` and `.github/workflows/spyder-cloudflare-pages.yml` through GitHub UI (not in site ZIP).
2. In Cloudflare create a **Pages → Direct Upload** project called **spyder-ac**, with production branch `main`. Do not also connect the Git repository for automatic Cloudflare builds.
3. Set GitHub Actions secrets `CLOUDFLARE_API_TOKEN` (Cloudflare Pages:Edit permission) and `CLOUDFLARE_ACCOUNT_ID`.
4. Upload `spyder-web-update-v1.zip` in repository root. The unpack action overlays files and removes that ZIP. Once complete, the deploy action publishes `site/`.
5. In Cloudflare Pages > Custom domains attach `spyder.ac` and optionally `www.spyder.ac`. For the root domain, configure Cloudflare nameservers in the registrar, then Cloudflare sets DNS records.

### Release notes
- `index.html`, `privacy.html`, `terms.html`, assets, SEO, robots and sitemap included.
- RU/EN language switching on homepage, product tabs, wallet balance mask, mobile menu and FAQ.
- App Store/TestFlight/Play Store links intentionally not fabricated; add only verified URLs after distribution is ready.
- Legal pages apply to static website only and need formal review and business operator details before commercial launch.
- There is no live blockchain Explorer or full Web Wallet on the website.
