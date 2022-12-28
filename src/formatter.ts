import { ParsedIssue, Severity, Type } from "./parser.js";

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
      result.push(`# ${metadata.title}`);

      if (metadata.repository) {
        result.push(
          `This report was made by reviewing the ${metadata.repository.url} repository on commit #${metadata.repository.commit}.`
        );
      }
      result.push(
        `The review started at ${new Date(metadata.startDate).toUTCString()}`
      );
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
      result.push(`## Findings`);
    }

    if (criticalFindings.length > 0) {
      result.push(`### Critical severity`);
    }

    for (const issue of criticalFindings) {
      result.push(`#### ${issue.title}`);
      result.push(issue.body.replace(/\r/gm, ""));
    }

    if (highFindings.length > 0) {
      result.push(`### High severity`);
    }

    for (const issue of highFindings) {
      result.push(`#### ${issue.title}`);
      result.push(issue.body.replace(/\r/gm, ""));
    }

    if (mediumFindings.length > 0) {
      result.push(`### Medium severity`);
    }

    for (const issue of mediumFindings) {
      result.push(`#### ${issue.title}`);
      result.push(issue.body.replace(/\r/gm, ""));
    }

    if (lowFindings.length > 0) {
      result.push(`### Low severity`);
    }

    for (const issue of lowFindings) {
      result.push(`#### ${issue.title}`);
      result.push(issue.body.replace(/\r/gm, ""));
    }

    if (enhancements.length > 0) {
      result.push(`### Code enhancements`);
    }

    for (const issue of enhancements) {
      result.push(`#### ${issue.title}`);
      result.push(issue.body.replace(/\r/gm, ""));
    }

    if (optimizations.length > 0) {
      result.push(`### Gas optimizations`);
    }

    for (const issue of optimizations) {
      result.push(`#### ${issue.title}`);
      result.push(issue.body.replace(/\r/gm, ""));
    }

    return result.join(`\n\n`);
  }
}
