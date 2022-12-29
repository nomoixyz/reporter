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
  INTRODUCTION,
  CONCLUSION,
}

export const FindingTypeLabel = "finding";
export const EnhancementTypeLabel = "enhancement";
export const OptimizationTypeLabel = "optimization";

export const IntroductionLabel = "introduction";
export const ConclusionLabel = "conclusion";

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
  impact?: Impact;
  likelihood?: Likelihood;
}

export class IssueParser {
  parse(issues: Issue[]): ParsedIssue[] {
    return issues
      .filter(i => i.body)
      .map(i => {
        const impactLabel = i.labels.find(l => l.startsWith("impact:"));
        const likelihoodLabel = i.labels.find(l => l.startsWith("likelihood:"));

        return {
          title: i.title,
          severity: this.calculateSeverity(impactLabel, likelihoodLabel),
          impact: this.parseImpactLabel(impactLabel),
          likelihood: this.parseLikelihoodLabel(likelihoodLabel),
          type: this.getType(i.labels),
          body: i.body || "",
        };
      });
  }

  private parseImpactLabel(impactLabel?: string): Impact | undefined {
    switch (impactLabel) {
      case HighImpactLabel:
        return Impact.HIGH;
      case MediumImpactLabel:
        return Impact.MEDIUM;
      case LowImpactLabel:
        return Impact.LOW;
      default:
        return undefined;
    }
  }

  private parseLikelihoodLabel(
    likelihoodLabel?: string
  ): Likelihood | undefined {
    switch (likelihoodLabel) {
      case HighLikelihoodLabel:
        return Likelihood.HIGH;
      case MediumLikelihoodLabel:
        return Likelihood.MEDIUM;
      case LowLikelihoodLabel:
        return Likelihood.LOW;
      default:
        return undefined;
    }
  }

  private calculateSeverity(
    impactLabel?: string,
    likelihoodLabel?: string
  ): Severity {
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
        l === OptimizationTypeLabel ||
        l === IntroductionLabel ||
        l === ConclusionLabel
    );

    switch (typeLabel) {
      case FindingTypeLabel:
        return Type.FINDING;
      case EnhancementTypeLabel:
        return Type.ENHANCEMENT;
      case OptimizationTypeLabel:
        return Type.OPTIMIZATION;
      case IntroductionLabel:
        return Type.INTRODUCTION;
      case ConclusionLabel:
        return Type.CONCLUSION;
      default:
        return Type.UNKNOWN;
    }
  }
}
