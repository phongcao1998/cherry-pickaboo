#!/usr/bin/env node

import chalk from 'chalk';
import inquirer from 'inquirer';
import simpleGit from 'simple-git';

const git = simpleGit();

async function main() {
  const args = process.argv.slice(2);
  const sourceBranch = args[0];
  const destBranch = args[1];
  
  // Extract keyword and flags
  let keyword = '';
  let noCommitFlag = false;
  
  for (let i = 2; i < args.length; i++) {
    if (args[i] === '--no-commit') {
      noCommitFlag = true;
    } else if (!keyword && !args[i].startsWith('--')) {
      keyword = args[i];
    }
  }

  if (!sourceBranch || !destBranch) {
    console.error(
      chalk.red(
        '❌ Usage: cherry-pickaboo <sourceBranch> <destinationBranch> [keyword] [--no-commit]',
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

    const log = await git.log([sourceBranch]);
    let commits = log.all.map((c) => ({
      hash: c.hash,
      message: c.message,
      author: c.author_name,
      date: c.date,
      label: `${chalk.yellow(c.hash.slice(0, 7))} - ${c.message} ${chalk.gray(`(${c.author_name})`)}`,
    }));

    // Filter commits by keyword if provided
    if (keyword) {
      commits = commits.filter((commit) =>
        commit.message.toLowerCase().includes(keyword.toLowerCase()) ||
        commit.author.toLowerCase().includes(keyword.toLowerCase()) ||
        commit.hash.toLowerCase().includes(keyword.toLowerCase())
      );
      
      console.log(chalk.blue(`🔍 Filtering commits by keyword: ${chalk.yellow(keyword)}`));
      console.log(chalk.gray(`Found ${commits.length} matching commits\n`));
    }

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
        loop: false,
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
        await git.raw(['cherry-pick', commit, noCommitFlag ? '--no-commit' : ''].filter(Boolean));
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
