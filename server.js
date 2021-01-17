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
  const ejs = require("ejs");

  const app = express();

  const compression = require("compression");
  const cors = require("cors");

  app.use(compression());
  app.use(cors());
  app.use(bodyParser.json());

  const { put, query } = require("./src/db.js");

  const { readFile, writeFile } = require("./src/twitter.js");

  app.use(async (req, res, next) => {
    const json = {
      path: `https://rudixlab.com${req.path}`,
      t: new Date(),
      ua: req.headers["user-agent"],
    };
    const prev = await readFile("/tmp/log.txt");
    await writeFile(
      "/tmp/log.txt",
      prev ? `\n${JSON.stringify(json)},${prev}` : JSON.stringify(json)
    );
    next();
  });

  app.post("/db/", async (req, res) => {
    const data = await query(req.body);
    res.json(data);
  });
  app.post("/dbput/", async (req, res) => {
    const data = await put(req.body);
    res.json(data);
  });
  app.get("/log", async (req, res) => {
    const contents = await readFile("/tmp/log.txt");
    res.end(`[${contents}]`);
  });
  if (!process.env.LAMBDA_RUNTIME_DIR) {
    app.listen(process.env.PORT || 3000);
  }
  // dsds
  module.exports.handler = serverless(app);
}
