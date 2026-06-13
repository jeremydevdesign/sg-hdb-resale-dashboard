# Singapore HDB Resale Price Dashboard (2012–2025)

An interactive dashboard exploring **321,762 HDB resale transactions** across Singapore from March 2012 to December 2025 — built to help both flat buyers and the curious understand a decade of the public housing resale market.

**Live demo → https://jeremydevdesign.github.io/sg-hdb-resale-dashboard/**

---

## What's inside

The dashboard has four pages, each answering a different question:

- **Market Overview** — What has the market done over the decade? Median prices, transaction volume, flat-type mix, and a town-by-town comparison, all driven by an adjustable year-range and flat-type filter. Includes a price-vs-growth bubble chart positioning every town.
- **Find Your Flat** — A budget-driven decision tool. Enter your budget, flat type, MRT-distance preference, and minimum remaining lease, and it ranks the towns where you can actually buy — backed by a real boundary map of Singapore and a full affordability matrix.
- **MRT Proximity** — How much does being near a train station actually cost? Prices broken down across five distance bands (≤200m to >2km), using precise block-level geocoding.
- **Hidden Insights** — Five counterintuitive findings buried in the data: the million-dollar-flat explosion, the 80-year lease cliff, the storey premium, the towns the post-COVID boom forgot, and how small flats were left behind.

## Data sources

- **Resale transactions:** [data.gov.sg](https://data.gov.sg) — HDB resale flat prices (Mar 2012 onwards).
- **Geocoding & MRT distances:** [OneMap API](https://www.onemap.gov.sg) — every block geocoded to compute precise distance to the nearest MRT/LRT station.
- **Town boundaries:** URA Master Plan planning-area subzones.

## Notes on methodology

- "Affordable" on the Find Your Flat page means the **2025 median** for that town and flat type is at or below your budget — roughly a coin-flip, since half of actual sales were above the median.
- Remaining lease is derived from each flat's lease-commencement date (99 years minus age), giving complete coverage across all years.
- Some figures rest on small transaction counts in thinly-traded slices; these are shown rather than hidden, but should be read as indicative.
- A few prices in the "Over 2km" MRT band reflect a composition effect (newer, larger flats in less-dense areas) rather than a genuine distance premium — noted on the relevant page.

## Built with

Plain HTML, CSS, and vanilla JavaScript with hand-rolled inline SVG charts — **no frameworks, no build step, no external dependencies.** Every page is a single self-contained file that works offline. Data was processed in Python (pandas) and embedded directly into each page.

---

*Built as a personal project. Not financial advice — just data.*
