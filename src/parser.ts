import { Issue } from "./github.js";

export enum Severity {
  NONE,
  LOW,
  MEDIUM,
  HIGH,
  CRITICAL,
}

export enum Impact {
  LOW,
  MEDIUM,
  HIGH,
}

export const HighImpactLabel = "impact:high";
export const MediumImpactLabel = "impact:medium";
export const LowImpactLabel = "impact:low";

export type ImpactLabel =
  | typeof HighImpactLabel
  | typeof MediumImpactLabel
  | typeof LowImpactLabel;

export enum Likelihood {
  LOW,
  MEDIUM,
  HIGH,
}

export const HighLikelihoodLabel = "likelihood:high";
export const MediumLikelihoodLabel = "likelihood:medium";
export const LowLikelihoodLabel = "likelihood:low";

export type LikelihoodLabel =
  | typeof HighLikelihoodLabel
  | typeof MediumLikelihoodLabel
  | typeof LowLikelihoodLabel;

export enum Type {
  UNKNOWN,
  FINDING,
  ENHANCEMENT,
  OPTIMIZATION,
}

export const FindingTypeLabel = "finding";
export const EnhancementTypeLabel = "enhancement";
export const OptimizationTypeLabel = "optimization";

type SeverityMap = ReadonlyMap<
  ImpactLabel,
  ReadonlyMap<LikelihoodLabel, Severity>
>;

const severityMatrix: SeverityMap = new Map<
  ImpactLabel,
  Map<LikelihoodLabel, Severity>
>([
  [
    HighImpactLabel,
    new Map([
      [HighLikelihoodLabel, Severity.CRITICAL],
      [MediumLikelihoodLabel, Severity.HIGH],
      [LowLikelihoodLabel, Severity.MEDIUM],
    ]),
  ],
  [
    MediumImpactLabel,
    new Map([
      [HighLikelihoodLabel, Severity.HIGH],
      [MediumLikelihoodLabel, Severity.MEDIUM],
      [LowLikelihoodLabel, Severity.LOW],
    ]),
  ],
  [
    LowImpactLabel,
    new Map([
      [HighLikelihoodLabel, Severity.HIGH],
      [MediumLikelihoodLabel, Severity.MEDIUM],
      [LowLikelihoodLabel, Severity.LOW],
    ]),
  ],
]);

export interface ParsedIssue {
  title: string;
  type: Type;
  severity: Severity;
  body: string;
}

export class IssueParser {
  parse(issues: Issue[]): ParsedIssue[] {
    return issues
      .filter(i => i.body)
      .map(i => {
        return {
          title: i.title,
          severity: this.calculateSeverity(i.labels),
          type: this.getType(i.labels),
          body: i.body || "",
        };
      });
  }

  private calculateSeverity(labels: string[]): Severity {
    const impactLabel = labels.find(l => l.startsWith("impact:"));

    const likelihoodLabel = labels.find(l => l.startsWith("likelihood:"));

    const severity = severityMatrix
      .get(impactLabel as ImpactLabel)
      ?.get(likelihoodLabel as LikelihoodLabel);

    return severity || Severity.NONE;
  }

  private getType(labels: string[]): Type {
    const typeLabel = labels.find(
      l =>
        l === FindingTypeLabel ||
        l === EnhancementTypeLabel ||
        l === OptimizationTypeLabel
    );

    switch (typeLabel) {
      case FindingTypeLabel:
        return Type.FINDING;
      case EnhancementTypeLabel:
        return Type.ENHANCEMENT;
      case OptimizationTypeLabel:
        return Type.OPTIMIZATION;
      default:
        return Type.UNKNOWN;
    }
  }
}
