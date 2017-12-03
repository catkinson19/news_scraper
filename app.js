
let PORT = process.env.PORT || 8080;

//-- app config --//
const express = require("express");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");

let app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//-- mongo Config --//
const mongoose = require("mongoose");
const db = require("./models");

if(process.env.MONGODB_URI){
  mongoose.Promise = Promise;
  mongoose.connect(process.env.MONGODB_URI, {
    useMongoClient: true
  });
} else {
  mongoose.Promise = Promise;
  mongoose.connect("mongodb://localhost/ns", {
    useMongoClient: true
  });
}

//-- scraper --//
let cheerio = require('cheerio')
const axios = require("axios");

function scrapePage(req, res) {
  axios.get("https://thegamerspost.com/").then(function (response) {
    var $ = cheerio.load(response.data);
    $("article").each(function (i, element) {
      let result = {};
      result.title = $(this)
        .children("h2")
        .text()
      result.link = $(this)
        .children("a")
        .attr("href");
      result.content = $(this).text();

      //Search to see if content exists
      db.Article
        .findOne({ title: result.title })
        .then(function (foundArticle) {
          if (foundArticle === null) {
            db.Article
              .create(result)
              .then(function (dbArticle) {
                console.log("Scrape Complete");
                //console.log(dbArticle);
              })
              .catch(function (err) {
                res.json(err);
              });
          }
        })
    });
  })
};

//-- routes --//

// HTML
app.get("/", function (req, res) {
  scrapePage();
  axios.get("http://localhost:8080/api/articles").then(function (response) {
    let fixMe = JSON.parse(JSON.stringify(response.data));
    let articleHB = { article: fixMe }
    console.log(articleHB);
    res.render("index", articleHB);
  })
});

// GET articles and populate comments
app.get("/api/articles", function (req, res) {
  db.Article
    .find({})
    .populate("comments")
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});



// GET article by id
app.get("/api/articles/:id", function (req, res) {
  db.Article
    .findOne({ _id: req.params.id })
    .populate("comments")
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// POST new comment
app.post("/api/comments/:id", function (req, res) {
  db.Comment
    .create(req.body)
    .then(function (dbComment) {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: { comments: dbComment._id } }, { new: true });
    })
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

//-- start server --//
app.listen(PORT, function () {
  console.log(`Server is listening on PORT: ${PORT}`);
});
