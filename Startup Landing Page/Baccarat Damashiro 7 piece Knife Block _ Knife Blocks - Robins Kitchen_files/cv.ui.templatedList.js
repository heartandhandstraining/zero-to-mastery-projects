// TODO: autobind template
/*
* Name: templated list
* Author: Aidan Thomas 
* Date Created: 2013/01/04
* Description: databound list with template
*
* Dependencies:    
*          --- Third Party ---
*          jquery.js (built with jquery-1.7.1.min.js)
*          kendo.web.js (kendo.web.min.js v2012.2.710)
*
*          --- CSS ---
*          /Scripts/cv.widget.kendo.js
*          /Scripts/cv.data.kendo.js
*          /Scripts/cv.ajax.js    
* Parameters:
*          viewTemplate: 
*			types: 
*			templates:
*			dataSource: 
*			autobind: 
*			defaultType: 
*			currentType: 
*			replaceContainer: 
*/
;
(function ($, undefined) {

    var TEMPLATECHANGED = 'templatechanged';

    var templatedListWidget = {


        // Standard Variables

        // widget name
        name: "templatedList",

        // default widget options
        options: {
            // view Template
            viewTemplate: null,
            // standard view options
            types: "List,Grid,DetailList",
            templateClasses: 'list-template,grid-template,detailed-list-template',
            autobind: false,
            autoScrollToTop: false,
            scrollSpeed: "fast",
            scrollTarget: "html,body",
            saveUsersSelection: false,
            userSelectionField: "",
            userDetailsJsonFieldGroup: "",
            defaultType: 'List',
            currentType: '',
            replaceContainer: '',
            scrollContainer: ''
        },

        // private property
        _viewAppended: false,

        events: [TEMPLATECHANGED],

        // Standard Methods
        initialise: function (el, o) {
            var self = this;
            var view = null;
            // check for an internal view
            var internalView = $(el).children(":first");
            if (internalView.data("view")) {
                view = internalView.html();
            }
            if (!view) {
                if (!self.options.viewTemplate) {
                    self.options.viewTemplate = self._getDefaultViewTemplate();
                }
                var viewTemplate = kendo.template(self.options.viewTemplate);
                view = viewTemplate(self.options);
                $(el).append(view);
                self._viewAppended = true;
            }
            // now MMVM bind
            self.viewModel = self._getViewModel();
            var target = $(el).children(":first");
            kendo.bind(target, self.viewModel);
            if (self.options.autobind)
                self.viewModel.setCurrentType();
            self.viewModel.set("isInitialLoad", false);
            $.cv.css.bind($.cv.css.eventnames.templatedListChanged, $.proxy(self.viewModel.templatedListChanged, self.viewModel));
        },

        destroy: function () {
            var widget = this;
            // remove the data element
            widget.element.removeData(widget.name);
            // clean up the DOM
            if (widget._viewAppended) {
                widget.element.empty();
            }
        },

        // private function
        _getViewModel: function () {
            var widget = this;

            var initCurrentType = function () {
                return currentType;
            }

            var viewModel = $.extend(kendo.observable(widget.options), {
                // Properties for UI elements
                defaultType: widget.options.defaultType,

                currentType: '',

                isInitialLoad: true,

                typeSelected: function () {
                    var type = $.inArray(this.get("currentType"), this.typesDataSource());
                    if (type > -1) {
                        this.swapType(type);
                    }
                },

                setCurrentType: function () {
                    var currentType = widget.options.currentType != '' ? widget.options.currentType : widget.options.defaultType;
                    this.set("currentType", currentType);
                },

                types: widget.options.types,

                typesDataSource: function () {
                    var vs = this.get("types");
                    return vs.split(",");
                },

                templateClasses: widget.options.templateClasses,

                templateClassesDataSource: function () {
                    var ts = this.get("templateClasses");
                    return ts.split(",");
                },

                isType1Active: function () {
                    return (this.typesDataSource().length > 0 && this.get("currentType") == this.typesDataSource()[0])
                },

                isType2Active: function () {
                    return (this.typesDataSource().length > 1 && this.get("currentType") == this.typesDataSource()[1])
                },

                isType3Active: function () {
                    return (this.typesDataSource().length > 2 && this.get("currentType") == this.typesDataSource()[2])
                },

                showType1: function () {
                    if (this.templateClassesDataSource().length > 0 && this.typesDataSource().length > 0)
                        this.set("currentType", this.typesDataSource()[0]);
                },

                showType2: function () {
                    if (this.templateClassesDataSource().length > 1 && this.typesDataSource().length > 1)
                        this.set("currentType", this.typesDataSource()[1]);
                },

                showType3: function () {
                    if (this.templateClassesDataSource().length > 2 && this.typesDataSource().length > 2)
                        this.set("currentType", this.typesDataSource()[2]);
                },

                swapType: function (typeNum) {
                    if (widget.options.replaceContainer != '') {
                        $.each(this.templateClassesDataSource(), function (idx, item) {
                            $(widget.options.replaceContainer).removeClass(item);
                        });
                        $(widget.options.replaceContainer).addClass(this.templateClassesDataSource()[typeNum]);
                        widget.trigger(TEMPLATECHANGED, { currentType: this.get("currentType") });
                        $.cv.css.trigger($.cv.css.eventnames.templatedListChanged, this.get("currentType"));
                        if (!this.get("isInitialLoad")) {
                            this.saveUserSelection();
                            this.scrollPage();
                        }
                    }
                },

                templatedListChanged: function (currentType) {
                    if (this.get("currentType") != currentType) {
                        this.set("isInitialLoad", true);
                        this.set("currentType", currentType);
                        this.set("isInitialLoad", false);
                    }
                },

                scrollPage: function () {
                    var scrollContainer = widget.options.scrollContainer.length > 0 ? widget.options.scrollContainer : widget.options.replaceContainer;
                    if (widget.options.autoScrollToTop && scrollContainer != "") {
                        $(widget.options.scrollTarget).animate({ scrollTop: $(scrollContainer).offset().top }, widget.options.scrollSpeed);
                    }
                },

                saveUserSelection: function () {
                    if (widget.options.saveUsersSelection && widget.options.userSelectionField != "" && widget.options.userDetailsJsonFieldGroup != "" && $.cv && $.cv.css && $.cv.css.user) {
                        var _this = this, haveCurrentUser = this.getCurrentUser();
                        haveCurrentUser.done(function (user) {
                            if (user && user.data && user.data.length > 0) {
                                var userUpdateData = { _objectKey: user.data[0]._objectKey };
                                userUpdateData[widget.options.userSelectionField] = _this.get("currentType");
                                $.cv.css.user.setCurrentUserDetails({ updateData: userUpdateData, jsonFieldGroup: widget.options.userDetailsJsonFieldGroup });
                            }
                        });
                    }
                },

                getCurrentUser: function () {
                    var haveCurrentUser = $.Deferred(), currentUser = $.cv.css.localGetUser();
                    if (currentUser == null) {
                        haveCurrentUser = $.cv.css.getCurrentUser();
                    } else {
                        haveCurrentUser.resolve({ data: [currentUser] });
                    }
                    return haveCurrentUser;
                }

            });

            viewModel.bind("change", function (e) {
                if (e.field == "currentType") {
                    viewModel.typeSelected();
                }
            });

            return viewModel;
        },

        _getDefaultViewTemplate: function () {
            var self = this;
            var html = "";

            return html;
        }

    }

    // register the widget

    $.cv.ui.widget(templatedListWidget);

})(jQuery);