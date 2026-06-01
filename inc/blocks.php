<?php
/**
 * Block registration.
 *
 * @package SamplePlugin
 */

declare( strict_types=1 );

namespace SamplePlugin\Blocks;

function bootstrap()
{

$foo = 'bar';

echo $foo;
    register_block_type(dirname( __DIR__ ) . '/build/sample-post-search-block' );
}
