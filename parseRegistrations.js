const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");
const { RAW_DIR, RAW_FILE_PREFIX, unique, PROCESSED_DIR } = require("./utils");

function parseTable(tableEl) {
  let heading = null;
  let cur = tableEl;
  while ((cur = cur.previousElementSibling) && cur) {
    if (cur.tagName === "H3") {
      heading = cur.textContent.trim();
      break;
    }
  }
  let rows = Array.from(tableEl.querySelectorAll("tr"))
    .map((row) =>
      Array.from(row.querySelectorAll("td")).map((d) =>
        d.textContent
          .replace(/[\n\t]+/g, " ")
          .replace(/[:]+/g, "")
          .trim()
      )
    )
    .filter((d) => d.length === 2);

  return {
    heading,
    rows: rows,
  };
}

function parseDOMToObject(dom) {
  //get main info

  let mainInfo = Object.fromEntries(
    Array.from(dom.window.document.querySelectorAll("#mainColumn b")).map(
      (el) => [
        el.textContent.replace(/:/g, "").trim(),
        el.nextSibling.textContent.replace(/:/g, "").trim(),
      ]
    )
  );

  //parse tables
  let tableObjs = Array.from(
    dom.window.document.querySelectorAll("#mainColumn table")
  ).map(parseTable);

  //Romove rows with no heading

  tableObjs = tableObjs.filter((d) => d.heading && d.heading.length > 0);

  //Remove sections with no entries

  tableObjs = tableObjs.filter((d) => d.rows.length > 0);

  //Merge with same heading
  let uniqueHeadings = unique(tableObjs.map((d) => d.heading));
  tableObjs = uniqueHeadings.map((heading) => ({
    heading,
    content: Object.fromEntries(
      tableObjs.filter((d) => d.heading === heading).flatMap((d) => d.rows)
    ),
  }));

  return {
    ...mainInfo,
    tables: tableObjs,
  };
}

//Get a list of all the registrations from the raw dir
let raw_files = fs
  .readdirSync(RAW_DIR)
  .filter((d) => d.startsWith(RAW_FILE_PREFIX));

//Loop over the raw files to build the data array (main program loop)
let data = [];
for (let file of raw_files) {
  const fullFile = path.resolve(path.join(RAW_DIR, file));
  const html = fs.readFileSync(fullFile);
  const dom = new JSDOM(html, {
    url: new URL(`file:${fullFile}`),
  });
  data.push(parseDOMToObject(dom));
}
//Write out the newly contructed data array to disk
fs.writeFileSync(
  path.join(PROCESSED_DIR, "data.json"),
  JSON.stringify(data, null, 4)
);
