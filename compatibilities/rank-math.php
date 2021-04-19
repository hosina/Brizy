<?php

class Brizy_Compatibilities_RankMath {

	public function __construct() {
		add_filter( 'rank_math/sitemap/content_before_parse_html_images', [ $this, 'parse_html_images' ], 10, 2 );
	}

	public function parse_html_images( $content, $post_id ) {

		if ( ! Brizy_Editor_Entity::isBrizyEnabled( $post_id ) ) {
			return $content;
		}

		$editor = Brizy_Editor_Post::get( $post_id );
		$content = apply_filters( 'brizy_content', $content, Brizy_Editor_Project::get(), $editor->getWpPost() );

		return $content;
	}
}