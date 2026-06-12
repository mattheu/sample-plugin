/**
 * Opens the block editor sidebar inspector if it is not already visible.
 *
 * @param {import('@playwright/test').Page} page Playwright page object.
 */
async function openInspector( page ) {
	const isOpen = await page.locator( '.editor-sidebar' ).isVisible();
	if ( ! isOpen ) {
		await page.getByRole( 'button', { name: 'Settings' } ).click();
	}
}

module.exports = { openInspector };
