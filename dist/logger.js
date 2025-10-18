import chalk from "chalk";
/**
 * Default console logger for security issues.
 * Formats and colorizes output based on severity level.
 *
 * @param issue - The security issue to log
 */
export const defaultLogger = (issue) => {
    const tag = issue.severity === 'error' ? chalk.bgRed.black(' SECURITY ')
        : issue.severity === 'warn' ? chalk.bgYellow.black(' SECURITY ')
            : chalk.bgBlue.black(' SECURITY ');
    const sev = issue.severity === 'error' ? chalk.red('error')
        : issue.severity === 'warn' ? chalk.yellow('warn')
            : chalk.blue('info');
    console.log(`${tag} ${sev}: ${issue.title}`);
    if (issue.description)
        console.log('  ' + issue.description);
    if (issue.docsUrl)
        console.log('  Docs: ' + issue.docsUrl);
    if (issue.meta)
        console.log('  Meta:', issue.meta);
};
//# sourceMappingURL=logger.js.map