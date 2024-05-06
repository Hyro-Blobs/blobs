const githubToken = process.env["GITHUB_TOKEN"]!;
const commitSha = process.env["COMMIT_SHA"]!;
const pullRequestNumber = process.env["PR_NUMBER"]!;

async function requestGithub(
  url: string,
  body: any,
  method?: "POST" | "DELETE"
) {
  await fetch(`https://api.github.com/repos/Hyro-Blobs/blobs/${url}`, {
    method: method || "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `token ${githubToken}`,
    },
    body: JSON.stringify(body),
  });
}

type ReviewEvent = "APPROVE" | "REQUEST_CHANGES";

type ReviewData = {
  commit_id: string;
  event: ReviewEvent;
  body?: string;
};

async function requestReviewers(reviewers: string[]) {
  await requestGithub(`pulls/${pullRequestNumber}/requested_reviewers`, {
    reviewers,
  });
}

async function createReview(event: ReviewEvent, body?: string) {
  const data: ReviewData = {
    commit_id: commitSha,
    event: event,
  };

  if (body) {
    data.body = body;
  }

  await requestGithub(`pulls/${pullRequestNumber}/reviews`, data, "POST");
}

async function addLabels(labels: string[]) {
  await requestGithub(`issues/${pullRequestNumber}/labels`, labels);
}

async function removeLabel(label: string) {
  await requestGithub(
    `issues/${pullRequestNumber}/labels/${label}`,
    {},
    "DELETE"
  );
}

async function getBody() {
  const response = await fetch(
    `https://api.github.com/repos/Hyro-Blobs/blobs/pulls/${pullRequestNumber}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `token ${githubToken}`,
      },
    }
  );
  const data = (await response.json()) as { body: string };
  return data.body;
}

export { requestReviewers, createReview, addLabels, removeLabel, getBody };
