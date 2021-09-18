# Scraper for Manitoba lobbyist registry

To get started, clone the repository and run:

```npm install```

## Doing the scrape

1. First, run the command `node scrapeIndex.js`. This will download the list of Active & Terminated Registrations from the search page and save it to the `processed/` directory as `index_<date>.json`

2. Next, run the command `node scrapeRegistrations.js`. This will download all the registrations in the previously-downloaded index file to the `raw/` directory as HTML. Any registrations which already exist in the raw directory will be skipped. If you wish to update an already-downloaded registration, just delete the corresponding file from the `raw/` directory.

3. Finally, run `node parseRegistrations.js` to parse the previously downloaded HTML into a single JSON dataset at `processed/data.json`

## Updating the scrape

Rerun the three commands in order. Only recently added registrations will be downloaded. Existing registrations will be skipped. If you would like to run a fresh scrape, delete all HTML files from the `raw/` directory.

\[TODO: Add a mode that checks registrations' "updated at" time and re-downloads updated registrations\]

## Notes and limitations

- I've done very little error handling, which would need to be added if this scrape were to be automated. For a supervised scrape it's fine.
- You asked for a lot of fields from the registration. I didn't feel like writing custom handling for each for the exercise, so I did it in an automated way. This obviously makes for a less pretty final dataset. That said, since the scraper downloads the HTML as a separate step, the `parseRegistrations.js` file can be rewritten to create a cleaner dataset, or a CSV or Excel file, or whatever, without requiringa a new scrape.

## Final notes

- The search page is at: [https://registry.lobbyistregistrar.mb.ca/lra/reporting/public/advanceSearch.do](https://registry.lobbyistregistrar.mb.ca/lra/reporting/public/advanceSearch.do)
- The scraper uses [Puppeteer](https://www.npmjs.com/package/puppeteer) and downloads its own headless Chromium browser