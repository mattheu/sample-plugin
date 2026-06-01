<?php
/**
 * Tests for the dmg-read-more CLI command.
 *
 * @package SamplePlugin
 */

namespace SamplePlugin\Tests;

use WP_UnitTestCase;

use function SamplePlugin\Blocks\find_posts_with_block;

/**
 * CLI command tests.
 */
class CLICommandTest extends WP_UnitTestCase {

	const BLOCK_COMMENT = '<!-- wp:sample-plugin/sample-post-search-block {"postIds":[]} /-->';

	/**
	 * Creates a post for testing.
	 *
	 * @param boolean $with_block Whether to include the block comment.
	 * @param array   $overrides Post data overrides.
	 * @return integer Post ID.
	 */
	private function create_post( bool $with_block = true, array $overrides = [] ): int {
		return (int) self::factory()->post->create(
			array_merge(
				[
					'post_status'  => 'publish',
					'post_date'    => gmdate( 'Y-m-d H:i:s' ),
					'post_content' => $with_block ? self::BLOCK_COMMENT : '<p>No block here.</p>',
				],
				$overrides
			)
		);
	}

	/**
	 * It finds a post containing the block comment.
	 *
	 * @param \Generator $gen Generator yielding post IDs.
	 * @return array<int> Array of post IDs.
	 */
	private function collect( \Generator $gen ): array {
		$ids = [];
		foreach ( $gen as $id ) {
			$ids[] = $id;
		}
		return $ids;
	}

	/**
	 * Date range spanning yesterday–tomorrow, covering any post created today.
	 *
	 * @return array{0: string, 1: string} Array with 'date-after' and 'date-before' values.
	 */
	private function default_range(): array {
		return [
			gmdate( 'Y-m-d', strtotime( '-1 day' ) ),
			gmdate( 'Y-m-d', strtotime( '+1 day' ) ),
		];
	}

	/**
	 * A published post whose content contains the block comment is returned.
	 */
	public function test_finds_post_containing_block(): void {
		$id                 = $this->create_post( true );
		[ $after, $before ] = $this->default_range();

		$this->assertContains( $id, $this->collect( find_posts_with_block( $after, $before ) ) );
	}

	/**
	 * A post without the block comment is not returned.
	 */
	public function test_does_not_find_post_without_block(): void {
		$id                 = $this->create_post( false );
		[ $after, $before ] = $this->default_range();

		$this->assertNotContains( $id, $this->collect( find_posts_with_block( $after, $before ) ) );
	}

	/**
	 * A post dated outside the requested range is not returned.
	 */
	public function test_does_not_find_post_outside_date_range(): void {
		$id = $this->create_post( true, [ 'post_date' => '2000-01-15 12:00:00' ] );

		$this->assertNotContains( $id, $this->collect( find_posts_with_block( '2000-01-16', '2000-01-31' ) ) );
	}

	/**
	 * Draft posts are excluded by the default post_status filter.
	 */
	public function test_does_not_find_draft_post_by_default(): void {
		$id                 = $this->create_post( true, [ 'post_status' => 'draft' ] );
		[ $after, $before ] = $this->default_range();

		$this->assertNotContains( $id, $this->collect( find_posts_with_block( $after, $before ) ) );
	}

	/**
	 * Private posts are excluded by the default post_status filter.
	 */
	public function test_does_not_find_private_post_by_default(): void {
		$id                 = $this->create_post( true, [ 'post_status' => 'private' ] );
		[ $after, $before ] = $this->default_range();

		$this->assertNotContains( $id, $this->collect( find_posts_with_block( $after, $before ) ) );
	}

	/**
	 * Trashed posts are excluded by the default post_status filter.
	 */
	public function test_does_not_find_trashed_post_by_default(): void {
		$id                 = $this->create_post( true, [ 'post_status' => 'trash' ] );
		[ $after, $before ] = $this->default_range();

		$this->assertNotContains( $id, $this->collect( find_posts_with_block( $after, $before ) ) );
	}

	/**
	 * An empty generator is returned when no posts match.
	 */
	public function test_returns_empty_when_no_matching_posts(): void {
		$this->assertEmpty( $this->collect( find_posts_with_block( '1990-01-01', '1990-01-02' ) ) );
	}

	/**
	 * All matching posts are returned; non-matching posts are excluded.
	 */
	public function test_finds_multiple_posts(): void {
		$id1                = $this->create_post( true );
		$id2                = $this->create_post( true );
		$id3                = $this->create_post( false );
		[ $after, $before ] = $this->default_range();

		$ids = $this->collect( find_posts_with_block( $after, $before ) );

		$this->assertContains( $id1, $ids );
		$this->assertContains( $id2, $ids );
		$this->assertNotContains( $id3, $ids );
	}

	/**
	 * Both the date-after and date-before bounds are inclusive.
	 */
	public function test_date_range_is_inclusive_on_both_ends(): void {
		$date = '2010-06-15';
		$id   = $this->create_post( true, [ 'post_date' => $date . ' 00:00:00' ] );

		$this->assertContains( $id, $this->collect( find_posts_with_block( $date, $date ) ) );
	}

	/**
	 * All results are returned when the batch size forces multiple DB round-trips.
	 */
	public function test_cursor_batching_returns_all_posts(): void {
		$created = [];
		for ( $i = 0; $i < 5; $i++ ) {
			$created[] = $this->create_post( true );
		}

		[ $after, $before ] = $this->default_range();

		// Batch size of 2 forces multiple DB round-trips.
		$ids = $this->collect( find_posts_with_block( $after, $before, 'post', 'publish', 2 ) );

		foreach ( $created as $id ) {
			$this->assertContains( $id, $ids );
		}
	}

	/**
	 * Each yielded value is an integer, not a string from the DB result.
	 */
	public function test_yields_integer_ids(): void {
		$this->create_post( true );
		[ $after, $before ] = $this->default_range();

		foreach ( find_posts_with_block( $after, $before ) as $id ) {
			$this->assertIsInt( $id );
			break;
		}
	}
}
