<?php
/**
 * Block registration.
 *
 * @package SamplePlugin
 */

declare( strict_types=1 );

namespace SamplePlugin\Blocks;

/**
 * Registers all blocks.
 */
function bootstrap(): void {
	register_block_type( dirname( __DIR__ ) . '/build/sample-post-search-block' );
}
