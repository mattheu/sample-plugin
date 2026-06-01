async function openInspector( page ) {
	const isOpen = await page.locator( '.editor-sidebar' ).isVisible();
	if ( ! isOpen ) {
		await page.getByRole( 'button', { name: 'Settings' } ).click();
	}
}

module.exports = { openInspector };
