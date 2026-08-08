# Singapore HDB Resale Price Dashboard (2012–2025)

An interactive dashboard exploring **311,424 HDB resale transactions** across Singapore from March 2012 to December 2025 — built to help both flat buyers and the curious understand a decade of the public housing resale market.

**Live demo → https://sghdbresale.com**

---

## What's inside

Six pages, each answering a different question:

- **Market Overview** — What has the market done over the decade? Median prices, transaction volume, flat-type mix, and a town-by-town comparison, all driven by an adjustable year-range and flat-type filter. Includes a price-vs-growth bubble chart positioning every town.
- **Find a Flat** — A budget-driven decision tool. Enter your budget, flat type, walking distance to MRT, and minimum remaining lease, and it ranks the towns where you can actually buy — backed by a real boundary map of Singapore and a full affordability matrix.
- **Analysis by Town** — How much does being near a train station actually cost? Prices broken down across five distance bands (≤200m to >2km), using block-level geocoding.
- **By District** — All 24 postal districts that contain HDB flats, ranked by median price, price per sqft, volume and growth, with a trend chart comparing up to four at a time.
- **This Year** — The current year to date, month by month, as a town × flat-type heatmap. The one place on the site that shows the incomplete current year.
- **Insights** — Five counterintuitive findings buried in the data: the million-dollar-flat explosion, the 80-year lease cliff, the storey premium, the towns the post-COVID boom forgot, and how small flats were left behind.

## Data sources

- **Resale transactions:** [data.gov.sg](https://data.gov.sg) — HDB resale flat prices (Mar 2012 onwards).
- **Geocoding & MRT distances:** [OneMap API](https://www.onemap.gov.sg) — every block geocoded to compute straight-line distance to the nearest MRT station. **LRT stops are not included**, so Punggol, Sengkang, Bukit Panjang and Choa Chu Kang read as further from rail than they walk; distances also use today's network, so a 2013 sale near a line that opened later still counts as close to it.
- **Town boundaries:** URA Master Plan planning-area subzones.

## Notes on methodology

- "Affordable" on the Find a Flat page means the **2025 median** for that town, flat type, lease threshold and distance band is at or below your budget — roughly a coin-flip, since half of actual sales were above the median.
- Two totals appear across the site and both are right: **311,424** sales in 2012–2025, and **311,032** on the Analysis by Town page, which can only cover blocks matched to a station (392 could not be geocoded).
- Remaining lease is derived from each flat's lease-commencement date (99 years minus age), giving complete coverage across all years.
- Some figures rest on small transaction counts in thinly-traded slices; these are shown rather than hidden, but should be read as indicative.
- A few prices in the "Over 2km" MRT band reflect a composition effect (newer, larger flats in less-dense areas) rather than a genuine distance premium — noted on the relevant page.

## Built with

Plain HTML, CSS, and vanilla JavaScript with hand-rolled inline SVG charts — **no frameworks, no runtime dependencies.** Every page is a single self-contained file that works offline, installable as a PWA.

Data is aggregated in Python and inlined at build time. Pages 2, 3, 5 and 6 are generated from templates in the parent folder (`build_page2.py`, `build_page3.py`, `build_page5.py`, `build_page6.py`) — edit the template, not the file in `github/`. The Overview and Insights pages are still hand-maintained with their data pasted in.

---

*Built as a personal project. Not financial advice — just data.*
