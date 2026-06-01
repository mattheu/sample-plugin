const { defineConfig } = require( '@playwright/test' );

module.exports = defineConfig( {
	globalSetup: 'tests/e2e/global-setup.js',
	testDir: 'tests/e2e',
	// Tests must run serially — they share a single WordPress environment.
	workers: 1,
	use: {
		baseURL: 'http://localhost:8889',
		storageState: 'tests/e2e/storage-state.json',
	},
	// Give Docker containers more time to respond.
	timeout: 60_000,
	expect: { timeout: 10_000 },
} );
