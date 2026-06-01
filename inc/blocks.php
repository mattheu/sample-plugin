<?php
/**
 * Block registration.
 *
 * @package SamplePlugin
 */

declare( strict_types=1 );

namespace SamplePlugin\Blocks;

const BLOCK_NAME = 'sample-plugin/sample-post-search-block';

/**
 * Registers all blocks.
 */
function bootstrap(): void {
	register_block_type( dirname( __DIR__ ) . '/build/sample-post-search-block' );
}

/**
 * Yields IDs of posts that embed the dmg-read-more block within the given
 * date range (inclusive on both ends).
 *
 * Results are streamed via a Generator so large date ranges never hold the
 * full result set in memory. Cursor-based batching (WHERE ID > ?) is used
 * rather than LIMIT/OFFSET to avoid the page-skip cost that degrades on
 * tables with tens of millions of rows.
 *
 * @param string $date_after  Lower bound, Y-m-d (post_date >= start of day).
 * @param string $date_before Upper bound, Y-m-d (post_date <= end of day).
 * @param string $post_type   Post type to filter by. Default: 'post'.
 * @param string $post_status Post status to filter by. Default: 'publish'.
 * @param int    $batch_size  Rows fetched per query.
 * @return \Generator<int> Yields integer post IDs.
 */
function find_posts_with_block( string $date_after, string $date_before, string $post_type = 'post', string $post_status = 'publish', int $batch_size = 250 ): \Generator {
	global $wpdb;

	$like    = '%' . $wpdb->esc_like( '<!-- wp:' . BLOCK_NAME ) . '%';
	$last_id = 0;

	do {
		// phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$ids = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT ID
				FROM {$wpdb->posts}
				WHERE post_type   = %s
				AND post_status   = %s
				AND post_date    >= %s
				AND post_date    <= %s
				AND post_content  LIKE %s
				AND ID            > %d
				ORDER BY ID ASC
				LIMIT %d",
				$post_type,
				$post_status,
				$date_after . ' 00:00:00',
				$date_before . ' 23:59:59',
				$like,
				$last_id,
				$batch_size
			)
		);
		// phpcs:enable WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

		$count = count( $ids );

		foreach ( $ids as $id ) {
			$last_id = (int) $id;
			yield $last_id;
		}
	} while ( $count === $batch_size );
}
