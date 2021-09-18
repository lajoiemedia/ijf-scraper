const axios = require("axios");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

const {
  PROCESSED_DIR,
  RAW_DIR,
  RAW_FILE_PREFIX,
  REQUEST_DELAY,
  SEARCH_PAGE,
  last,
  pause,
} = require("./utils");

//Get most recent index file (created bby scrapeIndex.js)
const indexFilename = last(
  fs.readdirSync(PROCESSED_DIR).filter((d) => d.startsWith("index_"))
);
const index = require(path.join(PROCESSED_DIR, indexFilename));

//Download registrations HTML and save
(async function () {
  //Create a session with puppeteer and get session cookie
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(SEARCH_PAGE);
  const cookiesObject = await page.cookies();
  await browser.close();

  let sessionCookie = cookiesObject.find((d) => d.name === "JSESSIONID");

  //Loop through the registrations in the index
  for (let [i, registration] of index.entries()) {
    let rawFilename = path.join(
      RAW_DIR,
      `${RAW_FILE_PREFIX}${registration["Registration ID"]}.html`
    );
    //Only make an HTTP request if the registration file doesn't already exist
    if (!fs.existsSync(rawFilename)) {
      //Delay the request slightly so their servers don't catch fire
      await pause(REQUEST_DELAY);
      try {
        console.log(
          `scraping ID = ${registration["Registration ID"]} (${i + 1}/${
            index.length
          })`
        );
        //The GET request
        let response = await axios.get(registration.URL, {
          headers: {
            Cookie: `${sessionCookie.name}:${sessionCookie.value};`,
          },
        });
        //...and save
        fs.writeFileSync(rawFilename, response.data, "utf8");
      } catch (e) {
        console.error(
          `FAILED ON ID = ${registration["Registration ID"]}: ${e.message}`
        );
      }
    } else {
      console.log(
        `skipping ID = ${registration["Registration ID"]} (${i + 1}/${
          index.length
        })`
      );
    }
  }
})();
