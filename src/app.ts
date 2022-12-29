#!/usr/bin/env node

import { Command } from "commander";
import { CLI } from "./cli.js";
import { Formatter } from "./formatter.js";
import { Github } from "./github.js";
import { IssueParser } from "./parser.js";

async function main(): Promise<void> {
  const github = new Github(process.env.GITHUB_TOKEN || "unknown");
  const parser = new IssueParser();
  const formatter = new Formatter();
  const program = new Command();

  program
    .name("reporter")
    .description("CLI to parse issues and create a markdown report");

  const cli = new CLI(github, parser, formatter);

  cli.registerCommand(program);

  program.parseAsync(process.argv);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
