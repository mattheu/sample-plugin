<?php
/**
 * WP-CLI command: dmg-read-more.
 *
 * @package SamplePlugin
 */

declare( strict_types=1 );

namespace SamplePlugin\CLI;

use function SamplePlugin\Blocks\find_posts_with_block;

/**
 * Commands for the dmg-read-more block.
 *
 * Extends WP_CLI_Command directly rather than WPCOM_VIP_CLI_Command as the VIP
 * base class is not available outside of WordPress VIP environments.
 */
class CLI_Command extends \WP_CLI_Command {

	/**
	 * Search for posts that contain the dmg-read-more block.
	 *
	 * Prints one post ID per line to STDOUT. Use --date-after / --date-before
	 * to narrow the search window; defaults to the last 30 days.
	 *
	 * ## OPTIONS
	 *
	 * [--date-after=<date>]
	 * : Find posts published on or after this date (Y-m-d). Default: 30 days ago.
	 *
	 * [--date-before=<date>]
	 * : Find posts published on or before this date (Y-m-d). Default: today.
	 *
	 * [--post-type=<post-type>]
	 * : Post type to search. Default: post.
	 *
	 * [--post-status=<post-status>]
	 * : Post status to search. Default: publish.
	 *
	 * ## EXAMPLES
	 *
	 *     # Search within the default date range (last 30 days)
	 *     $ wp dmg-read-more block-search
	 *
	 *     # Search within a specific date range
	 *     $ wp dmg-read-more block-search --date-after=2024-01-01 --date-before=2024-01-31
	 *
	 * @subcommand block-search
	 * @param array $args       Positional arguments (unused).
	 * @param array $assoc_args Named flag arguments.
	 */
	public function block_search( array $args, array $assoc_args ): void {
		$date_before = $assoc_args['date-before'] ?? gmdate( 'Y-m-d' );
		$date_after  = $assoc_args['date-after'] ?? gmdate( 'Y-m-d', strtotime( '-30 days' ) );
		$post_type   = $assoc_args['post-type'] ?? 'post';
		$post_status = $assoc_args['post-status'] ?? 'publish';

		if ( ! $this->is_valid_date( $date_before ) || ! $this->is_valid_date( $date_after ) ) {
			\WP_CLI::error( 'Dates must be in Y-m-d format (e.g. 2024-01-31).' );
		}

		if ( $date_after > $date_before ) {
			\WP_CLI::error( '--date-after must be earlier than or equal to --date-before.' );
		}

		$found = false;

		foreach ( find_posts_with_block( $date_after, $date_before, $post_type, $post_status ) as $id ) {
			\WP_CLI::log( (string) $id );
			$found = true;
		}

		if ( ! $found ) {
			\WP_CLI::log( 'No posts found.' );
		}
	}

	/**
	 * Returns true if $date is a valid Y-m-d calendar date.
	 *
	 * @param string $date Date string to validate.
	 * @return bool True if valid, false otherwise.
	 */
	private function is_valid_date( string $date ): bool {
		$d = \DateTime::createFromFormat( 'Y-m-d', $date );
		return $d && $d->format( 'Y-m-d' ) === $date;
	}
}
