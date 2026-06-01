const path = require( 'path' );
const pkgDir = path.dirname( require.resolve( '@wordpress/e2e-test-utils-playwright/package.json' ) );
const { test, expect } = require( path.join( pkgDir, 'build/index.js' ) );
const { openInspector } = require( './utils' );

// First post imported from bin/sample-content.xml — ID is preserved by the WordPress importer.
const FIRST_POST = { id: 101, title: 'Lorem Ipsum' };
const LAST_POST = { id: 112, title: 'Irure Dolor Reprehenderit' };


test.describe( 'Sample Post Search Block — post picker', () => {
	test.beforeEach( async ( { admin, editor, page } ) => {
		await admin.createNewPost( { postType: 'page' } );
		await page.getByRole( 'button', { name: 'Close' } ).click( { timeout: 3000 } ).catch( () => {} );
		await editor.insertBlock( { name: 'sample-plugin/sample-post-search-block' } );
		await openInspector( page );
		await page.locator( '.editor-sidebar' ).getByRole( 'button', { name: 'Select Post' } ).click();
	} );

	test( 'shows posts by default with no search query', async ( { page } ) => {
		const modal = page.getByRole( 'dialog' );
		await expect( modal ).toBeVisible();
		await expect( modal.getByRole( 'checkbox', { name: LAST_POST.title } ) ).toBeVisible();
	} );

	test( 'filters results when searching by title', async ( { page } ) => {
		const modal = page.getByRole( 'dialog' );
		await modal.getByRole( 'searchbox' ).fill( FIRST_POST.title );
		await expect( modal.getByRole( 'checkbox', { name: FIRST_POST.title } ) ).toBeVisible();
		await expect( modal.getByRole( 'checkbox', { name: 'Dolor Sit Amet' } ) ).not.toBeVisible();
	} );

	test( 'finds a post when searching by ID', async ( { page } ) => {
		const modal = page.getByRole( 'dialog' );
		await modal.getByRole( 'searchbox' ).fill( String( FIRST_POST.id ) );
		await expect( modal.getByRole( 'checkbox', { name: FIRST_POST.title } ) ).toBeVisible();
		await expect( modal.getByRole( 'checkbox' ) ).toHaveCount( 1 );
	} );

	test( 'paginates results and shows page indicator', async ( { page } ) => {
		const modal = page.getByRole( 'dialog' );
		await expect( modal.getByText( 'Page 1 of' ) ).toBeVisible();
		const nextButton = modal.getByRole( 'button', { name: 'Next' } );
		await expect( nextButton ).toBeEnabled();
		await nextButton.click();
		await expect( modal.getByText( 'Page 2 of' ) ).toBeVisible();
		await expect( modal.getByRole( 'button', { name: 'Previous' } ) ).toBeEnabled();
		await expect( modal.getByRole( 'button', { name: 'Next' } ) ).toBeDisabled();
	} );

	test( 'selecting a post and confirming updates the editor preview', async ( { editor, page } ) => {
		const modal = page.getByRole( 'dialog' );
		await modal.getByRole( 'searchbox' ).fill( FIRST_POST.title );
		await modal.getByRole( 'checkbox', { name: FIRST_POST.title } ).check();
		await modal.getByRole( 'button', { name: 'Select Post' } ).click();
		await expect( modal ).not.toBeVisible();
		await expect(
			editor.canvas.getByRole( 'link', { name: `Read More: ${ FIRST_POST.title }` } )
		).toBeVisible();
	} );

	test( 'closing the modal without confirming discards the selection', async ( { editor, page } ) => {
		const modal = page.getByRole( 'dialog' );
		await modal.getByRole( 'searchbox' ).fill( FIRST_POST.title );
		await modal.getByRole( 'checkbox', { name: FIRST_POST.title } ).check();
		await modal.getByRole( 'button', { name: 'Close' } ).click();
		await expect( modal ).not.toBeVisible();
		await expect(
			editor.canvas.getByText( 'Select a post in the block settings.' )
		).toBeVisible();
	} );
} );
