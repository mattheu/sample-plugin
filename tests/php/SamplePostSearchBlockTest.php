<?php
/**
 * Tests for the Sample Post Search Block render output.
 *
 * @package SamplePlugin
 */

namespace SamplePlugin\Tests;

use WP_UnitTestCase;

class SamplePostSearchBlockTest extends WP_UnitTestCase {

	private function render( array $attributes ): string {
		$block = new \WP_Block(
			[
				'blockName'    => 'sample-plugin/sample-post-search-block',
				'attrs'        => $attributes,
				'innerBlocks'  => [],
				'innerHTML'    => '',
				'innerContent' => [],
			]
		);
		return $block->render();
	}

	public function test_renders_nothing_when_no_post_ids(): void {
		$output = $this->render( [ 'postIds' => [] ] );
		$this->assertEmpty( $output );
	}

	public function test_renders_nothing_when_post_ids_missing(): void {
		$output = $this->render( [] );
		$this->assertEmpty( $output );
	}

	public function test_renders_nothing_for_draft_post(): void {
		$post_id = self::factory()->post->create( [ 'post_status' => 'draft' ] );
		$output  = $this->render( [ 'postIds' => [ $post_id ] ] );
		$this->assertEmpty( $output );
	}

	public function test_renders_nothing_for_private_post(): void {
		$post_id = self::factory()->post->create( [ 'post_status' => 'private' ] );
		$output  = $this->render( [ 'postIds' => [ $post_id ] ] );
		$this->assertEmpty( $output );
	}

	public function test_renders_nothing_for_trashed_post(): void {
		$post_id = self::factory()->post->create( [ 'post_status' => 'trash' ] );
		$output  = $this->render( [ 'postIds' => [ $post_id ] ] );
		$this->assertEmpty( $output );
	}

	public function test_renders_wrapper_with_dmg_read_more_class(): void {
		$post_id = self::factory()->post->create( [ 'post_status' => 'publish' ] );
		$output  = $this->render( [ 'postIds' => [ $post_id ] ] );
		$this->assertStringContainsString( 'class="dmg-read-more wp-block-sample-plugin-sample-post-search-block"', $output );
	}

	public function test_anchor_text_is_prepended_with_read_more(): void {
		$post_id = self::factory()->post->create( [
			'post_title'  => 'My Test Post',
			'post_status' => 'publish',
		] );
		$output = $this->render( [ 'postIds' => [ $post_id ] ] );
		$this->assertStringContainsString( 'Read More: My Test Post', $output );
	}

	public function test_anchor_href_is_post_permalink(): void {
		$post_id   = self::factory()->post->create( [ 'post_status' => 'publish' ] );
		$permalink = get_permalink( $post_id );
		$output    = $this->render( [ 'postIds' => [ $post_id ] ] );
		$this->assertStringContainsString( 'href="' . $permalink . '"', $output );
	}

	public function test_anchor_is_wrapped_in_paragraph(): void {
		$post_id = self::factory()->post->create( [ 'post_status' => 'publish' ] );
		$output  = $this->render( [ 'postIds' => [ $post_id ] ] );
		$this->assertMatchesRegularExpression( '/<p><a [^>]*>Read More:/', $output );
	}

	public function test_renders_multiple_posts(): void {
		$post_ids = self::factory()->post->create_many( 3, [ 'post_status' => 'publish' ] );
		$output   = $this->render( [ 'postIds' => $post_ids ] );
		$this->assertSame( 3, substr_count( $output, '<p><a ' ) );
	}

	public function test_skips_unpublished_posts_in_mixed_list(): void {
		$published_id = self::factory()->post->create( [ 'post_status' => 'publish' ] );
		$draft_id     = self::factory()->post->create( [ 'post_status' => 'draft' ] );
		$output       = $this->render( [ 'postIds' => [ $published_id, $draft_id ] ] );
		$this->assertSame( 1, substr_count( $output, '<p><a ' ) );
	}
}
