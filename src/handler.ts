interface Octokit {
  request: (route: string, params: Record<string, unknown>) => Promise<unknown>;
}

interface Payload {
  sender: { login: string };
  pull_request: { number: number };
  repository: { owner: { login: string }; name: string };
}

export async function handlePullRequestOpened(
  octokit: Octokit,
  payload: Payload,
  approvedUser: string,
): Promise<void> {
  const sender = payload.sender.login;

  if (sender !== approvedUser) {
    console.log(
      `Skipping PR #${payload.pull_request.number} opened by ${sender}`,
    );
    return;
  }

  const { owner, name: repo } = payload.repository;
  const pull_number = payload.pull_request.number;

  console.log(
    `Approving PR #${pull_number} in ${owner.login}/${repo} opened by ${sender}`,
  );

  await octokit.request(
    "POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews",
    {
      owner: owner.login,
      repo,
      pull_number,
      event: "APPROVE",
    },
  );
}