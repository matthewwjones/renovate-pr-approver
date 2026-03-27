import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const REQUIRED_VARS = {
  APP_ID: "123",
  PRIVATE_KEY: "-----BEGIN RSA PRIVATE KEY-----\\nfake\\n-----END RSA PRIVATE KEY-----",
  WEBHOOK_SECRET: "secret",
  GHE_HOST: "github.example.com",
  APPROVED_USER: "renovate[bot]",
};

function setEnv(vars: Record<string, string>) {
  for (const [k, v] of Object.entries(vars)) {
    process.env[k] = v;
  }
}

function clearEnv() {
  for (const key of Object.keys(REQUIRED_VARS)) {
    delete process.env[key];
  }
  delete process.env["PORT"];
}

async function loadConfig() {
  vi.resetModules();
  const mod = await import("./config.js");
  return mod.config;
}

describe("config", () => {
  beforeEach(() => {
    clearEnv();
    setEnv(REQUIRED_VARS);
  });

  afterEach(() => {
    clearEnv();
  });

  it("loads successfully when all required variables are present", async () => {
    const config = await loadConfig();
    expect(config.appId).toBe("123");
    expect(config.gheHost).toBe("github.example.com");
    expect(config.approvedUser).toBe("renovate[bot]");
    expect(config.webhookSecret).toBe("secret");
  });

  it("converts literal \\n sequences in PRIVATE_KEY to real newlines", async () => {
    const config = await loadConfig();
    expect(config.privateKey).toContain("\n");
    expect(config.privateKey).not.toContain("\\n");
  });

  it("defaults PORT to 3000 when not set", async () => {
    const config = await loadConfig();
    expect(config.port).toBe(3000);
  });

  it("uses PORT from environment when set", async () => {
    process.env.PORT = "8080";
    const config = await loadConfig();
    expect(config.port).toBe(8080);
  });

  for (const key of Object.keys(REQUIRED_VARS)) {
    it(`throws when ${key} is missing`, async () => {
      delete process.env[key];
      await expect(loadConfig()).rejects.toThrow(key);
    });
  }
});