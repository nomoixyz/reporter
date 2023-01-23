import fs from "fs";
import { Command } from "commander";
import { IssueParser } from "./parser.js";
import { Formatter, Metadata } from "./formatter.js";
import { Github } from "./github.js";

export class CLI {
  constructor(
    private readonly github: Github,
    private readonly parser: IssueParser,
    private readonly formatter: Formatter
  ) {}

  registerCommand(program: Command) {
    program
      .command("generate")
      .description(
        "Gets all the issues from a repository and creates a markdown report"
      )
      .argument("<repository>", "the target repository in the form 'user/repo'")
      .argument("<labels...>", "only parse issues with these labels")
      .option(
        "-m, --metadata <path>",
        "the path to the metadata file",
        "./.audit.json"
      )
      .option(
        "-o, --out-file <path>",
        "the path to the generated markdown report",
        "reports/automated.md"
      )
      .action(async (repo, labels, options) => {
        const metadata: Metadata = {
          title: "Unknown",
          startDate: Date.now() / 1000,
        };

        if (fs.existsSync(options.metadata)) {
          const rawMetadata = JSON.parse(
            fs.readFileSync(options.metadata).toString()
          );

          if (rawMetadata.header) {
            metadata.header = rawMetadata.header;
          }

          if (rawMetadata.footer) {
            metadata.footer = rawMetadata.footer;
          }

          if (rawMetadata.title) {
            metadata.title = rawMetadata.title;
          }

          if (rawMetadata.startDate) {
            metadata.startDate = rawMetadata.startDate;
          }

          if (rawMetadata.repository && rawMetadata.commit) {
            metadata.repository = {
              url: rawMetadata.repository,
              commit: rawMetadata.commit,
            };
          }

          if (rawMetadata.logo) {
            metadata.logo = rawMetadata.logo;
          }

          if (rawMetadata.logoDark) {
            metadata.logoDark = rawMetadata.logoDark;
          }

          if (rawMetadata.logoLight) {
            metadata.logoLight = rawMetadata.logoLight;
          }
        }

        const rawIssues = await this.github.getRepoIssues(repo, labels);
        const issues = this.parser.parse(rawIssues);

        fs.writeFileSync(
          options.outFile,
          this.formatter.toMarkdown(issues, metadata)
        );
      });
  }
}
