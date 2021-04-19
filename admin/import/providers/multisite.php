<?php

class Brizy_Admin_Import_Providers_Multisite {

	private $demo;
	private $key;

	public function __construct( $demo, $key ) {
		$this->demo = $demo;
		$this->key  = $key;
	}

	public function getDemoUrl() {
		return $this->getMainUrl() . '/' . $this->demo . '?' . http_build_query( [ 'key' => $this->key ] );
	}

	private function getMainUrl() {
		return apply_filters( 'brizy_importer_get_main_url', 'http://test.themefuse.com/viorelimport' );
	}
}
