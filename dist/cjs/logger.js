"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultLogger = void 0;
const ansi = (open, close, value) => {
    const enabled = typeof process !== "undefined" &&
        Boolean(process.stdout?.isTTY) &&
        process.env?.NO_COLOR === undefined;
    return enabled ? `\u001B[${open}m${value}\u001B[${close}m` : value;
};
/**
 * Default console logger for security issues.
 * Formats and colorizes output based on severity level.
 *
 * @param issue - The security issue to log
 */
const defaultLogger = (issue) => {
    const tag = issue.severity === "error" ? ansi(41, 0, " SECURITY ")
        : issue.severity === "warn" ? ansi(43, 0, " SECURITY ")
            : ansi(44, 0, " SECURITY ");
    const sev = issue.severity === "error" ? ansi(31, 0, "error")
        : issue.severity === "warn" ? ansi(33, 0, "warn")
            : ansi(34, 0, "info");
    console.log(`${tag} ${sev}: ${issue.title}`);
    if (issue.description)
        console.log('  ' + issue.description);
    if (issue.docsUrl)
        console.log('  Docs: ' + issue.docsUrl);
    if (issue.meta)
        console.log('  Meta:', issue.meta);
};
exports.defaultLogger = defaultLogger;
//# sourceMappingURL=logger.js.map