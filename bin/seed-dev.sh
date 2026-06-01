#!/bin/bash
set -e

echo "Installing WordPress Importer..." >&2
npx wp-env run cli wp plugin install wordpress-importer --activate --force

echo "Importing sample content..." >&2
npx wp-env run cli --env-cwd wp-content/plugins/sample-plugin wp import bin/sample-content.xml --authors=create

echo "Done. Sample content imported into the dev environment." >&2
