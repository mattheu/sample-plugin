#!/bin/bash
set -e

echo "Starting environment..." >&2
npx wp-env start

echo "Resetting tests environment database..." >&2
npx wp-env clean tests

echo "Clearing default content..." >&2
npx wp-env run tests-cli wp site empty --yes

echo "Installing WordPress Importer..." >&2
npx wp-env run tests-cli wp plugin install wordpress-importer --activate --force

echo "Importing sample content..." >&2
npx wp-env run tests-cli --env-cwd wp-content/plugins/sample-plugin wp import bin/sample-content.xml --authors=create

echo "Done." >&2
