<?php
/**
 * PHPUnit bootstrap — loads the WordPress test suite.
 *
 * @package SamplePlugin
 */

$_tests_dir = getenv( 'WP_TESTS_DIR' ) ?: '/tmp/wordpress-tests-lib';

if ( ! file_exists( "$_tests_dir/includes/functions.php" ) ) {
	throw new RuntimeException( "WordPress test suite not found at $_tests_dir. Run the environment with `npm run env:start` and ensure the test suite is installed." );
}

// Required by the WordPress test suite.
require_once dirname( __DIR__, 2 ) . '/vendor/yoast/phpunit-polyfills/phpunitpolyfills-autoload.php';

// Load the WordPress test suite bootstrap.
require_once "$_tests_dir/includes/functions.php";

// Manually load the plugin before WordPress sets up, so hooks registered at
// file scope are in place when the test suite boots.
tests_add_filter( 'muplugins_loaded', function () {
	require dirname( __DIR__, 2 ) . '/plugin.php';
} );

require "$_tests_dir/includes/bootstrap.php";
