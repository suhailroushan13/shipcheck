import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createProgram } from "./program.js";

interface RunResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

async function runCli(argv: string[]): Promise<RunResult> {
  let stdout = "";
  let stderr = "";
  const logSpy = vi.spyOn(console, "log").mockImplementation((...args: unknown[]) => {
    stdout += args.join(" ") + "\n";
  });
  const stderrSpy = vi
    .spyOn(process.stderr, "write")
    .mockImplementation((chunk: string | Uint8Array) => {
      stderr += chunk.toString();
      return true;
    });
  const stdoutWriteSpy = vi
    .spyOn(process.stdout, "write")
    .mockImplementation((chunk: string | Uint8Array) => {
      stdout += chunk.toString();
      return true;
    });

  try {
    const program = createProgram();
    await program.parseAsync(["node", "shipcheck", ...argv]);
    return { exitCode: 0, stdout, stderr };
  } catch (error: unknown) {
    const exitCode =
      typeof error === "object" && error !== null && "exitCode" in error
        ? (error as { exitCode: number }).exitCode
        : 1;
    return { exitCode, stdout, stderr };
  } finally {
    logSpy.mockRestore();
    stderrSpy.mockRestore();
    stdoutWriteSpy.mockRestore();
  }
}

describe("shipcheck CLI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shipcheck webcheck <url> prints the not-implemented stub and exits 0", async () => {
    const result = await runCli(["webcheck", "https://example.com"]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("not implemented yet");
    expect(result.stdout).toContain("https://example.com");
  });

  it("shipcheck <url> shorthand behaves identically to webcheck <url>", async () => {
    const shorthand = await runCli(["https://example.com"]);
    const explicit = await runCli(["webcheck", "https://example.com"]);
    expect(shorthand.exitCode).toBe(explicit.exitCode);
    expect(shorthand.stdout).toBe(explicit.stdout);
  });

  it("accepts all documented flags without error", async () => {
    const result = await runCli([
      "webcheck",
      "https://example.com",
      "--verbose",
      "--json",
      "--html",
      "report.html",
      "--markdown",
      "report.md",
      "--ci",
      "--mobile",
      "--timeout",
      "5000",
      "--min-score",
      "80",
      "--fail-on",
      "critical",
      "--max-critical",
      "0",
      "--max-warnings",
      "10",
    ]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("not implemented yet");
  });

  it("shipcheck with no arguments exits non-zero with usage, no crash", async () => {
    const result = await runCli([]);
    expect(result.exitCode).not.toBe(0);
  });

  it("shipcheck webcheck with no url exits non-zero with usage, no crash", async () => {
    const result = await runCli(["webcheck"]);
    expect(result.exitCode).not.toBe(0);
  });

  it("passes a malformed URL through without throwing", async () => {
    const result = await runCli(["webcheck", "not-a-url"]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("not-a-url");
  });

  it("rejects an unknown flag with a non-zero exit and no stack trace", async () => {
    const result = await runCli(["webcheck", "https://example.com", "--bogus-flag"]);
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr + result.stdout).not.toContain("at ");
  });

  it("rejects an unknown flag via the <url> shorthand too", async () => {
    const result = await runCli(["--bogus-flag", "https://example.com"]);
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr + result.stdout).not.toContain("at ");
  });

  it("errors when --html is given without a filename (end of args)", async () => {
    const result = await runCli(["webcheck", "https://example.com", "--html"]);
    expect(result.exitCode).not.toBe(0);
  });

  it("errors when --html is immediately followed by another flag, instead of swallowing it as the filename", async () => {
    const result = await runCli(["webcheck", "https://example.com", "--html", "--verbose"]);
    expect(result.exitCode).not.toBe(0);
  });

  it("errors when --markdown is given without a filename (end of args)", async () => {
    const result = await runCli(["webcheck", "https://example.com", "--markdown"]);
    expect(result.exitCode).not.toBe(0);
  });

  it("errors when --markdown is immediately followed by another flag, instead of swallowing it as the filename", async () => {
    const result = await runCli(["webcheck", "https://example.com", "--markdown", "--json"]);
    expect(result.exitCode).not.toBe(0);
  });

  it("--help exits 0 and lists the webcheck command", async () => {
    const result = await runCli(["--help"]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("webcheck");
  });
});
