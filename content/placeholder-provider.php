<?php

use BrizyPlaceholders\PlaceholderInterface;
use BrizyPlaceholders\RegistryInterface;

class Brizy_Content_PlaceholderProvider
{

    /**
     * @var array of implements Brizy_Editor_Content_PlaceholdersProviderInterface
     */
    private $providers = array();

    /**
     * @var array
     */
    static private $cache_grouped_placeholders = null;
    static private $cache_all_placeholders = null;

    /**
     * BrizyPro_Content_ProviderPlaceholders constructor.
     *
     * $context: for back compatibility
     *
     * @param Brizy_Content_Context $context
     */
    public function __construct($context = null)
    {
        $this->providers[] = new Brizy_Content_Providers_FreeProvider();
        $this->providers = apply_filters('brizy_providers', $this->providers, null);
    }

    /**
     * @return array
     */
    public function getGroupedPlaceholders()
    {

        if (self::$cache_grouped_placeholders) {
            return self::$cache_grouped_placeholders;
        }

        $result = array();

        foreach ($this->providers as $provider) {

            foreach ($provider->getPlaceholders() as $placeholder) {

                if($placeholder->getGroup())
                {
                    $result[ $placeholder->getGroup() ][]  = $placeholder;
                }
            }
        }

        return apply_filters('brizy_placeholders', self::$cache_grouped_placeholders = $result);
    }

    /**
     * @return array
     */
    public function getAllPlaceholders()
    {
        $out = array();

        if (self::$cache_all_placeholders) {
            return self::$cache_all_placeholders;
        }

        foreach ($this->providers as $provider) {
            $out = array_merge($out, $provider->getPlaceholders());
        }

        self::$cache_all_placeholders = $out;

        return $out;
    }

    public function getGroupedPlaceholdersForApiResponse()
    {
        $groups = $this->getGroupedPlaceholders();
        $result = [];
        foreach ($groups as $group => $entries) {

            $result[$group] = array_map(function ($entry) {
                return [
                    'placeholder'=>'{{'.$entry->getPlaceholder().'}}',
                    'label'=>$entry->getLabel(),
                    'display'=>$entry->getDisplay()
                ];
            }, $entries);
        }

        return $result;
    }

    /**
     * @param $name
     * @return \BrizyPlaceholders\PlaceholderInterface
     */
    public function getPlaceholder($name)
    {
        return $this->getPlaceholderSupportingName($name);
    }

    /**
     * @inheritDoc
     */
    public function getPlaceholdersByGroup($groupName)
    {
        $getGroupedPlaceholders = $this->getGroupedPlaceholders();

        if (isset($getGroupedPlaceholders[$groupName])) {
            return $getGroupedPlaceholders[$groupName];
        }
    }

    /**
     * @inheritDoc
     */
    public function getPlaceholderSupportingName($name)
    {
        foreach ($this->providers as $provider) {
            if($instance = $provider->getPlaceholderSupportingName($name)) {
                return $instance;
            }
        }
    }

    public function registerPlaceholder(PlaceholderInterface $instance, $label, $placeholderName, $groupName)
    {
        throw new Exception('Try to use a specific registry to register the placeholder');
    }
}
