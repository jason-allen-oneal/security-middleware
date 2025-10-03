import chalk from "chalk";
import { Issue } from "./types.js";

export const defaultLogger = (issue: Issue) => {
  const tag =
    issue.severity === 'error' ? chalk.bgRed.black(' SECURITY ')
    : issue.severity === 'warn' ? chalk.bgYellow.black(' SECURITY ')
    : chalk.bgBlue.black(' SECURITY ');

  const sev =
    issue.severity === 'error' ? chalk.red('error')
    : issue.severity === 'warn' ? chalk.yellow('warn')
    : chalk.blue('info');

  console.log(`${tag} ${sev}: ${issue.title}`);
  if (issue.description) console.log('  ' + issue.description);
  if (issue.docsUrl) console.log('  Docs: ' + issue.docsUrl);
  if (issue.meta) console.log('  Meta:', issue.meta);
};
