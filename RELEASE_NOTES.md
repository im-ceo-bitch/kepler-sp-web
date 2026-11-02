# SPYDER Web v3 — 2026-11-02

Base: user-supplied current `kepler-sp-web-main 2.zip` (Website v2), not the previous v1 archive. Existing web pages, graphic assets and the Cloudflare Worker target are preserved.

## Deliverables

- Tangem-inspired premium addition on the home page: three high-contrast product principle panels with EN/RU descriptions and a verified-availability CTA.
- New `/download.html`: mobile and desktop product-availability page, iOS and Android platform panels, a premium device visualization, and a three-step safe-download guide. No unverified store URLs or invented release claims.
- New `/support.html`: self-service help center with nine EN/RU safety and product answers, client-only instant search, clear search, count, keyboard-friendly disclosure questions and safe-usage notice.
- Existing internal product pages and main CTAs now link to the new availability and support destinations. The product-page generator was updated so running it no longer removes these links.
- Search Engine sitemap updated, SEO canonical and internal link coverage expanded, asset browser cache reduced to 5 minutes (files are not fingerprinted).
- Static validator now also checks canonical links and sitemap completeness.
- Separate **updated unzip workflow** runs static validation before any site update commit. Worker deploy workflow remains unchanged and still targets existing Worker `spider-ac`.

## Local validation

- Static validation: 10 HTML pages, links, assets, translations, anchors, canonical URLs, sitemap, JS syntax.
- Playwright Chromium with `page.set_content`: UI and JS at 320, 390, 768, 1440 pixels on Home, Wallet, Download, Support. No JS errors or horizontal overflow; interactive help search, RU language and mobile menu confirmed.
- ZIP archive verified for its content paths; clean-overlay test on the exact supplied base and post-overlay validator.

## Limits

- No real Xcode/iOS runtime screenshots were generated. Website product mockups are illustrative and show no fabricated funds.
- Workflows and Cloudflare deployment were not run on GitHub or in the Cloudflare account here; token, domain, bot permissions and live production remain to be verified by GitHub/Cloudflare.
- Legal documents are preliminary website notices, not legal sign-off for a regulated financial service.
