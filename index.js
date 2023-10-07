const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const fs = require("fs");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();

app.set("view engine", "ejs");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use("/public", express.static(__dirname + "/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  const fruits = fs.readFileSync("fruits.json", "utf-8");
  const fruitsArray = JSON.parse(fruits);

  res.render("pages/index", {
    fruits: fruitsArray,
    search: "",
  });
});

app.post("/submit-contact", (req, res) => {
  console.log(req.body);
  //Validate all inputs are filled out and contain only letters. If not, return an error
  if (!req.body.firstname.match(/^[a-zA-Z]+$/)) {
    res.render("pages/error", {
      error: "The first name can only contain letters",
    });
    return;
  } else if (!req.body.lastname.match(/^[a-zA-Z]+$/)) {
    res.render("pages/error", {
      error: "The last name can only contain letters",
    });
    return;
  } else if (!req.body.topic.match(/^[a-zA-Z]+$/)) {
    res.render("pages/error", {
      error: "The topic can only contain letters",
    });
    return;
  } else if (!req.body.description.match(/^[a-zA-Z]+$/)) {
    res.render("pages/error", {
      error: "The description can only contain letters",
    });
    return;
  } else if (
    req.body.firstname === "" ||
    req.body.lastname === "" ||
    req.body.topic === "" ||
    req.body.description === ""
  ) {
    res.render("pages/error", {
      error: "All fields must be filled out",
    });
    return;
  }
});

app.post("/submit-newFruit", async (req, res) => {
  const response = await openai.images.generate({
    prompt:
      "Generate a creative image of " +
      req.body.fruit +
      "-inspired fruit with a fun and unique twist. Imagine how a " +
      req.body.fruit +
      " would look if it were a fruit. Style the image to look like a vincent van gogh painting.",
    n: 1,
    size: "256x256",
  });

  console.log(req.body);

  const newFruit = {
    name: req.body.fruit,
    image: response.data[0].url,
  };
  const filePath = "fruits.json";

  // Indlæs indholdet a json filen
  const fileContents = fs.readFileSync(filePath, "utf-8");

  // Parse indholdet af filen til et fruits array
  const fruits = JSON.parse(fileContents);

  // tilføj det nye frugt til arrayet
  fruits.push(newFruit);

  // Gem det opdaterede array tilbage i json filen
  fs.writeFileSync(filePath, JSON.stringify(fruits));

  res.redirect("/");
});

app.post("/search", async (req, res) => {
  //search for the fruit in the json file
  const fruits = fs.readFileSync("fruits.json", "utf-8");
  const fruitsArray = JSON.parse(fruits);
  const searchedFruit = fruitsArray.filter((fruit) => {
    return fruit.name.toLowerCase().includes(req.body.search.toLowerCase());
  });

  //rerender the index page with the searched fruit and the search string
  res.render("pages/index", {
    fruits: searchedFruit,
    search: req.body.search,
  });
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
