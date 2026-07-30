import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { Issue, SecurityOptions } from "../types.js";

const pexecFile = promisify(execFile);

type AuditExecutor = () => Promise<{ stdout: string }>;

/**
 * Cache for npm audit results to avoid repeated expensive operations.
 */
let cache: { at: number; issues: Issue[] } | null = null;
let inFlight: Promise<Issue[]> | null = null;

function count(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : 0;
}

/** Parse modern or legacy npm audit JSON into middleware issues. */
export function parseNpmAuditJson(stdout: string): Issue[] {
  const data = JSON.parse(stdout) as {
    total?: number;
    metadata?: {
      vulnerabilities?: Record<string, unknown>;
    };
  };
  const summary = data.metadata?.vulnerabilities;
  const hasModernCounts =
    summary !== undefined &&
    ["info", "low", "moderate", "high", "critical", "total"].some(
      (key) => typeof summary[key] === "number"
    );
  if (!hasModernCounts && typeof data.total !== "number") {
    throw new Error("Invalid npm audit report");
  }
  const critical = count(summary?.critical);
  const high = count(summary?.high);
  const moderate = count(summary?.moderate);
  const low = count(summary?.low);
  const info = count(summary?.info);
  const total = count(summary?.total) || count(data.total) || critical + high + moderate + low + info;

  if (total > 0) {
    return [
      {
        id: "npm.audit.findings",
        title: `npm audit found ${total} vulnerability(ies)`,
        description: "Run `npm audit` and remediate critical/high findings before release.",
        severity: critical > 0 || high > 0 ? "error" : "warn",
        meta: {
          summary: { info, low, moderate, high, critical, total },
        },
      },
    ];
  }

  return [
    {
      id: "npm.audit.clean",
      title: "npm audit: no known vulnerabilities",
      description: "Dependency scan is clean.",
      severity: "info",
    },
  ];
}

async function executeNpmAudit(): Promise<{ stdout: string }> {
  const result = await pexecFile("npm", ["audit", "--json"], {
    timeout: 25000,
    maxBuffer: 10 * 1024 * 1024,
    encoding: "utf8",
  });
  return { stdout: result.stdout };
}

/**
 * Runs npm audit to check for known vulnerabilities in dependencies.
 * Results are cached based on the cacheMs option to avoid redundant scans.
 * 
 * @param opts - Security middleware options containing audit configuration
 * @returns Array of issues representing audit findings or errors
 */
export async function runNpmAudit(
  opts: SecurityOptions,
  executor: AuditExecutor = executeNpmAudit
): Promise<Issue[]> {
  const cacheMs = opts.audit?.cacheMs ?? 5 * 60_000;
  if (cache && Date.now() - cache.at < cacheMs) return cache.issues;
  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      const { stdout } = await executor();
      const issues = parseNpmAuditJson(stdout);
      cache = { at: Date.now(), issues };
      return issues;
    } catch (err: unknown) {
      const auditError = err as { stdout?: unknown; code?: unknown };
      const stdout =
        typeof auditError.stdout === "string"
          ? auditError.stdout
          : Buffer.isBuffer(auditError.stdout)
            ? auditError.stdout.toString("utf8")
            : "";
      if (stdout.trim()) {
        try {
          const issues = parseNpmAuditJson(stdout);
          cache = { at: Date.now(), issues };
          return issues;
        } catch {
          // Fall through to a bounded, non-sensitive error below.
        }
      }

      return [
        {
          id: "npm.audit.error",
          title: "npm audit could not run",
          description: "npm audit failed before producing valid JSON.",
          severity: "warn",
          meta: {
            exitCode:
              typeof auditError.code === "string" || typeof auditError.code === "number"
                ? auditError.code
                : undefined,
          },
        },
      ];
    }
  })();

  try {
    return await inFlight;
  } finally {
    inFlight = null;
  }
}
