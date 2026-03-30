/* eslint-disable no-console */
"use strict";

const fs = require("fs");

if (process.argv.length !== 3) {
  console.error("ERROR: This script takes exactly one argument");
  process.exit(1);
}

console.log("Reading coverage results from:", process.argv[2]);
const coverageFile = process.argv[2];
if (!fs.existsSync(coverageFile)) {
  console.error(`ERROR: File '${coverageFile}' does not exist`);
  process.exit(1);
}
const rawdata = fs.readFileSync(coverageFile);
const coverageReport = JSON.parse(rawdata);
const coverageTotals = Object.values(coverageReport.total);
const sum = coverageTotals.reduce((prev, current) => prev + current.pct, 0);
const coveragePct = (sum / coverageTotals.length).toLocaleString("en-US", { minimumFractionDigits: 2 });
console.log("Code coverage:", coveragePct, "%");
