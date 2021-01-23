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

  app.listen(process.env.PORT || 3000);

  // dsds
  module.exports.handler = serverless(app);
}
