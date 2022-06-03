<?php
/**
 * Compatibility with LiteSpeed plugin: https://wordpress.org/plugins/sg-cachepress/
 */
class Brizy_Compatibilities_SgOptimizer {

	public function __construct() {

		if ( ! Brizy_Public_Main::is_editing() && ! isset( $_GET[ Brizy_Editor::prefix('_post') ] ) ) {
			return;
		}

		add_filter( 'option_siteground_optimizer_optimize_html', '__return_false' );
		add_filter( 'option_siteground_optimizer_optimize_javascript', '__return_false' );
		add_filter( 'option_siteground_optimizer_optimize_css', '__return_false' );
		add_filter( 'option_siteground_optimizer_optimize_javascript_async', '__return_false' );
		add_filter( 'option_siteground_optimizer_lazyload_images', '__return_false' );
		add_filter( 'option_siteground_optimizer_combine_css', '__return_false' );
	}
}