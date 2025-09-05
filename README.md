# 🍒 Cherry-Pickaboo

An interactive cherry-pick tool for Git with a beautiful CLI interface.

## Features

- 🎯 Interactive selection of commits to cherry-pick
- 🎨 Beautiful colored output with emojis
- 📅 Shows commit dates and authors
- ✅ Validates branch existence before operation
- 🔄 Handles multiple commits in sequence
- 🔍 Filter commits by keyword (message, author, or hash)
- ⚙️ Support for `--no-commit` flag

## Installation

You don't need to install this globally! Use it directly with npx:

```bash
npx cherry-pickaboo <source-branch> <destination-branch> [keyword] [--no-commit]
```

Or install globally:

```bash
npm install -g cherry-pickaboo
cherry-pickaboo <source-branch> <destination-branch> [keyword] [--no-commit]
```

## Usage

### Basic Usage

```bash
npx cherry-pickaboo feature-branch main
```

This will:
1. Fetch the latest changes
2. Show you all commits that are in `feature-branch` but not in `main`
3. Let you interactively select which commits to cherry-pick
4. Apply the selected commits to `main`

### Filter by Keyword

```bash
npx cherry-pickaboo feature-branch main "bug fix"
```

Filter commits by keyword - searches in commit message, author name, and commit hash:
- Only shows commits containing "bug fix" (case-insensitive)
- Helps you quickly find specific types of commits

### Use --no-commit Flag

```bash
npx cherry-pickaboo feature-branch main --no-commit
```

Cherry-pick commits without automatically committing them:
- Allows you to review and modify changes before committing
- Useful for combining multiple commits or making adjustments

### Combine Keyword and Flag

```bash
npx cherry-pickaboo feature-branch main "hotfix" --no-commit
```

Filter by keyword AND use the no-commit flag:
- Shows only commits containing "hotfix"
- Cherry-picks them without committing

## Requirements

- Node.js 14 or higher
- Git repository

## License

MIT
