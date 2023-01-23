import { Impact, Likelihood, ParsedIssue, Severity, Type } from "./parser.js";

type BadgeColor = "red" | "yellow" | "blue" | "green" | "orange";

export interface Metadata {
  title: string;
  repository?: {
    url: string;
    commit: string;
  };
  startDate: number;
  logo?: string;
  logoDark?: string;
  logoLight?: string;
  header?: string;
  footer?: string;
}

export class Formatter {
  toMarkdown(issues: ParsedIssue[], metadata?: Metadata): string {
    const result: string[] = [];

    if (metadata) {
      if (metadata.header) {
        result.push(metadata.header);
      }

      result.push(`<h1 align="center">${metadata.title}</h1>`);

      result.push('<p align="center">');
      result.push("<picture>");

      if (metadata.logoDark) {
        result.push(
          `<source media="(prefers-color-scheme: dark)" srcset="${metadata.logoDark}">`
        );
      }

      if (metadata.logoLight) {
        result.push(
          `<source media="(prefers-color-scheme: dark)" srcset="${metadata.logoLight}">`
        );
      }

      if (metadata.logo) {
        result.push(`<img src="${metadata.logo}">`);
      }

      result.push("</picture>");
      result.push("</p>");

      if (metadata.repository) {
        const repositoryUrl = metadata.repository.url;
        const commitUrl = `${repositoryUrl}/commit/${metadata.repository.commit}`;
        result.push(
          `We reviewed the [${repositoryUrl}](${repositoryUrl}) repository at commit [${metadata.repository.commit}](${commitUrl}).`
        );
      }
      result.push(
        `The review started on *${this.formatDate(
          new Date(metadata.startDate * 1000)
        )}*.`
      );
      result.push(
        `This report was updated on *${this.formatDate(new Date())}*.`
      );
    }

    const introduction = issues.find(i => i.type === Type.INTRODUCTION);

    if (introduction) {
      result.push(introduction.body);
    }

    const criticalFindings: ParsedIssue[] = [];
    const highFindings: ParsedIssue[] = [];
    const mediumFindings: ParsedIssue[] = [];
    const lowFindings: ParsedIssue[] = [];
    const enhancements: ParsedIssue[] = [];
    const optimizations: ParsedIssue[] = [];

    for (const issue of issues) {
      if (issue.type === Type.FINDING) {
        if (issue.severity === Severity.CRITICAL) {
          criticalFindings.push(issue);
        } else if (issue.severity === Severity.HIGH) {
          highFindings.push(issue);
        } else if (issue.severity === Severity.MEDIUM) {
          mediumFindings.push(issue);
        } else if (issue.severity === Severity.LOW) {
          lowFindings.push(issue);
        }
      } else if (issue.type === Type.ENHANCEMENT) {
        enhancements.push(issue);
      } else if (issue.type === Type.OPTIMIZATION) {
        optimizations.push(issue);
      }
    }

    highFindings.sort(this.sortIssues);
    mediumFindings.sort(this.sortIssues);
    lowFindings.sort(this.sortIssues);

    if (
      criticalFindings.length > 0 ||
      highFindings.length > 0 ||
      mediumFindings.length > 0 ||
      lowFindings.length > 0
    ) {
      result.push(`<h2 align="center">Findings</h2>`);
    }

    let counter = 1;

    for (const issue of criticalFindings) {
      result.push(this.formatIssue(counter, issue));
      counter++;
    }

    for (const issue of highFindings) {
      result.push(this.formatIssue(counter, issue));
      counter++;
    }

    for (const issue of mediumFindings) {
      result.push(this.formatIssue(counter, issue));
      counter++;
    }

    for (const issue of lowFindings) {
      result.push(this.formatIssue(counter, issue));
      counter++;
    }

    for (const issue of enhancements) {
      result.push(this.formatIssue(counter, issue));
      counter++;
    }

    for (const issue of optimizations) {
      result.push(this.formatIssue(counter, issue));
      counter++;
    }

    const conclusion = issues.find(i => i.type === Type.CONCLUSION);

    if (conclusion) {
      result.push(conclusion.body);
    }

    if (metadata?.footer) {
      result.push(metadata.footer);
    }

    return result.join(`\n\n`);
  }

  private sortIssues(issueA: ParsedIssue, issueB: ParsedIssue): number {
    if (issueA.impact == undefined) {
      return -1;
    }

    if (issueB.impact == undefined) {
      return 1;
    }

    if (issueA.impact > issueB.impact) {
      return -1;
    }

    if (issueB.impact > issueA.impact) {
      return 1;
    }

    if (issueA.likelihood == undefined) {
      return -1;
    }

    if (issueB.likelihood == undefined) {
      return 1;
    }

    if (issueA.likelihood > issueB.likelihood) {
      return -1;
    }

    if (issueB.likelihood > issueA.likelihood) {
      return 1;
    }

    return 0;
  }

  private formatIssue(index: number, issue: ParsedIssue): string {
    return [
      `### ${index}. ${issue.title}`,
      this.issueBadges(issue),
      issue.body.replace(/\r/gm, ""),
    ].join(`\n\n`);
  }

  private formatDate(date: Date): string {
    return date.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  private issueBadges(issue: ParsedIssue): string {
    if (issue.type === Type.FINDING) {
      let impactColor: BadgeColor = "yellow";
      let impactText = Impact[Impact.LOW];

      if (issue.impact === Impact.HIGH) {
        impactColor = "red";
        impactText = Impact[Impact.HIGH];
      }

      if (issue.impact === Impact.MEDIUM) {
        impactColor = "orange";
        impactText = Impact[Impact.MEDIUM];
      }

      let likelihoodColor: BadgeColor = "yellow";
      let likelihoodText = Likelihood[Likelihood.LOW];

      if (issue.likelihood === Likelihood.HIGH) {
        likelihoodColor = "red";
        likelihoodText = Likelihood[Likelihood.HIGH];
      }

      if (issue.likelihood === Likelihood.MEDIUM) {
        likelihoodColor = "orange";
        likelihoodText = Likelihood[Likelihood.MEDIUM];
      }

      const impactBadge = this.markdownBadgeGenerator(
        "IMPACT",
        impactText,
        impactColor
      );

      const likelihoodBadge = this.markdownBadgeGenerator(
        "LIKELIHOOD",
        likelihoodText,
        likelihoodColor
      );

      return `${impactBadge} ${likelihoodBadge}`;
    }

    if (issue.type === Type.ENHANCEMENT) {
      return `${this.markdownBadgeGenerator("", "ENHANCEMENT", "blue")}`;
    }

    if (issue.type === Type.OPTIMIZATION) {
      return `${this.markdownBadgeGenerator("", "OPTIMIZATION", "green")}`;
    }

    return "";
  }

  private markdownBadgeGenerator(
    subject: string,
    status: string,
    color: BadgeColor
  ) {
    return `![Badge](https://img.shields.io/badge/${subject}-${status}-${color}.svg)`;
  }
}
