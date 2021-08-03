<?php

use BrizyMerge\AssetAggregator;
use BrizyMerge\Assets\Asset;
use BrizyMerge\Assets\AssetGroup;

class Brizy_Public_AssetEnqueueManager
{
    /**
     * @var Brizy_Editor_Entity
     */
    private $post;

    /**
     * @var array
     */
    private $postStylesAssetCache = [];

    /**
     * @var array
     */
    private $postScriptAssetCache = [];

    private $enqueuedAssets = [];

    public function __construct(Brizy_Editor_Entity $post)
    {
        $this->post = $post;
        $this->postStylesAssetCache = [];
        $this->postScriptAssetCache = [];
        $this->enqueuedAssets = [];
    }

    public function registerActions()
    {
        add_action('wp_enqueue_scripts', array($this, 'enqueueStyles'));
        add_action('wp_enqueue_scripts', array($this, 'enqueueScripts'));
        add_filter('script_loader_tag', array($this, 'addAssetAttributes'), 10, 2);
    }

    public function enqueueStyles()
    {
        // get all assets needed for this page
        $project = Brizy_Editor_Project::get();
        $styles = $this->post->getCompiledStyles();
        $assetGroups = [];
        if (isset($styles['free']) && !empty($styles['free'])) {
            $assetGroups[] = AssetGroup::instanceFromJsonData($styles['free']);
        }
        $assetGroups = apply_filters('brizy_pro_head_assets', $assetGroups, $this->post);

        // add popups and popup assets
        $popupMain = Brizy_Admin_Popups_Main::_init();

        $assetGroups = array_merge($assetGroups, $popupMain->getPopupsAssets($project, $this->post, 'head'));
        $assetAggregator = new AssetAggregator($assetGroups);

        // include content
        $this->postStylesAssetCache[$this->post->getWpPostId()] = $assets = $assetAggregator->getAssetList();

        foreach ($assets as $asset) {
            if ($asset->getType() == Asset::TYPE_INLINE || $asset->getType() == Asset::TYPE_FILE) {
                $this->enqueueStyleAsset($asset);
            }
        }
    }

    public function enqueueScripts()
    {
        // get all assets needed for this page
        $project = Brizy_Editor_Project::get();
        $scripts = $this->post->getCompiledScripts();
        $assetGroups = [];
        if (isset($scripts['free']) && !empty($scripts['free'])) {
            $assetGroups[] = AssetGroup::instanceFromJsonData($scripts['free']);
        }
        $assetGroups = apply_filters('brizy_pro_body_assets', $assetGroups, $this->post);

        // add popups and popup assets
        $popupMain = Brizy_Admin_Popups_Main::_init();

        $assetGroups = array_merge($assetGroups, $popupMain->getPopupsAssets($project, $this->post, 'body'));
        $assetAggregator = new AssetAggregator($assetGroups);

        // include content
        $this->postScriptAssetCache[$this->post->getWpPostId()] = $assets = $assetAggregator->getAssetList();

        foreach ($assets as $asset) {
            if ($asset->getType() == Asset::TYPE_INLINE || $asset->getType() == Asset::TYPE_FILE) {
                $this->enqueueScriptAsset($asset);
            }
        }
    }

    public function getCodeStylesAsString()
    {
        $assets = $this->postStylesAssetCache[$this->post->getWpPostId()];
        return $this->getCodeAssetsAsString($assets);
    }

    public function getCodeScriptsAsString()
    {
        $assets = $this->postScriptAssetCache[$this->post->getWpPostId()];
        return $this->getCodeAssetsAsString($assets);
    }

    public function addAssetAttributes($tag, $ahandle)
    {
        if (isset($this->enqueuedAssets[$ahandle])) {
            $attributes = $this->getAttributes($asset = $this->enqueuedAssets[$ahandle]);
            $tag = str_replace('src=', $attributes . ' src=', $tag);
        }

        return $tag;
    }

    private function getCodeAssetsAsString($assets)
    {
        $content = '';
        foreach ($assets as $script) {
            if ($script->getType() == Asset::TYPE_CODE) {
                $content .= $script->getContent() . "\n";
            }
        }

        return $content;
    }

    private function enqueueStyleAsset(Asset $asset)
    {
        $handle = $this->getHandle($asset);
        switch ($asset->getType()) {
            case Asset::TYPE_INLINE:
                wp_register_style($handle, false);
                wp_enqueue_style($handle);
                wp_add_inline_style($handle, $asset->getContent(), []);
                $this->enqueuedAssets[$handle] = $asset;
                break;
            case Asset::TYPE_FILE:
                wp_enqueue_style($handle, Brizy_SiteUrlReplacer::restoreSiteUrl($asset->getUrl()), []);
                $this->enqueuedAssets[$handle] = $asset;
                break;
        }
    }

    private function enqueueScriptAsset(Asset $asset)
    {
        $handle = $this->getHandle($asset);
        switch ($asset->getType()) {
            case Asset::TYPE_INLINE:
                wp_register_script($handle, false, [], false, true);
                wp_enqueue_script($handle, false, [], false, true);
                wp_add_inline_script($handle, $asset->getContent(), []);
                $this->enqueuedAssets[$handle] = $asset;

                break;
            case Asset::TYPE_FILE:
                wp_enqueue_script($handle, Brizy_SiteUrlReplacer::restoreSiteUrl($asset->getUrl()), [], false, true);
                $this->enqueuedAssets[$handle] = $asset;

                break;
        }
    }

    private function getAttributes($asset)
    {
        $attrs = $asset->getAttrs();
        $attributes = array_reduce(array_keys($attrs), function ($attrString, $key) use ($attrs) {
            return $attrString . " {$key}=\"{$attrs[$key]}\"";
        }, '');
        return $attributes;

    }

    /**
     * @param Asset $asset
     * @return string
     */
    private function getHandle(Asset $asset)
    {
        $handle = Brizy_Editor::prefix() . '-asset-' . $asset->getName() . '-' . $asset->getScore();
        return $handle;
    }
}