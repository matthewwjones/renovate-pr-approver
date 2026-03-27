function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function optional(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

export const config = {
  // GitHub App credentials
  appId: required("APP_ID"),
  privateKey: required("PRIVATE_KEY").replace(/\\n/g, "\n"),
  webhookSecret: required("WEBHOOK_SECRET"),

  // GitHub Enterprise host (e.g. "github.example.com" — no protocol or path)
  gheHost: required("GHE_HOST"),

  // The GitHub login that should have its PRs auto-approved (e.g. "renovate[bot]")
  approvedUser: required("APPROVED_USER"),

  port: parseInt(optional("PORT", "3000"), 10),
};