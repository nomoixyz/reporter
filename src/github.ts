import got, { Got } from "got";

export interface Issue {
  title: string;
  labels: string[];
  body?: string;
}

export class Github {
  private client: Got;

  constructor(token: string) {
    this.client = got.extend({
      prefixUrl: "https://api.github.com",
      headers: {
        accept: `application/vnd.github+json`,
        authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
  }

  async getRepoIssues(repo: string, labels?: string[]): Promise<Issue[]> {
    const { body } = await this.client.get(`repos/${repo}/issues`, {
      searchParams: {
        state: "all",
        labels: labels?.join(","),
      },
    });

    const rawIssues = JSON.parse(body);

    if (!Array.isArray(rawIssues)) {
      return [];
    }

    const issues: Issue[] = [];

    for (const rawIssue of rawIssues) {
      if (Object.prototype.hasOwnProperty.call(rawIssue, "pull_request")) {
        // Skip Pull requests
        continue;
      }

      const issue: Issue = {
        title: rawIssue.title,
        labels: Array.isArray(rawIssue.labels)
          ? rawIssue.labels.map((l: { [name: string]: string }) => l.name)
          : [],
      };

      if (rawIssue.body) {
        issue.body = rawIssue.body;
      }

      issues.push(issue);
    }

    return issues;
  }
}
