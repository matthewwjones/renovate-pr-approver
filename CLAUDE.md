# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # install dependencies
npm run dev          # run with hot reload (tsx watch)
npm run build        # compile TypeScript to dist/
npm run start        # run compiled output
npm run typecheck    # type-check without emitting
npm run lint         # ESLint
npm test             # run tests (vitest)
npm run test:watch   # run tests in watch mode
```

## Architecture

This is a GitHub App webhook server that auto-approves PRs opened by a configured GitHub user (intended for Renovate on GitHub Enterprise).

**Request flow:**

1. GHE delivers a `pull_request` webhook to `POST /api/github/webhooks` (the path is fixed by `@octokit/app`)
2. `@octokit/app` verifies the `X-Hub-Signature-256` signature and parses the event
3. The `pull_request.opened` handler in `src/app.ts` checks `payload.sender.login` against `APPROVED_USER`
4. If matched, it calls the GitHub Reviews API (`POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews`) with `event: "APPROVE"` using an installation-scoped Octokit client

**Key files:**

- `src/config.ts` — reads and validates all env vars; throws at startup if any required var is missing
- `src/app.ts` — creates the `@octokit/app` `App` instance and registers the webhook handler
- `src/index.ts` — starts the HTTP server using `createNodeMiddleware` from `@octokit/app`

**Authentication:**

`@octokit/app` handles the two-step GitHub App auth automatically: it signs a short-lived JWT with the private key, then exchanges it for an installation access token. The `Octokit.defaults({ baseUrl })` passed to the `App` constructor ensures all auth and API calls hit the GHE instance rather than `api.github.com`.

## Environment variables

See `.env.example` for all required variables. `PRIVATE_KEY` should have literal `\n` between lines (the config strips `\\n` → `\n`). `GHE_HOST` is the hostname only, no protocol (e.g. `github.example.com`).

## GitHub App setup

Register at `https://GHE_HOST/settings/apps`. Required permission: **Pull requests: Read & Write**. Subscribe to the **Pull request** webhook event. The webhook URL must be reachable from the GHE instance.