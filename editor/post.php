<?php if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

class Brizy_Editor_Post extends Brizy_Editor_Entity
{

    use Brizy_Editor_AutoSaveAware;

    const BRIZY_POST = 'brizy-post';
    const BRIZY_POST_NEEDS_COMPILE_KEY = 'brizy-need-compile';
    const BRIZY_POST_SIGNATURE_KEY = 'brizy-post-signature';
    const BRIZY_POST_HASH_KEY = 'brizy-post-hash';
    const BRIZY_POST_EDITOR_VERSION = 'brizy-post-editor-version';
    const BRIZY_POST_COMPILER_VERSION = 'brizy-post-compiler-version';
    const BRIZY_POST_PLUGIN_VERSION = 'brizy-post-plugin-version';
    const BRIZY_TAGS = 'brizy-tags';

    static protected $instance = null;
    static protected $compiled_page = [];

    /**
     * @var string
     */
    protected $compiled_html;

    /**
     * @var array
     */
    protected $compiled_scripts;

    /**
     * @var array
     */
    protected $compiled_styles;

    /**
     * @var string
     */
    protected $compiled_html_body;

    /**
     * @var string
     */
    protected $compiled_html_head;

    /**
     * @var bool
     */
    protected $needs_compile;

    /**
     * Json for the editor.
     *
     * @var string
     */
    protected $editor_data;

    /**
     * @var bool
     */
    protected $uses_editor;

    /**
     * @var string
     */
    protected $editor_version;

    /**
     * @var string
     */
    protected $compiler_version;

    /**
     * @var string
     */
    protected $pro_plugin_version;

    /**
     * @var string
     */
    protected $plugin_version;

    /**
     * @var int
     */
    protected $lastUserEdited;

	/**
	 * @param $postId
	 * @param $uid
	 *
	 * @throws Exception
	 */
    public function __construct($postId, $uid = null)
    {
        if ($uid) {
            $this->uid = $uid;
        }

        parent::__construct($postId);

        // create the uid if the editor is enabled for this post
        if ($this->uses_editor()) {
            $this->createUid();
        }
    }

	/**
	 * @param $apost
	 * @param $uid
	 *
	 * @return Brizy_Editor_Block|Brizy_Editor_Post|mixed|self
	 * @throws Exception
	 */
    public static function get($apost, $uid = null)
    {

        $wp_post_id = $apost;
        if ($apost instanceof WP_Post) {
            $wp_post_id = $apost->ID;
        }

        if (isset(self::$instance[$wp_post_id])) {
            return self::$instance[$wp_post_id];
        }

        return self::$instance[$wp_post_id] = new self($wp_post_id, $uid);
    }

    /**
     * @param $postId
     *
     * @return Brizy_Editor_Block|Brizy_Editor_Post|mixed
     * @throws Exception
     */
    public function duplicateTo($postId)
    {
        $newPost = parent::duplicateTo($postId);

        // copy current data to new post
        $newPost->set_template($this->get_template());

        $storage = $this->getStorage();

        $newStorage = $newPost->getStorage();
        $newStorage->loadStorage($storage->get_storage());
        $newPost->loadInstanceData();
        $newPost->saveStorage();

        return $newPost;

    }


    /**
     * Clear all cached instances;
     */
    public static function cleanClassCache()
    {
        self::$instance = array();
    }

    /**
     * @return string
     */
    public function serialize()
    {
        $get_object_vars = get_object_vars($this);

        unset($get_object_vars['wp_post_id']);
        unset($get_object_vars['wp_post']);
        unset($get_object_vars['api_page']);
        unset($get_object_vars['store_assets']);
        unset($get_object_vars['assets']);

        return serialize($get_object_vars);
    }


    /**
     * @param $data
     */
    public function unserialize($data)
    {
        parent::unserialize($data); // TODO: Change the autogenerated stub
    }

    public function createResponse($fields = array(), $context=Brizy_Editor_Editor_Editor::EDITOR_CONTEXT)
    {

        $p_id = (int)$this->getWpPostId();

        $global = array(
            'title' => $the_title = $this->getTitle(),
            'slug' => sanitize_title($the_title),
            'data' => $this->get_editor_data($context == Brizy_Editor_Editor_Editor::COMPILE_CONTEXT),
            'id' => $p_id,
            'is_index' => false,
            'template' => get_page_template_slug($p_id),
            'status' => get_post_status($p_id),
            'url' => get_the_permalink($p_id),
            'dataVersion' => $this->getCurrentDataVersion(),
            'author' => $this->getWpPost()->post_author,
            'compiler'=>$this->get_compiler()
        );

        return $global;
    }

    public function createConfigData($context)
    {
        $p_id = (int)$this->getWpPostId();

        $data = array(
            '_kind' => "wp",
            'id' => $p_id,
            'data' => $this->get_editor_data( $context == Brizy_Editor_Editor_Editor::COMPILE_CONTEXT ),
            'dataVersion' => $this->getCurrentDataVersion(),
            'title' => $the_title = $this->getTitle(),
            'slug' => sanitize_title($the_title),
            'status' => get_post_status($p_id),
            'is_index' => false,
            'template' => get_page_template_slug($p_id),
            'url' => esc_url(apply_filters('the_permalink', get_permalink($p_id), $this->getWpPost())),
            'compiler'=>$this->get_compiler()
        );

        return $data;
    }


    public function convertToOptionValue()
    {

        return array(
            'compiled_html' => $this->get_encoded_compiled_html(),
            'compiled_scripts' => $this->get_compiled_scripts(),
            'compiled_styles' => $this->get_compiled_styles(),
            'compiled_html_body' => $this->get_compiled_html_body(),
            'compiled_html_head' => $this->get_compiled_html_head(),
            'editor_version' => $this->editor_version,
            'compiler_version' => $this->compiler_version,
            'plugin_version' => $this->plugin_version,
            'pro_plugin_version' => $this->pro_plugin_version,
            'editor_data' => $this->editor_data,
            Brizy_Editor_Constants::USES_BRIZY => $this->uses_editor(),
            'lastUserEdited' => $this->lastUserEdited,
            'compiler'=>$this->get_compiler()
        );
    }


    /**
     *  Mark all brizy post that needs compile
     */
    public static function mark_all_for_compilation()
    {
        global $wpdb;
        $editorVersion = str_replace('-wp', '', BRIZY_MINIMUM_COMPILER_VERSION);

        // set needs compile true only for pages that were edited with an editor that does not support compilation in browser
        $query = $wpdb->prepare(
            'UPDATE wp_postmeta pm
					   JOIN wp_postmeta m ON m.post_id=pm.post_id and m.meta_key="brizy_enabled" and m.meta_value=1
					   LEFT JOIN wp_postmeta mm ON mm.post_id=pm.post_id and mm.meta_key="brizy-post-compiler-version"
					   SET pm.meta_value=1
					   WHERE pm.meta_key="brizy-need-compile" and pm.meta_value=0 and CONVERT(REPLACE(IF(STRCMP(mm.meta_value,"dev") = 0,  0, mm.meta_value), " - wp", "") ,UNSIGNED )<%d'
            ,
            $editorVersion
        );
        $wpdb->query($query);
    }


    public function savePost($createRevision = false)
    {
        $postarr = [
            'ID' => $this->getWpPostId(),
            'post_title' => $this->getTitle(),
            'post_content' => $this->getPostContent($createRevision),
        ];

        $this->deleteOldAutosaves($this->getWpPostId());

        if ($createRevision) {

            $post_type_object = get_post_type_object($this->getWpPost()->post_type);

            if (current_user_can($post_type_object->cap->publish_posts)) {
                $postarr['post_status'] = $this->getWpPost()->post_status;
            }

        } else {
            remove_action('post_updated', 'wp_save_post_revision');
        }

        wp_update_post($postarr);

        $this->createUid();
    }

    private function getPostContent($noFilters)
    {
        $post = $this->getWpPost();
        $emptyContent = '<div class="brz-root__container"></div>';
        $versionTime = '<!-- version:'.time().' -->';

        $excluded = [
            Brizy_Admin_Blocks_Main::CP_GLOBAL,
            Brizy_Admin_Blocks_Main::CP_SAVED,
            Brizy_Admin_Templates::CP_TEMPLATE,
            Brizy_Admin_Popups_Main::CP_POPUP,
        ];

        if (in_array($post->post_type, $excluded)) {
            return $emptyContent.$versionTime;
        }

        if ($noFilters) {
            $content = $this->get_compiled_html();
        } else {
            $context = Brizy_Content_ContextFactory::createContext(Brizy_Editor_Project::get());
            $placeholderProvider = new Brizy_Content_Providers_PlaceholderWpProvider($context);
            $context->setProvider($placeholderProvider);
            $extractor = new \BrizyPlaceholders\Extractor($placeholderProvider);

            list($placeholders, $placeholderInstances, $content) = $extractor->extract(
                $this->get_compiled_html()
            );

            $replacer = new \BrizyPlaceholders\Replacer($placeholderProvider);
            $content = $replacer->replaceWithExtractedData($placeholders, $placeholderInstances, $content, $context);

            $content = $extractor->stripPlaceholders($content);
            $content = apply_filters('brizy_content', $content, Brizy_Editor_Project::get(), $post);
        }

        $content = strpos($content, 'brz-root__container') ? preg_replace(
            '/<!-- version:\d+ -->/',
            '',
            $content
        ) : $emptyContent;

        return $content.$versionTime;
    }

    /**
     * @param int $autosave
     *
     * @return bool|Brizy_Editor_Entity
     */
    public function save($autosave = 0)
    {

        parent::save($autosave);

        if ($autosave == 0) {
            $this->saveStorage();
        } else {
            $this->auto_save_post($this->getWpPost(), function ($autosaveObject) {
                $autosavePost = $this->populateAutoSavedData($autosaveObject);
                $autosavePost->saveStorage();
            });
        }

        return true;
    }

	/**
	 * @deprecated
	 * @return void
	 */
    public function compile_page() {
        try {
                $compiler = new Brizy_Editor_Compiler(
                    Brizy_Editor_Project::get(),
                    new Brizy_Admin_Blocks_Manager(Brizy_Admin_Blocks_Main::CP_GLOBAL),
                    new Brizy_Editor_UrlBuilder(Brizy_Editor_Project::get(), $this),
                    Brizy_Config::getCompilerUrls(),
                    Brizy_Config::getCompilerDownloadUrl()
                );


                if ($compiler->needsCompile($this)) {
                    $editgorConfig = Brizy_Editor_Editor_Editor::get(Brizy_Editor_Project::get(), $this)
                        ->config(Brizy_Editor_Editor_Editor::COMPILE_CONTEXT);
                    $compiler->compilePost($this, $editgorConfig);
                }

            } catch (Exception $e) {
                Brizy_Logger::instance()->exception($e);
            }
    }


    /**
     * @return string
     */
    public function get_compiled_html()
    {
        return $this->compiled_html;
    }

    /**
     * @param string $compiled_html
     *
     * @return Brizy_Editor_Post
     */
    public function set_compiled_html($compiled_html)
    {
        $this->compiled_html = $compiled_html;

        return $this;
    }

    /**
     * @return array
     */
    public function get_compiled_scripts()
    {
        return $this->compiled_scripts;
    }

    /**
     * @param array $compiled_scripts
     *
     * @return Brizy_Editor_Post
     */
    public function set_compiled_scripts($compiled_scripts)
    {
        $this->compiled_scripts = $compiled_scripts;

        return $this;
    }

    /**
     * @return array
     */
    public function get_compiled_styles()
    {
        return $this->compiled_styles;
    }

    /**
     * @param array $compiled_styles
     *
     * @return Brizy_Editor_Post
     */
    public function set_compiled_styles($compiled_styles)
    {
        $this->compiled_styles = $compiled_styles;

        return $this;
    }


    /**
     * @deprcated
     * @return array
     */
    public function getCompiledScripts()
    {
        return $this->get_compiled_scripts();
    }

    /**
     * @deprcated
     *
     * @param array $compiled_scripts
     *
     * @return Brizy_Editor_Post
     */
    public function setCompiledScripts($compiled_scripts)
    {
        $this->set_compiled_scripts($compiled_scripts);

        return $this;
    }

    /**
     * @deprcated
     * @return array
     */
    public function getCompiledStyles()
    {
        return $this->get_compiled_styles();
    }

    /**
     * @deprcated
     *
     * @param array $compiled_styles
     *
     * @return Brizy_Editor_Post
     */
    public function setCompiledStyles($compiled_styles)
    {
        $this->set_compiled_styles($compiled_styles);

        return $this;
    }


    /**
     * @param $compiled_html
     *
     * @return $this
     */
    public function set_encoded_compiled_html($compiled_html)
    {

        if (($decodedData = base64_decode($compiled_html, true)) !== false) {
            $this->set_compiled_html($decodedData);
        } else {
            $this->set_compiled_html($compiled_html);
        }

        return $this;
    }

    /**
     * @return string
     */
    public function get_encoded_compiled_html()
    {

        return base64_encode($this->get_compiled_html());
    }

    /**
     * @return string
     * @deprecated use get_compiled_html
     */
    public function get_compiled_html_body()
    {
        return $this->compiled_html_body;
    }

    /**
     * @return string
     * @deprecated use get_compiled_html
     */
    public function get_compiled_html_head()
    {
        return $this->compiled_html_head;
    }

    /**
     * @param $html
     *
     * @return $this
     * @deprecated use set_compiled_html
     *
     */
    public function set_compiled_html_body($html)
    {
        $this->compiled_html_body = $html;

        return $this;
    }

    /**
     * @param $html
     *
     * @return $this
     * @deprecated use set_compiled_html
     *
     */
    public function set_compiled_html_head($html)
    {
        // remove all title and meta tags.
        $this->compiled_html_head = $html;

        return $this;
    }

    /**
     * @return string
     */
    public function get_editor_data($decode = false)
    {
	    if ( $decode && ( $decodedData = base64_decode( $this->editor_data, true ) ) !== false ) {
		    return $decodedData;
	    }

        return $this->editor_data;
    }

    /**
     * @param $content
     *
     * @return $this
     */
    public function set_editor_data($content)
    {

        if (is_null($content)) {
            $content = '';
        }

        if (base64_decode($content, true) !== false) {
            $this->editor_data = $content;
        } else {
            $this->editor_data = base64_encode($content);
        }

        return $this;
    }

    /**
     * @return $this
     * @throws Brizy_Editor_Exceptions_AccessDenied
     */
    public function enable_editor()
    {

        if (!$this->can_edit_posts()) {
            throw new Brizy_Editor_Exceptions_AccessDenied('Current user cannot edit page');
        }

        $this->set_uses_editor(true);

        return $this;
    }

    /**
     * @return $this
     * @throws Brizy_Editor_Exceptions_AccessDenied
     */
    public function disable_editor()
    {
        if (!$this->can_edit_posts()) {
            throw new Brizy_Editor_Exceptions_AccessDenied('Current user cannot edit page');
        }

        $this->set_uses_editor(false);

        return $this;
    }

    /**
     * @param string $editor_version
     */
    public function set_editor_version($editor_version)
    {
        $this->editor_version = $editor_version;
        update_metadata('post', $this->getWpPostId(), self::BRIZY_POST_EDITOR_VERSION, $editor_version);
    }

    /**
     * @param string $compiler_version
     */
    public function set_compiler_version($compiler_version)
    {
        $this->compiler_version = $compiler_version;
        update_metadata('post', $this->getWpPostId(), self::BRIZY_POST_COMPILER_VERSION, $compiler_version);
    }

    /**
     * @param string $plugin_version
     */
    public function set_plugin_version($plugin_version)
    {
        $this->plugin_version = $plugin_version;
        update_metadata('post', $this->getWpPostId(), self::BRIZY_POST_PLUGIN_VERSION, $plugin_version);
    }


    /**
     * @param $v
     *
     * @return $this
     */
    public function set_needs_compile($v)
    {
        $this->needs_compile = (bool)$v;
        update_metadata('post', $this->getWpPostId(), self::BRIZY_POST_NEEDS_COMPILE_KEY, (bool)$v);

        return $this;
    }

    /**
     * @return bool
     */
    public function get_needs_compile()
    {
        return $this->needs_compile;
    }

    /**
     * @return Brizy_Editor_CompiledHtml
     */
    public function get_compiled_page()
    {
        if (isset(self::$compiled_page[$this->getWpPostId()])) {
            return self::$compiled_page[$this->getWpPostId()];
        }

        return self::$compiled_page[$this->getWpPostId()] = new Brizy_Editor_CompiledHtml($this->get_compiled_html());
    }

    public function isCompiledWithCurrentVersion()
    {
        $proVersion = defined('BRIZY_PRO_VERSION') ? BRIZY_PRO_VERSION : null;

        return $this->get_compiler_version() === BRIZY_EDITOR_VERSION && $this->get_pro_plugin_version() === $proVersion && $this->plugin_version === BRIZY_VERSION;
    }

    public function isEditedWithCurrentVersion()
    {
        $proVersion = defined('BRIZY_PRO_VERSION') ? BRIZY_PRO_VERSION : null;

        return $this->get_editor_version() === BRIZY_EDITOR_VERSION && $this->get_pro_plugin_version() === $proVersion && $this->plugin_version === BRIZY_VERSION;
    }

    /**
     * @return array
     */
    public function get_templates()
    {

        $type = get_post_type($this->getWpPostId());
        $templates = array(
            array(
                'id' => '',
                'title' => __('Default', 'brizy'),
            ),
        );

        foreach (wp_get_theme()->get_page_templates(null, $type) as $key => $title) {
            $templates[] = [
                'id' => $key,
                'title' => $title,
            ];
        }

        return apply_filters("brizy:$type:templates", $templates);
    }

    /**
     * @param string $aTemplate
     *
     * @return $this
     */
    public function set_template($aTemplate)
    {

        $aTemplate = apply_filters('brizy_post_template', $aTemplate);

        if ($aTemplate == '') {
            delete_post_meta($this->getWpPostId(), '_wp_page_template');
        } else {
            update_post_meta($this->getWpPostId(), '_wp_page_template', $aTemplate);
        }

        return $this;
    }

    /**
     * @return mixed
     */
    public function get_template()
    {
        return get_post_meta($this->getWpPostId(), '_wp_page_template', true);
    }


    /**
     * @return string
     */
    public function get_compiler_version()
    {
        return $this->compiler_version;
    }

    /**
     * @return string
     */
    public function get_pro_plugin_version()
    {
        return $this->pro_plugin_version;
    }

    /**
     * @param string $pro_plugin_version
     *
     * @return Brizy_Editor_Post
     */
    public function set_pro_plugin_version($pro_plugin_version)
    {
        $this->pro_plugin_version = $pro_plugin_version;

        return $this;
    }

    /**
     * @return string
     */
    public function get_editor_version()
    {
        return $this->editor_version;
    }

    /**
     * @return string
     * @deprecated Use getEditUrl()
     */
    public function edit_url()
    {
        return self::getEditUrl($this->getWpPostId());
    }

    /**
     * Will return the key on witch the object data will be saved in storage
     *
     * @return mixed
     */
    protected function getObjectKey()
    {
        return self::BRIZY_POST;
    }

    /**
     * Load all object data
     */
    protected function loadInstanceData()
    {
        // get the storage values
        $storage = $this->getStorage();
        //$storageData          = $storage->get_storage();
        $storage_post = $storage->get($this->getObjectKey(), false);

        $this->setTitle(get_the_title($this->getWpPostId()));

        // check for deprecated forms of posts
        if ($storage_post instanceof self) {
            $this->set_editor_data($storage_post->editor_data);
            $this->set_needs_compile(true);
            $this->save();
        } else {
            if (is_array($storage_post)) {

                if (isset($storage_post['compiled_html'])) {
                    $this->set_encoded_compiled_html($storage_post['compiled_html']);
                }
                if (isset($storage_post['compiled_scripts'])) {
                    $this->set_compiled_scripts($storage_post['compiled_scripts']);
                }
                if (isset($storage_post['compiled_styles'])) {
                    $this->set_compiled_styles($storage_post['compiled_styles']);
                }

	            $this->set_editor_data($storage_post['editor_data']);
	            $data_needs_compile = isset($storage_post['needs_compile']) ? $storage_post['needs_compile'] : true;

	            $this->set_needs_compile(
                    metadata_exists('post',$this->getWpPostId(),self::BRIZY_POST_NEEDS_COMPILE_KEY) ?
                        (bool)get_post_meta($this->getWpPostId(),self::BRIZY_POST_NEEDS_COMPILE_KEY,true) : $data_needs_compile
                );

                $this->set_compiler(
                    isset($storage_post['compiler']) ? $storage_post['compiler'] : Brizy_Editor_Entity::COMPILER_EXTERNAL
                );

                $this->set_editor_version(
                    isset($storage_post['editor_version']) ? $storage_post['editor_version'] : BRIZY_EDITOR_VERSION
                );
                $this->set_compiler_version(
                    isset($storage_post['compiler_version']) ? $storage_post['compiler_version'] : BRIZY_EDITOR_VERSION
                );
                $this->set_plugin_version(
                    isset($storage_post['plugin_version']) ? $storage_post['plugin_version'] : null
                );
                $this->set_pro_plugin_version(
                    isset($storage_post['pro_plugin_version']) ? $storage_post['pro_plugin_version'] : null
                );
                $this->compiled_html_head = isset($storage_post['compiled_html_head']) ? $storage_post['compiled_html_head'] : null;
                $this->compiled_html_body = isset($storage_post['compiled_html_body']) ? $storage_post['compiled_html_body'] : null;
                $this->lastUserEdited = isset($storage_post['lastUserEdited']) ? $storage_post['lastUserEdited'] : null;
            }
        }
    }

    /**
     * @param self $autosave
     *
     * @return mixed
     */
    protected function populateAutoSavedData($autosave)
    {
        $autosave->setTitle($this->getTitle());
        $autosave->set_template($this->get_template());
        $autosave->set_editor_data($this->get_editor_data());
        $autosave->set_editor_version($this->get_editor_version());
        $autosave->set_needs_compile(true);
        $autosave->setLastUserEdited(get_current_user_id());

        return $autosave;
    }


    public static function get_post_list($searchTerm, $postType, $excludePostType = array(), $offset = 0, $limit = 20)
    {

        global $wp_post_types, $wpdb;
        $searchQuery = '';
        $postLabel = $wp_post_types[$postType]->label;

        // not sure iw we will have this case :D
        if (is_array($excludePostType) && in_array($postType, $excludePostType)) {
            return [];
        }

        if ($searchTerm) {
            $searchQuery = " AND post_title LIKE %s";
        }

        $postStatus = $postType == 'attachment' ? "'inherit'" : "'publish','pending','draft','future','private'";

        $query = <<<SQL
			SELECT
			       p.ID,
			       p.post_title as title,
			       p.post_title as post_title,
			       p.post_status as post_status,
			       %s as post_type,
			       %s as post_type_label,
			       pm.meta_value as 'uid'
			FROM
			     $wpdb->posts p
				LEFT JOIN $wpdb->postmeta pm ON pm.post_id=p.ID and pm.meta_key='brizy_post_uid'
			WHERE 
				p.post_type='%s' and p.post_status IN ($postStatus) $searchQuery
			GROUP BY p.ID
			ORDER BY p.post_title ASC			
			LIMIT %d,%d
SQL;
        $posts = $wpdb->get_results($wpdb->prepare($query, $postType, $postLabel, $postType, $offset, $limit));

        foreach ($posts as $i => $p) {
            $postTitle = apply_filters('the_title', $p->post_title);
            $p->post_title = $postTitle;
            $p->title = $postTitle;
            $p->uid = self::create_uid($p->ID, $p->uid);
            $p->ID = (int)$p->ID;
        }

        return $posts;
    }

    private static function create_uid($postId, $uid)
    {

        if (!$uid) {
            $uid = md5($postId.time());
            update_post_meta($postId, 'brizy_post_uid', $uid);
        }

        return $uid;
    }

    /**
     * @return WP_Post
     * @deprecated  Use getWpPost();
     *
     */
    public function get_wp_post()
    {
        return $this->getWpPost();
    }

    /**
     * @return int|null
     */
    public function getLastUserEdited()
    {
        return $this->lastUserEdited;
    }

    /**
     * @param int $userId
     */
    public function setLastUserEdited($userId)
    {
        $this->lastUserEdited = $userId;
    }

}

