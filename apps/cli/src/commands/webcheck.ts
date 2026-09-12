import { Command, InvalidArgumentError } from "commander";

/**
 * Commander's default mandatory-value option parsing (`--flag <value>`)
 * happily swallows the next token as the value even if that token is itself
 * a known flag (e.g. `--html --verbose` would set html="--verbose" and
 * silently drop --verbose). Options whose value is a filename must reject
 * anything that looks like a flag instead.
 */
function requireFilenameArg(value: string): string {
  if (value.startsWith("-")) {
    throw new InvalidArgumentError("expected a filename, got a flag.");
  }
  return value;
}

export interface WebcheckOptions {
  verbose?: boolean;
  json?: boolean;
  html?: string;
  markdown?: string;
  ci?: boolean;
  mobile?: boolean;
  desktop?: boolean;
  timeout?: string;
  minScore?: string;
  failOn?: string;
  maxCritical?: string;
  maxWarnings?: string;
}

/**
 * Registers `shipcheck webcheck <url>`. Marked as the default subcommand so
 * `shipcheck <url>` behaves identically — Commander dispatches to a command
 * flagged `isDefault` whenever the first operand doesn't match a known
 * subcommand name.
 *
 * This feature only wires up argument/flag parsing. Actual auditing lands in
 * Feature 2 onward — for now every invocation prints a "not implemented yet"
 * stub so early users get a clear message instead of a crash or fake output.
 */
export function registerWebcheckCommand(program: Command): Command {
  const webcheck = program
    .command("webcheck <url>", { isDefault: true })
    .description("Run a WebCheck audit against <url>")
    .option("--verbose", "print full details for every finding")
    .option("--json", "output the report as JSON")
    .option("--html <file>", "write a standalone HTML report to <file>", requireFilenameArg)
    .option("--markdown <file>", "write a Markdown report to <file>", requireFilenameArg)
    .option("--ci", "run in CI mode (exit non-zero on threshold violations)")
    .option("--mobile", "emulate a mobile viewport")
    .option("--desktop", "emulate a desktop viewport")
    .option("--timeout <ms>", "navigation timeout in milliseconds", "30000")
    .option("--min-score <n>", "minimum overall score required in --ci mode")
    .option(
      "--fail-on <level>",
      "minimum finding severity that fails --ci mode (critical|warning)",
    )
    .option("--max-critical <n>", "maximum allowed critical findings in --ci mode")
    .option("--max-warnings <n>", "maximum allowed warnings in --ci mode")
    // Commander already copies the parent's exitOverride onto subcommands
    // created via program.command(); repeated here only for readers who
    // aren't sure that inheritance happens and might otherwise "fix" a
    // perceived gap by re-adding it in the wrong place.
    .exitOverride()
    .action((url: string, options: WebcheckOptions) => {
      runWebcheckStub(url, options);
    });

  return webcheck;
}

export function runWebcheckStub(url: string, options: WebcheckOptions): void {
  console.log("ShipCheck audit engine is not implemented yet.");
  console.log(`  Target: ${url}`);
  if (options.verbose) {
    console.log(`  Options: ${JSON.stringify(options)}`);
  }
  console.log("  Run `shipcheck --help` to see all available flags.");
}
