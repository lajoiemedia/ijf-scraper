const path = require("path");

const REQUEST_DELAY = 200; //in millis

const RAW_DIR = path.join(__dirname, "raw");
const PROCESSED_DIR = path.join(__dirname, "processed");

const RAW_FILE_PREFIX = "registration_";

const SEARCH_PAGE =
  "https://registry.lobbyistregistrar.mb.ca/lra/reporting/public/advanceSearch.do";

const last = (arr) => arr[arr.length - 1];

const pause = async function (timeout) {
  return new Promise((resolve, reject) => setTimeout(resolve, timeout));
};

const unique = (arr) => arr.filter((d, i) => arr.indexOf(d) === i);

module.exports = {
  RAW_DIR,
  PROCESSED_DIR,
  REQUEST_DELAY,
  RAW_FILE_PREFIX,
  SEARCH_PAGE,
  last,
  pause,
  unique,
};
