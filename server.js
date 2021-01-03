const port = process.env.PORT || 3000;
const cluster = require("cluster");
const numCPUs = require("os").cpus().length;
if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  const express = require("express");
  const app = express();
  app.get("/", (req, res) => {
    res.send("Hello World1!");
  });

  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });
}
