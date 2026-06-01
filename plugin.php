<?php
/**
 * Plugin Name: Sample Plugin
 * Description: A basic Gutenberg block.
 * Version:     0.1.0
 * Author:      Human Made
 * License:     GPL-2.0-or-later
 * Text Domain: sample-plugin
 *
 * @package SamplePlugin
 */

declare( strict_types=1 );

namespace SamplePlugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/inc/blocks.php';

add_action( 'init', __NAMESPACE__ . '\\Blocks\\bootstrap' );

if ( defined( 'WP_CLI' ) && WP_CLI ) {
	require_once __DIR__ . '/inc/class-cli-command.php';
	\WP_CLI::add_command( 'dmg-read-more', CLI\CLI_Command::class );
}
