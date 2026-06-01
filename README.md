# Sample Plugin

A Gutenberg block plugin providing a **Sample Post Search Block** — a configurable "Read More" link block that lets editors search for and select posts to feature.

## Blocks

The plugin registers the following blocks, each built with `@wordpress/scripts` and located under `src/`.

### Sample Post Search Block (`sample-plugin/sample-post-search-block`)

Renders one or more "Read More" links, each pointing to a selected post. The block is dynamic — links are rendered server-side so titles and permalinks always reflect current post data.

**Features:**

- Select post via a searchable modal with category and tag filtering
- Search by post title or enter a post ID directly.
- Performant on sites with large amounts of content.
- Full support for core block styles: color, typography, spacing, and border

**Usage:**

Insert the block, then use the toolbar button or the sidebar panel to open the post picker and select posts.

## Development

The local environment runs WordPress in Docker via WP-Env. The build toolchain uses `@wordpress/scripts` (webpack under the hood) to compile JS and SCSS.

**Prerequisites** Node.js, Docker

Install Composer and NPM dependencies.

```bash
composer install && npm install
```

Build assets with `npm run build` or start the build watcher `npm run start`

Local Docker development environment using [WP-Env](https://developer.wordpress.org/block-editor/getting-started/devenv/get-started-with-wp-env/). Following commands are available:

```bash
npm run env:start   # Start environment
npm run env:stop    # Stop environment
npm run env:clean   # Stop, reset and start environment
npm run env:destroy # Remove all containers, volumes, and generated files
```

The database persists between restarts.

Visit **http://localhost:8888** — admin at http://localhost:8888/wp-admin (`admin` / `password`).

**Seeding sample content**

After starting the environment for the first time, import sample posts, categories, tags, and a test page via:

```bash
npm run env:seed
```

This imports `bin/sample-content.xml` into the development environment using the WordPress Importer. Re-running will create duplicates; use `npm run env:clean` to reset first.

## WP-CLI

WP-CLI is available inside the Docker environment via the `wp` script. Any standard WP-CLI command can be passed after `--`.

You can execute WP-CLI commands using the following script:

```bash
npm run wp -- <command>
```

Examples:

```bash
npm run wp -- post list
npm run wp -- option get siteurl
```

### Custom commands

#### `wp dmg-read-more block-search`

Searches for published posts that contain the `sample-plugin/sample-post-search-block` (dmg-read-more) block and prints matching post IDs to STDOUT, one per line.

If no `--date-after` / `--date-before` flags are provided the command defaults to the **last 30 days**.

**Options**

| Flag | Description | Default |
|------|-------------|---------|
| `--date-after=<Y-m-d>` | Find posts published on or after this date. | 30 days ago |
| `--date-before=<Y-m-d>` | Find posts published on or before this date. | Today |

**Examples**

```bash
# Default: search the last 30 days
npm run wp -- dmg-read-more block-search

# Specific date range
npm run wp -- dmg-read-more block-search --date-after=2024-01-01 --date-before=2024-01-31

# Pipe IDs into another WP-CLI command
npm run wp -- dmg-read-more block-search --date-after=2024-01-01 | xargs -I{} wp post get {}
```

**Full inline help**

```bash
npm run wp -- help dmg-read-more block-search
```

#### Performance notes

This command is designed to run against databases with tens of millions of rows in `wp_posts`. Key implementation choices:

- **Date-first filtering** — `post_date` is indexed. The date range is applied before content scanning, so the `LIKE` check only runs on a fraction of the table.
- **`post_content LIKE` is an unindexed scan** — MySQL cannot use a B-tree index on a `LONGTEXT` column for substring searches. Narrow date windows (days/weeks rather than years) keep this cost manageable.
- **Cursor-based batching** — Results are fetched in batches of 500 using `WHERE ID > {last_id}` instead of `LIMIT/OFFSET`. Standard `OFFSET` pagination requires MySQL to scan and discard preceding rows on every page, a cost that grows linearly with depth. Cursor pagination avoids this entirely.
- **ID-only projection** — Only the `ID` column is selected; full post objects are never loaded into PHP memory.
- **Streaming output** — IDs are printed as each batch arrives, keeping PHP memory usage constant regardless of result set size.

## Linting

Code is linted with ESLint (JS), Stylelint (CSS/SCSS), and PHPCS (PHP) against WordPress and WordPress VIP coding standards.

```bash
npm run lint:js       # Lint JavaScript (ESLint)
npm run lint:css      # Lint CSS/SCSS (Stylelint)
composer lint:php     # Lint PHP (PHPCS with WordPress coding standards)
```

## Testing

PHP tests use PHPUnit and E2E tests use Playwright. Both require Docker and the wp-env environment to be running before executing tests.

**Prerequisite:** start the environment before running either test suite.

```bash
npm run env:start
```

Both test suites target the `tests-wordpress` environment (port 8889), which uses a separate database (`tests_wordpress`) from the development environment. Test content never touches the development database.

**PHP tests:**

```bash
npm run test:php        # PHPUnit — block render output
```

**E2E tests:** the setup script resets the tests database and imports the required content. The database is treated as disposable and reset on each run.

```bash
npm run env:setup-e2e      # Reset tests DB and import content
npm run test:e2e            # Playwright — block editor interactions
npm run test:e2e -- --ui   # Run with Playwright's interactive UI mode
```
