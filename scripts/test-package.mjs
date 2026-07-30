import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const temporary = mkdtempSync(join(tmpdir(), "security-middleware-package-"));

try {
  const packed = JSON.parse(
    execFileSync(npm, ["pack", "--json", "--pack-destination", temporary], {
      cwd: root,
      encoding: "utf8",
    })
  );
  const tarball = join(temporary, packed[0].filename);
  const files = new Set(packed[0].files.map(({ path }) => path));

  for (const required of [
    "LICENSE.md",
    "dist/index.d.ts",
    "dist/index.js",
    "dist/cjs/index.js",
    "dist/cjs/package.json",
    "overlay/security-overlay.js",
  ]) {
    if (!files.has(required)) throw new Error(`Packed artifact is missing ${required}`);
  }

  writeFileSync(
    join(temporary, "package.json"),
    `${JSON.stringify({ private: true }, null, 2)}\n`
  );
  execFileSync(npm, ["install", "--ignore-scripts", "--omit=dev", tarball], {
    cwd: temporary,
    stdio: "inherit",
  });

  const run = (args) => execFileSync(process.execPath, args, { cwd: temporary, stdio: "inherit" });
  run([
    "--input-type=module",
    "--eval",
    "const p=await import('@bluedot/security-middleware'); const b=await import('@bluedot/security-middleware/browser'); const n=await import('@bluedot/security-middleware/node'); if(typeof p.securityMiddleware!=='function'||typeof b.analyzeCors!=='function'||typeof n.runNpmAudit!=='function') process.exit(1);",
  ]);
  run([
    "--eval",
    "const p=require('@bluedot/security-middleware'); const b=require('@bluedot/security-middleware/browser'); const n=require('@bluedot/security-middleware/node'); if(typeof p.securityMiddleware!=='function'||typeof b.analyzeCors!=='function'||typeof n.runNpmAudit!=='function') process.exit(1);",
  ]);

  writeFileSync(
    join(temporary, "consumer.ts"),
    'import express from "express";\nimport { securityMiddleware } from "@bluedot/security-middleware";\nexpress().use(securityMiddleware());\n'
  );
  writeFileSync(
    join(temporary, "tsconfig.json"),
    `${JSON.stringify(
      {
        compilerOptions: {
          strict: true,
          noEmit: true,
          esModuleInterop: true,
          module: "NodeNext",
          moduleResolution: "NodeNext",
          target: "ES2021",
        },
        include: ["consumer.ts"],
      },
      null,
      2
    )}\n`
  );
  const typecheck = (expressVersion, expressTypesVersion) => {
    execFileSync(
      npm,
      [
        "install",
        "--ignore-scripts",
        "--save-dev",
        `express@${expressVersion}`,
        `@types/express@${expressTypesVersion}`,
        "typescript@5.9.3",
      ],
      { cwd: temporary, stdio: "inherit" }
    );
    const tsc = join(
      temporary,
      "node_modules",
      ".bin",
      process.platform === "win32" ? "tsc.cmd" : "tsc"
    );
    execFileSync(tsc, ["-p", "tsconfig.json"], { cwd: temporary, stdio: "inherit" });
  };
  typecheck("4.22.2", "4.17.23");
  typecheck("5.2.1", "5.0.3");

  // Ensure the packed overlay is a real script rather than an empty placeholder.
  const overlay = readFileSync(
    join(temporary, "node_modules", "@bluedot", "security-middleware", "overlay", "security-overlay.js"),
    "utf8"
  );
  if (!overlay.includes("data-security-endpoint")) {
    throw new Error("Packed overlay does not contain endpoint configuration support");
  }

  for (const example of [
    "examples/express-app/public/security-overlay.js",
  ]) {
    if (readFileSync(resolve(root, example), "utf8") !== overlay) {
      throw new Error(`${example} has drifted from the published overlay`);
    }
  }
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
