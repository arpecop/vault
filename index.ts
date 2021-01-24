require("dotenv").config();
const cluster = require("cluster");
if (cluster.isMaster) {
  cluster.fork();
  cluster.fork();
  cluster.on("exit", () => {
    console.log("Worker  died :(");
    cluster.fork();
  });
} else {
  const serverless = require("serverless-http");
  const express = require("express");
  const bodyParser = require("body-parser");

  const app = express();

  const compression = require("compression");
  const cors = require("cors");

  app.use(compression());
  app.use(cors());
  app.use(bodyParser.json());

  const { put, query } = require("./src/db");
  const { timeline } = require("./src/twitter");
  app.post(
    "/db/",
    async (req, res): Promise<void> => {
      const data = await query(req.body);
      res.json(data);
    }
  );
  app.post(
    "/dbput/",
    async (req, res): Promise<void> => {
      const data = await put(req.body);
      res.json(data);
    }
  );

  app.get("/t/:time/:id", async (req, res) => {
    const { time, id } = req.params;

    const data = await query({
      id: Math.round(time),
      collection: "t",
      limit: 10,
      descending: true,
    });

    const tweets = await timeline(id);

    const user = tweets[0]
      ? tweets[0].user
      : {
          profile_image_url_https: `http://twivatar.glitch.me/${id}`,
          profile_background_color: "black",
        };

    const tags = tweets[0]
      ? tweets
          .map((item) => item.text)
          .join(" ")
          .split(" ")
          .filter(function (n) {
            if (/#/.test(n)) return n.replace("#", "");
          })
      : [];

    const jsonOutput = {
      Items: [],
      ...data,
      tweets,
      user,
      tags,
      // tweets_stringified: JSON.stringify(tweets, null, 4),
      ...req.params,
    };

    res.header("Content-Type", "application/json");
    res.json(jsonOutput);
  });
  app.listen(process.env.PORT || 3000);

  // dsds
  module.exports.handler = serverless(app);
}
