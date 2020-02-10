var h = hyperapp.h;

var RULE_TYPE_INCLUDE = "1";
var RULE_TYPE_EXCLUDE = "2";

var RULE_POSTS = "1";
var RULE_TAXONOMY = "2";
var RULE_ARCHIVE = "4";
var RULE_TEMPLATE = "8";
var RULE_BRIZY_TEMPLATE = "16";

var defaultRule = {
    type: RULE_TYPE_INCLUDE,
    appliedFor: "1",
    entityType: "post",
    entityValues: []
};

var state = {
    templateType: Brizy_Admin_Rules.templateType,
    rule: defaultRule,
    singleRules: Brizy_Admin_Rules.templateType === 'single' ? Brizy_Admin_Rules.rules : [],
    archiveRules: Brizy_Admin_Rules.templateType === 'archive' ? Brizy_Admin_Rules.rules : [],
    errors: "",
    groups: [],
};


var apiCache = {
    groupList: null,
    postGroupListPromise: [],
    postList: [],
    termList: []
};

var api = {
    getGroupList: function () {

        if (apiCache.groupList)
            return apiCache.groupList;

        return apiCache.groupList = jQuery.getJSON(Brizy_Admin_Rules.url, {
            action: "brizy_rule_group_list",
            hash: Brizy_Admin_Rules.hash,
            version: Brizy_Admin_Data.editorVersion,
            context: 'template-rules'
        })
    },

    getPostsGroupList: function (postType) {

        if (apiCache.postGroupListPromise[postType])
            return apiCache.postGroupListPromise[postType];

        return apiCache.postGroupListPromise[postType] = jQuery.getJSON(Brizy_Admin_Rules.url, {
            action: "brizy_rule_posts_group_list",
            postType: postType,
            hash: Brizy_Admin_Rules.hash,
            version: Brizy_Admin_Data.editorVersion,
            context: 'template-rules'
        })
    },


    getTerms: function (taxonomy) {
        if (apiCache.termList[taxonomy])
            return apiCache.termList[taxonomy];

        return jQuery.getJSON(Brizy_Admin_Rules.url, {
            action: "brizy_get_terms",
            hash: Brizy_Admin_Rules.hash,
            version: Brizy_Admin_Data.editorVersion,
            taxonomy: taxonomy
        }).done(function (data) {
            apiCache.termList[taxonomy] = jQuery.Deferred().resolve(data);
        });
    },

    validateRule: function (rule) {

        var url = new URL(Brizy_Admin_Rules.url);
        url.searchParams.append('action', 'brizy_validate_rule');
        url.searchParams.append('hash', Brizy_Admin_Rules.hash);
        url.searchParams.append('post', Brizy_Admin_Rules.id);
        url.searchParams.append('version', Brizy_Admin_Data.editorVersion);

        return jQuery.ajax({
            type: "POST",
            url: url.toString(),
            data: JSON.stringify(rule),
            contentType: "application/json; charset=utf-8"
        })
    },

};

var actions = {
    getState: function (value) {
        return function (state) {
            return state;
        };
    },

    updateGroups: function (value) {
        return function (state) {
            return {groups: value.data};
        };
    },

    rule: {
        setType: function (value) {
            return function (state) {
                return {type: value};
            };
        },
        setAppliedFor: function (value) {
            return function (state) {
                return {appliedFor: value};
            };
        },
        setEntityType: function (value) {
            return function (state) {
                return {entityType: value};
            };
        },
        setEntityValues: function (value) {
            return function (state) {
                return {entityValues: value};
            };
        }
    },

    resetRule: function () {
        return function (state) {
            return {errors: "", rule: defaultRule};
        };
    },
    addFormErrors: function (errors) {
        return function (state) {
            return {errors: errors};
        };
    },
    setRuleList: function (rules) {
        return function (state) {
            return {rules: rules};
        };
    },
    addSingleRule: function (rule) {
        return function (state) {
            return {singleRules: [...state.singleRules, rule
        ]
        }
            ;
        };
    },
    addArchiveRule: function (rule) {
        return function (state) {
            return {archiveRules: [...state.archiveRules, rule
        ]
        }
            ;
        };
    },
    removeSingleRule: function (rule) {
        return function (state) {
            return {
                singleRules: state.singleRules.filter(arule => arule != rule)
            }
                ;
        };
    },
    removeArchiveRule: function (rule) {
        return function (state) {
            return {
                archiveRules: state.archiveRules.filter(arule => arule != rule)
            }
                ;
        };
    },
    setTemplateType: function (type) {
        return function (state) {
            return {templateType: type, rules: []};
        };
    }
};

var RuleTypeField = function (params) {
    return function (state, action) {
        return h(
            "span",
            {class: "brizy-rule-select"},
            h(
                "select",
                {
                    name: params.name,
                    onchange: function (e) {
                        action.rule.setType(e.target.value);
                    }
                },
                [
                    h(
                        "option",
                        {
                            value: RULE_TYPE_INCLUDE,
                            selected: params.value === RULE_TYPE_INCLUDE
                        },
                        "Include"
                    ),
                    h(
                        "option",
                        {
                            value: RULE_TYPE_EXCLUDE,
                            selected: params.value === RULE_TYPE_EXCLUDE
                        },
                        "Exclude"
                    )
                ]
            )
        );
    };
};

var BrzSelect2 = function (params) {

    var oncreate = function (element) {

        var el = jQuery(element);
        el.on("change", params.onChange);
        el.select2();

        if (typeof params.optionRequest === 'function') {
            const optionRequest = params.optionRequest();

            if (typeof params.optionRequest === 'function') {
                optionRequest.done(function (response) {
                    var options = params.convertResponseToOptions(response);
                    options.forEach(function (option) {
                        el.append(option);
                    });
                    el.trigger("change");
                });
            } else {
                var options = params.convertResponseToOptions(optionRequest);
                options.forEach(function (option) {
                    el.append(option);
                });

                el.trigger("change");
            }
        }


    };

    var onremove = function (element, done) {
        jQuery(element).select2("destroy");
        done();
    };

    return h(
        "select",
        {
            key: params.id + '|' + params.value,
            akey: params.id + '|' + params.value,
            style: params.style,
            oncreate: oncreate,
            onremove: onremove,
            onchange: params.onChange,
            name: params.name,
        },
        []
    );
};


var RuleTaxonomySearchField = function (params) {
    var convertResponseToOptions = function (response) {
        var options = [new Option("All", null, false, false)];
        response.data.forEach(function (term) {
            var selected = params.rule.entityValues && (params.rule.entityValues.includes(term.term_id + "") || params.rule.entityValues.includes(term.term_id));
            options.push(new Option(term.name, term.term_id, false, selected));
        });
        return options;
    };

    return h(
        BrzSelect2,
        {
            id: "taxonomies-" + params.taxonomy,
            style: params.style ? params.style : {width: "200px"},
            optionRequest: function () {
                return api.getTerms(params.taxonomy);
            },
            convertResponseToOptions: convertResponseToOptions,
            onChange: params.onChange,
            value: params.value
        },
        []
    );
};

var RulePostsGroupSelectField = function (params) {

    var appliedFor = params.rule.appliedFor;
    var entityType = params.rule.entityType;
    var value = String(params.rule.entityValues[0] ? params.rule.entityValues[0] : '');

    var convertResponseToOptions = function (response) {
        var groups = [];
        groups.push(new Option("All", '', false, value === ''));
        response.data.forEach(function (group) {

            if (group.title === "") {
                group.items.forEach(function (option) {
                    var optionValue = String(option.value);
                    groups.push(new Option(option.title, optionValue, false, params.rule.entityValues.includes(optionValue)));
                });
            } else {
                var groupElement = document.createElement("OPTGROUP");
                groupElement.label = group.title;

                if (group.items.length > 0) {
                    group.items.forEach(function (option) {
                        var optionValue = String(option.value);
                        groupElement.appendChild(new Option(option.title, optionValue, false, params.rule.entityValues.includes(optionValue)))
                    });
                    groups.push(groupElement);
                }
            }
        });

        return groups;
    };

    return h(
        BrzSelect2,
        {
            id: "post-groups-" + entityType,
            style: params.style ? params.style : {width: "200px"},
            name: params.name,
            optionRequest: function () {
                return api.getPostsGroupList(entityType);
            },
            convertResponseToOptions: convertResponseToOptions,
            onChange: params.onChange,
        },
        []
    );
};

var RuleApplyGroupField = function (params) {
    return function (state, actions) {
        var appliedFor = params.rule.appliedFor;
        var entityType = params.rule.entityType;
        var value = appliedFor + "|" + entityType;
        var groups = [];

        params.groups.forEach(function (group) {
            var options = [];
            group.items.forEach(function (option) {
                var optionValue = option.groupValue + "|" + option.value;
                var attributes = {
                    value: optionValue,
                    selected: optionValue === value
                };
                options.push(h("option", attributes, option.title));
            });
            const attributes = {label: group.title};

            if (group.value + "|" === "|") {
                groups.push(h("option", {value: "|"}, group.title));
            } else {
                groups.push(h("optgroup", attributes, options));
            }
        });

        const attributes = {
            name: params.type ? 'brizy-' + params.type + '-rule-group[]' : '',
            class: "brizy-rule-select--options[]",
            onchange: function (e) {
                var values = e.target.value.split("|");
                actions.rule.setAppliedFor(values[0]);
                actions.rule.setEntityType(values[1]);
            }
        };

        var elements = [
            h("span", {class: "brizy-rule-select"}, h("select", attributes, groups))
        ];


        switch (appliedFor) {
            case RULE_POSTS:
                elements.push(
                    h("span", {class: "brizy-rule-select brizy-rule-select2"}, [
                        h(RulePostsGroupSelectField, {
                            id: appliedFor + value,
                            rule: params.rule,
                            type: params.type,
                            name: params.type ? 'brizy-' + params.type + '-rule-entity-values[]' : '',
                            onChange: function (e) {
                                var values = e.target.value.split("|");
                                if (values.length === 1) {
                                    actions.rule.setEntityValues(values);
                                } else {
                                    actions.rule.setEntityValues([e.target.value]);
                                }
                            }
                        })
                    ]));
                break;
            case RULE_TAXONOMY:
                elements.push(
                    h("span", {class: "brizy-rule-select brizy-rule-select2"}, [
                        h(RuleTaxonomySearchField, {
                            id: appliedFor + value,
                            rule: params.rule,
                            type: params.type,
                            taxonomy: entityType,
                            name: params.type ? 'brizy-' + params.type + '-rule-entity-values[]' : '',
                            onChange: function (e) {
                                actions.rule.setEntityValues(
                                    e.target.value && e.target.value != "null"
                                        ? [e.target.value]
                                        : []
                                );
                            }
                        })
                    ]));
                break;
        }
        return h("span", {}, elements);
    };
};

var RuleForm = function (params) {
    var elements = [
        h("h4", {}, "Add New Condition"),
        h(RuleTypeField, {value: String(params.rule.type)}),
        h(RuleApplyGroupField, {rule: params.rule, groups: params.groups}),
        h("input", {
            type: "button",
            class: "button",
            onclick: params.onSubmit,
            value: "Add"
        })
    ];

    if (params.errors) {
        elements.push(h("p", {class: "error"}, params.errors));
    }

    return h("div", {class: "brizy-rule-new-condition"}, elements);
};

var RuleListItem = function (params) {
    return h("div", {class: "rule", key: params.index}, [
        h("span", {class: 'rule-fields'}, [
            h(RuleTypeField, {value: String(params.rule.type), name: 'brizy-' + params.type + '-rule-type[]'}),
            h(RuleApplyGroupField, {
                rule: params.rule,
                groups: params.groups,
                type: params.type
            }),
            h('div', {class: 'overlay'}, [])
        ]),
        h("input", {
            class: "brizy-delete-rule ",
            type: "button",
            value: "Delete",
            onclick: function (e) {
                if (confirm('Are you sure you want to delete?'))
                    params.onDelete(params.rule);
            }
        })
    ]);
};

var RuleList = function (params) {
    var elements = [];
    if (params.rules.length) {
        elements.push(h("h4", {}, "Where do You Want to Display it"));
    }
    params.rules.forEach(function (rule, index) {
        elements.push(
            h(RuleListItem, {
                index: index,
                rule: rule,
                groups: params.groups,
                onDelete: params.onDelete,
                type: params.type
            })
        );
    });

    return h("div", {}, elements);
};


var TemplateTypeSelect = function (params) {
    return h(
        "fieldset", {class:'brizy-template-type'}, [
            h('h4',{},'Template Type'),
            h('label', {  }, [
                h('input', {
                    type: 'radio',
                    name: 'brizy-template-type',
                    onchange: params.onChange,
                    value: 'single',
                    checked: 'single' === params.value
                }),
                h('span', {class: "date-time-text format-i18n"}, Brizy_Admin_Rules.labels.single),
            ]),
            h('label', {}, [
                h('input', {
                    type: 'radio',
                    name: 'brizy-template-type',
                    onchange: params.onChange,
                    value: 'archive',
                    checked: 'archive' === params.value
                }),
                h('span', {class: "date-time-text format-i18n"}, Brizy_Admin_Rules.labels.archive),
            ]),
        ]
    );
};

var ruleView = function (state, actions) {
    return h(
        "div",
        {
            oncreate: function () {
                api.getGroupList().done(actions.updateGroups);
            }
        },
        [
            h(
                TemplateTypeSelect, {
                    value: state.templateType,
                    onChange: function (e) {
                        actions.setTemplateType(e.target.value && e.target.value != "null"
                            ? e.target.value
                            : null);
                    }
                }, []
            ),
            h(RuleList, {
                type: state.templateType,
                rules: state.templateType === 'single' ? state.singleRules : state.archiveRules,
                groups: state.groups,
                onDelete: function (rule) {
                    if (state.templateType === 'single') {
                        actions.removeSingleRule(rule);
                    } else if (state.templateType === 'archive') {
                        actions.removeArchiveRule(rule);
                    }
                }
            }),
            state.templateType ? [
                    h(RuleForm, {
                        rule: state.rule,
                        onChange: actions.ruleChange,
                        groups: state.groups,
                        errors: state.errors,
                        onSubmit: function () {
                            api
                                .validateRule(state.rule)
                                .done(function () {
                                    if (state.templateType === 'single') {
                                        actions.addSingleRule(state.rule);
                                        actions.resetRule();
                                    } else if (state.templateType === 'archive') {
                                        actions.addArchiveRule(state.rule);
                                        actions.resetRule();
                                    }
                                })
                                .fail(function (response) {
                                    if (response.responseJSON && response.responseJSON.data) {
                                        if (response.responseJSON.data.message)
                                            actions.addFormErrors(response.responseJSON.data.message);
                                        else
                                            actions.addFormErrors("Failed to add the rule");
                                    }
                                });
                        }
                    })] :
                []
        ]
    );
};

jQuery(document).ready(function ($) {
    hyperapp.app(state, actions, ruleView, document.getElementById("rules"));
});
