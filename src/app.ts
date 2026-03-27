import { App } from "@octokit/app";
import { Octokit } from "@octokit/core";
import { config } from "./config.js";
import { handlePullRequestOpened } from "./handler.js";

export function createApp(): App {
  const app = new App({
    appId: config.appId,
    privateKey: config.privateKey,
    webhooks: {
      secret: config.webhookSecret,
    },
    // Point all API calls at the GHE instance
    Octokit: Octokit.defaults({
      baseUrl: `https://${config.gheHost}/api/v3`,
    }),
  });

  app.webhooks.on("pull_request.opened", ({ octokit, payload }) =>
    handlePullRequestOpened(octokit, payload, config.approvedUser),
  );

  app.webhooks.onError((error) => {
    console.error("Webhook error:", error);
  });

  return app;
}