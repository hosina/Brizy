<?php

class Brizy_Admin_Import_Main {

	public $errors = [];
	private $demo  = '';
	private $key   = '';

	public function __construct( $demo, $key ) {
		$this->demo = $demo;
		$this->key  = $key;
	}

	public function import() {

		$provider  = new Brizy_Admin_Import_Providers_Multisite( $this->demo, $this->key );
		$extractor = new Brizy_Admin_Import_Extractors_Xml( $provider->getDemoUrl() );

		try {
			$filePath = $extractor->getFilePath();
			$data     = $this->parse( $filePath );

			if ( ! empty( $data['plugins'] ) ) {
				$plugins = new Brizy_Admin_Import_Plugins( $data['plugins'] );
				$plugins->install();
			}

			$importer = new Brizy_Admin_Import_Importers_Importer( $data );
			$importer->import();

		} catch ( DomainException $e ) {
			$extractor->cleanup();

			throw new DomainException( $e->getMessage() );
		}

		$extractor->cleanup();
	}

	/**
	 * Parse a WXR file
	 *
	 * @param string $file Path to WXR file for parsing
	 * @return array Information gathered from the WXR file
	 */
	private function parse( $file ) {

		// Attempt to use proper XML parsers first
		if ( extension_loaded( 'simplexml' ) ) {
			$parser = new Brizy_Admin_Import_Parsers_Simplexml();
			$result = $parser->parse( $file );

			// If SimpleXML succeeds or this is an invalid WXR file then return the results
			if ( ! is_wp_error( $result ) || 'SimpleXML_parse_error' != $result->get_error_code() ) {
				return $result;
			}

		} else if ( extension_loaded( 'xml' ) ) {
			$parser = new Brizy_Admin_Import_Parsers_Xml;
			$result = $parser->parse( $file );

			// If XMLParser succeeds or this is an invalid WXR file then return the results
			if ( ! is_wp_error( $result ) ) {
				return $result;
			}
		}

		// We have a malformed XML file, so display the error and fallthrough to regex
		if ( isset( $result ) ) {

			if ( 'SimpleXML_parse_error' == $result->get_error_code() ) {
				foreach ( $result->get_error_data() as $error ) {
					$this->errors[] = $error->line . ':' . $error->column . ' ' . esc_html( $error->message );
				}
			} else if ( 'XML_parse_error' == $result->get_error_code() ) {
				$error          = $result->get_error_data();
				$this->errors[] = $error[0] . ':' . $error[1] . ' ' . esc_html( $error[2] );
			}

			$this->errors[] = __( 'Details are shown above. The importer will now try again with a different parser...', 'brizy' );
		}

		// use regular expressions if nothing else available or this is bad XML
		$parser = new Brizy_Admin_Import_Parsers_Regex;

		$data = $parser->parse( $file );

		if ( is_wp_error( $data ) ) {
			throw new DomainException( $data->get_error_message() );
		}

		return $data;
	}
}
