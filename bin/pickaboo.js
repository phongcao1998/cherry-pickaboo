#!/usr/bin/env node

import chalk from 'chalk';
import inquirer from 'inquirer';
import simpleGit from 'simple-git';

const git = simpleGit();

async function main() {
  const [, , sourceBranch, destBranch] = process.argv;

  if (!sourceBranch || !destBranch) {
    console.error(
      chalk.red(
        '❌ Usage: node cherry-pickaboo.js <sourceBranch> <destinationBranch>',
      ),
    );
    process.exit(1);
  }

  try {
    await git.fetch();
    const branches = await git.branch();
    if (!branches.all.includes(sourceBranch)) {
      throw new Error(`Source branch "${sourceBranch}" not found`);
    }
    if (!branches.all.includes(destBranch)) {
      throw new Error(`Destination branch "${destBranch}" not found`);
    }

    const log = await git.log({ from: destBranch, to: sourceBranch });

    const commits = log.all.map((c) => {
      const date = new Date(c.date).toLocaleString();
      return {
        hash: c.hash,
        label: `${chalk.yellow(c.hash.slice(0, 7))} - ${c.message} ${chalk.gray(`(${date})`)} ${chalk.gray(`(${c.author_name})`)}`,
      };
    });

    if (commits.length === 0) {
      console.log(
        chalk.green(
          `✨ No commits to cherry-pick from ${chalk.cyan(sourceBranch)} to ${chalk.cyan(destBranch)}`,
        ),
      );
      return;
    }

    const { commitsToPick } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'commitsToPick',
        message: chalk.cyanBright(
          `📋 Select commits to cherry-pick into ${chalk.magenta(destBranch)}:`,
        ),
        choices: commits.map((c) => ({ name: c.label, value: c.hash })),
        pageSize: 15,
        validate: (val) =>
          val.length > 0 ? true : chalk.red('⚠️ Pick at least one commit'),
      },
    ]);

    if (!commitsToPick || commitsToPick.length === 0) {
      console.log(chalk.yellow('⚠️ No commits selected. Exiting.'));
      return;
    }

    console.log(
      chalk.blue(`\n📦 Switching to branch ${chalk.magenta(destBranch)}...`),
    );
    await git.checkout(destBranch);

    for (const commit of commitsToPick.reverse()) {
      try {
        console.log(
          chalk.green(`🍒 Cherry-picking ${chalk.yellow(commit)}...`),
        );
        await git.raw(['cherry-pick', commit]);
      } catch {
        console.error(
          chalk.red(
            `❌ Conflict while cherry-picking ${commit}. Please resolve manually.`,
          ),
        );
        process.exit(1);
      }
    }

    console.log(
      chalk.greenBright(
        `\n🎉 Success! Selected commits were cherry-picked into ${chalk.magenta(destBranch)} 🚀`,
      ),
    );
  } catch (err) {
    console.error(chalk.red('💥 Error:'), err.message);
    process.exit(1);
  }
}

main();
