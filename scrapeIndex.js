const fs = require("fs");
const puppeteer = require("puppeteer");
const path = require("path");

const { PROCESSED_DIR, SEARCH_PAGE, pause } = require("./utils");

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    //Navigate page
    await page.goto(SEARCH_PAGE);

    //Set select boxes to "all"
    await page.select("#publicReportForm_form_registrationRole", "all");
    await page.select("#publicReportForm_form_registrationStatus", "all");

    //Set search range and submit
    await page.evaluate(() => {
      publicReportForm_form_registrationRole;
      let curDate = new Date().toISOString().split("T")[0].replace(/\-/g, "/"); //Get today's date
      document.querySelector("#startDate").value = "1900/01/01";
      document.querySelector("#endDate").value = curDate;
      submitForm("publicReportForm", "method", "get");
    });

    //Wait until page reloads
    await page.waitForNavigation();

    //Restructure the rows into a list of objects
    let rows = await page.$$eval("table.results tr", (elements) => {
      let rowLabels = Array.from(elements[0].querySelectorAll("th")).map((el) =>
        el.innerText.trim()
      );
      const rowToObj = (row) => {
        let tds = Array.from(row.querySelectorAll("td"));
        let link = tds[0].querySelector("a").href;
        let entries = tds.map((el, i) => [rowLabels[i], el.innerText.trim()]);
        entries.push(["URL", link]);
        entries.push([
          "Registration ID",
          new URLSearchParams(link).get("registrationId"),
        ]);

        return Object.fromEntries(entries);
      };
      return elements.slice(1).map(rowToObj);
    });

    //Write the index file to disk
    let curDate = new Date().toISOString().split("T")[0];
    fs.writeFileSync(
      path.join(PROCESSED_DIR, `index_${curDate}.json`),
      JSON.stringify(rows, null, 4)
    );

    await browser.close();
  } catch (e) {
    console.error(e.message);
  }
})();
