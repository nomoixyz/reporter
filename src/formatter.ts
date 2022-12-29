import { Impact, Likelihood, ParsedIssue, Severity, Type } from "./parser.js";

type BadgeColor = "red" | "yellow" | "blue";

export interface Metadata {
  title: string;
  repository?: {
    url: string;
    commit: string;
  };
  startDate: number;
}

export class Formatter {
  toMarkdown(issues: ParsedIssue[], metadata?: Metadata): string {
    const result: string[] = [];

    if (metadata) {
      result.push(`<h1 align="center">${metadata.title}</h1>`);

      if (metadata.repository) {
        const repositoryUrl = metadata.repository.url;
        const commitUrl = `${repositoryUrl}/commit/${metadata.repository.commit}`;
        result.push(
          `This report was made by reviewing the [${repositoryUrl}](${repositoryUrl}) repository on commit [${metadata.repository.commit}](${commitUrl}).`
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

    if (
      criticalFindings.length > 0 ||
      highFindings.length > 0 ||
      mediumFindings.length > 0 ||
      lowFindings.length > 0
    ) {
      result.push(`<h2 align="center">Findings</h2>`);
    }

    if (criticalFindings.length > 0) {
      result.push(`### Critical severity`);
    }

    for (const issue of criticalFindings) {
      result.push(`#### ${issue.title}`);
      result.push(this.issueBadges(issue));
      result.push(issue.body.replace(/\r/gm, ""));
    }

    if (highFindings.length > 0) {
      result.push(`### High severity`);
    }

    for (const issue of highFindings) {
      result.push(`#### ${issue.title}`);
      result.push(this.issueBadges(issue));
      result.push(issue.body.replace(/\r/gm, ""));
    }

    if (mediumFindings.length > 0) {
      result.push(`### Medium severity`);
    }

    for (const issue of mediumFindings) {
      result.push(`#### ${issue.title}`);
      result.push(this.issueBadges(issue));
      result.push(issue.body.replace(/\r/gm, ""));
    }

    if (lowFindings.length > 0) {
      result.push(`### Low severity`);
    }

    for (const issue of lowFindings) {
      result.push(`#### ${issue.title}`);
      result.push(this.issueBadges(issue));
      result.push(issue.body.replace(/\r/gm, ""));
    }

    if (enhancements.length > 0) {
      result.push(`<h2 align="center">Code enhancements</h2>`);
    }

    for (const issue of enhancements) {
      result.push(`#### ${issue.title}`);
      result.push(issue.body.replace(/\r/gm, ""));
    }

    if (optimizations.length > 0) {
      result.push(`<h2 align="center">Gas optimizations</h2>`);
    }

    for (const issue of optimizations) {
      result.push(`#### ${issue.title}`);
      result.push(issue.body.replace(/\r/gm, ""));
    }

    const conclusion = issues.find(i => i.type === Type.CONCLUSION);

    if (conclusion) {
      result.push(conclusion.body);
    }

    return result.join(`\n\n`);
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
    let impactColor: BadgeColor = "blue";
    let impactText = Impact[Impact.LOW];

    if (issue.impact === Impact.HIGH) {
      impactColor = "red";
      impactText = Impact[Impact.HIGH];
    }

    if (issue.impact === Impact.MEDIUM) {
      impactColor = "yellow";
      impactText = Impact[Impact.MEDIUM];
    }

    let likelihoodColor: BadgeColor = "blue";
    let likelihoodText = Likelihood[Likelihood.LOW];

    if (issue.likelihood === Likelihood.HIGH) {
      likelihoodColor = "red";
      likelihoodText = Likelihood[Likelihood.HIGH];
    }

    if (issue.likelihood === Likelihood.MEDIUM) {
      likelihoodColor = "yellow";
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

  private markdownBadgeGenerator(
    subject: string,
    status: string,
    color: BadgeColor
  ) {
    return `![Badge](https://img.shields.io/badge/${subject}-${status}-${color}.svg)`;
  }
}
