# renovate-pr-approver

A GitHub App that automatically approves pull requests opened by a configured user. Designed for use with [Renovate](https://github.com/renovatebot/renovate) on GitHub Enterprise deployments.

## How it works

The app receives `pull_request` webhook events from GitHub Enterprise. When a PR is opened by the configured user, it uses the GitHub Reviews API to submit an approval. PRs from all other users are ignored.

## Prerequisites

- Node.js 20+
- A GitHub Enterprise instance (≥ 3.0)
- A GitHub App registered on that instance

## GitHub App setup

1. Go to `https://YOUR_GHE_HOST/settings/apps` and create a new GitHub App
2. Set the webhook URL to `https://YOUR_SERVER/api/github/webhooks`
3. Generate a webhook secret and note it down
4. Set **Repository permissions → Pull requests** to **Read & write**
5. Subscribe to the **Pull request** webhook event
6. After creating the app, note the **App ID** from the app's settings page
7. Generate a private key (scroll to the bottom of the app settings page) and download the `.pem` file
8. Install the app on the repositories (or organisation) where Renovate operates

## Configuration

Copy `.env.example` to `.env` and fill in the values:

| Variable | Description |
|---|---|
| `APP_ID` | GitHub App ID from the app settings page |
| `PRIVATE_KEY` | Contents of the downloaded `.pem` file, with literal `\n` between lines |
| `WEBHOOK_SECRET` | The secret set when registering the webhook |
| `GHE_HOST` | Hostname of your GHE instance, e.g. `github.example.com` — no protocol |
| `APPROVED_USER` | GitHub login to auto-approve, e.g. `renovate[bot]` |
| `PORT` | Port for the HTTP server (default: `3000`) |

> **Tip:** To format the private key as a single-line env var, run:
> ```sh
> awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' your-app.pem
> ```

## Running

```sh
npm install
cp .env.example .env
# edit .env with your values

npm run dev      # development, with hot reload
npm run build && npm start   # production
```

The webhook endpoint is `POST /api/github/webhooks`.

## Development

```sh
npm test           # run tests
npm run test:watch # run tests in watch mode
npm run typecheck  # TypeScript type checking
npm run lint       # ESLint
```

To test webhooks locally, use [smee.io](https://smee.io) to forward events from your GHE instance to your local server:

```sh
npx smee-client --url https://smee.io/YOUR_CHANNEL --target http://localhost:3000/api/github/webhooks
```

## Deployment

The server only needs to be reachable from your GHE instance, so it can run on an internal host without a public IP. Any process manager works — systemd, PM2, or a container.

Make sure the host running this app can reach `https://YOUR_GHE_HOST/api/v3`. If your GHE instance uses an internal or self-signed TLS certificate, set the `NODE_EXTRA_CA_CERTS` environment variable to the path of the CA bundle.