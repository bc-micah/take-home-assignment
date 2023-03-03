import express from "express";
import fs from "fs";
import path from "path";

const ERROR_RATE = 0.1;
const RESPONSE_DELAY_START = 10;
const RESPONSE_DELAY_END = 1500;
const random = (min = RESPONSE_DELAY_START, max = RESPONSE_DELAY_END) => Math.floor(Math.random() * (max - min)) + min;

const countries = JSON.parse(fs.readFileSync(
  path.join('./mock-api/', "countries.json")
));

const app = express();
const port = 8999;

function getCountries(query, page, page_size) {
  const country_list = [];

  for (var i = 0; i < countries.length; i++) {
    if (query === "" || countries[i].name.toLowerCase().includes(query.toLowerCase())) {
      country_list.push(countries[i]);
    }
  }

  return country_list.slice((page - 1) * page_size, page * page_size);
}

app.use("/flags", express.static("mock-api/flags"));

app.use("/countries", [
  (req, res, next) => {
    if (Math.random() <= ERROR_RATE) {
      throw new Error("Something went wrong");
    }

    next();
  },
  (req, res, next) => {
    setTimeout(next, random());
  }
]);

app.get("/countries", (req, res) => {
  // get the query parameters and set defaults if not defined
  const { query = "", page = 1, page_size = 10 } = req.query;

  // return the filtered list
  res.json(getCountries(query, page, page_size));
});

app.listen(port, () => {
  console.log(`mock server listening on port ${port}`);
});
