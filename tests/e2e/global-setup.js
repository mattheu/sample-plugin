const { chromium } = require( '@playwright/test' );
const path = require( 'path' );

/**
 * Playwright global setup — logs in to wp-admin and saves browser auth storage state.
 */
module.exports = async () => {
	const browser = await chromium.launch();
	const page = await browser.newPage();
	await page.goto( 'http://localhost:8889/wp-login.php' );
	await page.fill( '#user_login', 'admin' );
	await page.fill( '#user_pass', 'password' );
	await page.click( '#wp-submit' );
	await page.waitForURL( '**/wp-admin/**' );
	await page
		.context()
		.storageState( { path: path.join( __dirname, 'storage-state.json' ) } );
	await browser.close();
};
