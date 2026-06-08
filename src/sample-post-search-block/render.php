<?php
/**
 * Renders the block on the frontend.
 *
 * @param array $attributes The block attributes.
 * @package SamplePlugin
 */

$post_ids = $attributes['postIds'] ?? [];

if ( empty( $post_ids ) ) {
	return;
}

$query = new WP_Query(
	[
		'post__in'            => $post_ids,
		'post_status'         => 'publish',
		'posts_per_page'      => count( $post_ids ),
		'orderby'             => 'post__in',
		'ignore_sticky_posts' => true,
		'no_found_rows'       => true,
	]
);

$block_posts = $query->posts;

if ( empty( $block_posts ) ) {
	return;
}
?>
<div <?php echo get_block_wrapper_attributes( [ 'class' => 'dmg-read-more' ] ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
	<?php foreach ( $block_posts as $block_post ) : ?>
		<p><a href="<?php echo esc_url( get_permalink( $block_post ) ); ?>">
			<?php
			// translators: %s: Post title.
			echo esc_html( sprintf( __( 'Read More: %s', 'sample-plugin' ), get_the_title( $block_post ) ) );
			?>
		</a></p>
	<?php endforeach; ?>
</div>
