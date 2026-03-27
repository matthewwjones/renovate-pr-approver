import { describe, it, expect, vi, beforeEach } from "vitest";
import { handlePullRequestOpened } from "./handler.js";

function makePayload(senderLogin: string, prNumber = 42) {
  return {
    sender: { login: senderLogin },
    pull_request: { number: prNumber },
    repository: { owner: { login: "acme" }, name: "my-repo" },
  };
}

describe("handlePullRequestOpened", () => {
  const mockRequest = vi.fn().mockResolvedValue({});
  const octokit = { request: mockRequest };

  beforeEach(() => {
    mockRequest.mockClear();
  });

  it("approves a PR when the sender matches the approved user", async () => {
    await handlePullRequestOpened(octokit, makePayload("renovate[bot]"), "renovate[bot]");

    expect(mockRequest).toHaveBeenCalledOnce();
    expect(mockRequest).toHaveBeenCalledWith(
      "POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews",
      {
        owner: "acme",
        repo: "my-repo",
        pull_number: 42,
        event: "APPROVE",
      },
    );
  });

  it("skips a PR when the sender does not match the approved user", async () => {
    await handlePullRequestOpened(octokit, makePayload("some-human"), "renovate[bot]");

    expect(mockRequest).not.toHaveBeenCalled();
  });

  it("passes the correct PR number to the reviews API", async () => {
    await handlePullRequestOpened(octokit, makePayload("renovate[bot]", 99), "renovate[bot]");

    expect(mockRequest).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ pull_number: 99 }),
    );
  });

  it("passes the correct owner and repo to the reviews API", async () => {
    const payload = {
      sender: { login: "renovate[bot]" },
      pull_request: { number: 1 },
      repository: { owner: { login: "my-org" }, name: "my-service" },
    };

    await handlePullRequestOpened(octokit, payload, "renovate[bot]");

    expect(mockRequest).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ owner: "my-org", repo: "my-service" }),
    );
  });

  it("propagates errors thrown by the octokit request", async () => {
    mockRequest.mockRejectedValueOnce(new Error("API error"));

    await expect(
      handlePullRequestOpened(octokit, makePayload("renovate[bot]"), "renovate[bot]"),
    ).rejects.toThrow("API error");
  });

  it("is case-sensitive when matching the approved user", async () => {
    await handlePullRequestOpened(octokit, makePayload("Renovate[bot]"), "renovate[bot]");

    expect(mockRequest).not.toHaveBeenCalled();
  });
});