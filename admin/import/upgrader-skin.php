<?php

if ( ! class_exists( 'WP_Upgrader_Skin' ) ) {
	require ABSPATH . 'wp-admin/includes/class-wp-upgrader-skin.php';
}

class Brizy_Admin_Import_UpgraderSkin extends WP_Upgrader_Skin {

	public function feedback( $string, ...$args )
	{
		// just keep it quiet
	}
}