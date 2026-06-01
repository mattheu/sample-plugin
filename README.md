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
npm run env:start # Start environment
npm run env:stop # Stop environment
npm run env:clean # Stop, reset and start environment
```

The database persists between restarts.

Visit **http://localhost:8888** — admin at http://localhost:8888/wp-admin (`admin` / `password`).

Optional: Generate some test content.

```bash
npm run wp -- post generate --count=50 --post_status=publish
```

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

## Linting

Code is linted with ESLint (JS), Stylelint (CSS/SCSS), and PHPCS (PHP) against WordPress and WordPress VIP coding standards.

```bash
npm run lint:js       # Lint JavaScript (ESLint)
npm run lint:css      # Lint CSS/SCSS (Stylelint)
composer lint:php     # Lint PHP (PHPCS with WordPress coding standards)
```

## Testing

PHP tests use PHPUnit against a real WordPress install inside the `wp-env` Docker environment. The environment must be running before executing tests.

```bash
npm run test:php
```
