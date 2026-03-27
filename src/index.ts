import http from "node:http";
import { createNodeMiddleware } from "@octokit/app";
import { createApp } from "./app.js";
import { config } from "./config.js";

const app = createApp();
const middleware = createNodeMiddleware(app);

const server = http.createServer(middleware);

server.listen(config.port, () => {
  console.log(
    `Listening on port ${config.port}. Webhook endpoint: POST /api/github/webhooks`,
  );
  console.log(`Will auto-approve PRs opened by: ${config.approvedUser}`);
  console.log(`GitHub Enterprise host: ${config.gheHost}`);
});