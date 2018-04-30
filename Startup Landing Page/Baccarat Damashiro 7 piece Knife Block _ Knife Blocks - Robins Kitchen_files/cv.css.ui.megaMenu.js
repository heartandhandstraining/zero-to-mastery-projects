/* Name: mega menu
* Author: Aidan Thomas 
* Created: 20130220
*
* Dependencies:    
*          --- Third Party ---
*          jquery.js 
*          kendo.web.js
*           --- CSS ---
*          /Scripts/cv.widget.kendo.js
*          /Scripts/cv.util.js
* Params:  
*       viewTemplate: kendo template id to show the grid in
*        openTimeout: 
*        closeTimeout: 
*        useTimout: 
*        activeItemClass: 
*        highlightCurrentMenu: 
*        currentMenuClass:
*        parentItems: 
*        showEvent: 
*        closeEvent: 
*        menuitemhover:
*/
;
(function ($, undefined) {

    var MENUITEMHOVER = 'menuitemhover',
        MENUITEMSHOW = "menuItemShow",
        MENUITEMHIDE = "menuItemHide";

    var megaMenuWidget = {


        // Standard Variables

        // widget name
        name: "megaMenu",

        // default widget options
        options: {
            // viewModel defaults
            openTimeout: 200,
            closeTimeout: 100,
            useTimout: true,
            activeItemClass: 'active',
            menuActiveClass: 'active',
            highlightCurrentMenu: true,
            currentMenuClass: 'current',
            parentItems: '#menu > li',
            showEvent: 'mouseenter',
            closeEvent: 'mouseleave',
            defaultMenuClass: '',
            subCategoryMenuSectionSelector: '',
            subCategoryMenuSelectorAttr: '',
            // viewModel flags
            // events
            menuitemhover: null,
            // view flags
            // view text defaults
            // view Template
            viewTemplate: '', // treat like its an id
        },

        events: [MENUITEMHOVER, MENUITEMSHOW, MENUITEMHIDE],

        viewModel: null,

        view: null,

        // private property
        _viewAppended: false,

        _activeMenuItem: '',


        // Standard Methods
        initialise: function (el, o) {
            var widget = this;
            // check for an internal view
            var internalView = $(el).children(":first");
            if (internalView.data("view")) {
                widget.view = internalView.html();
            } else {
                if (!widget.options.viewTemplate) {
                    widget.options.viewTemplate = widget._getDefaultViewTemplate();
                }
                var viewTemplate = kendo.template(widget.options.viewTemplate);
                widget.view = viewTemplate(widget.options);
                $(el).append(widget.view);
                widget._viewAppended = true;
            }
            // now MMVM bind
            widget.viewModel = widget._getViewModel();
            var target = $(widget.element).children(":first");
            kendo.bind(target, widget.viewModel);
        },

        destroy: function () {
            var widget = this;
            // remove the data element
            widget.element.removeData(widget.name);
            // clean up the DOM
            if (widget._viewAppended) {
                $.cv.util.destroyKendoWidgets(widget.element);
                widget.element.empty();
            }
        },

        showMenuItem: function (item) {
            var widget = this;
            widget.viewModel.showItem(item);
        },

        hideMenuItem: function (item) {
            var widget = this;
            widget.viewModel.hideItem(item);
        },

        // private function
        _getViewModel: function () {
            var widget = this;

            initCurrentMenu = function () {
                var currentPath = decodeURIComponent(window.location.pathname);
                var currentItem = null;
                if (widget.options.highlightCurrentMenu) {
                    $(widget.options.parentItems).each(function () {
                        var _this = this;
                        var links = $(_this).find("a[href='" + currentPath + "']");
                        if ($(links).length > 0) {
                            currentItem = _this;
                            return false;
                        }
                    });
                    if (currentItem != null && $(currentItem).length > 0)
                        $(currentItem).addClass(widget.options.currentMenuClass);
                }
            }


            var getDataView = function () {
                var array = widget.element.find(widget.options.parentItems);
                $.each(array, function (idx, item) {
                    // add standard commands
                    $(item).bind(widget.options.showEvent, function () {
                        viewModel.showItem(item);
                    });

                    if ($.cv.util.isNullOrWhitespace(widget.options.subCategoryMenuSectionSelector)) {
                    $(item).bind(widget.options.closeEvent, function () {
                        viewModel.hideItem(item);
                    });
                    }
                });
            }

            var viewModel = kendo.observable({


                // Properties for UI elements

                currentTimeOutID: '',

                isMenuOpen: false,

                menuActiveClass: function () {
                    var returnValue = widget.options.defaultMenuClass;
                    if (this.get("isMenuOpen")) {
                        returnValue += " " + widget.options.menuActiveClass;
                    }
                    return returnValue;
                },

                // UI Element state
                showItem: function (item) {
                    window.clearTimeout(this.get("currentTimeOutID"));
                    var _this = this;
                    if ($(item).attr(widget.options.subCategoryMenuSelectorAttr)) item = $($(item).attr(widget.options.subCategoryMenuSelectorAttr));
                    if (widget.options.useTimout && !this.get('isMenuOpen')) {
                        var timeOutID = window.setTimeout(function () {
                            _this.hideActiveItem();
                            $(item).addClass(widget.options.activeItemClass);
                            _this.set('isMenuOpen', true);
                        }, widget.options.openTimeout);
                        this.set('currentTimeOutID', timeOutID);
                    }
                    else {
                        this.hideActiveItem();
                        $(item).addClass(widget.options.activeItemClass);
                        this.set('isMenuOpen', true);
                    }
                    widget.trigger(MENUITEMSHOW, { item: item });
                },

                hideItem: function (item) {
                    window.clearTimeout(this.get("currentTimeOutID"));
                    var _this = this;
                    if ($(item).attr(widget.options.subCategoryMenuSelectorAttr)) item = $($(item).attr(widget.options.subCategoryMenuSelectorAttr));
                    if (widget.options.useTimout) {
                        var timeOutID = window.setTimeout(function () {
                            _this.hideActiveItem();
                            $(item).removeClass(widget.options.activeItemClass);
                            _this.set('isMenuOpen', false);
                        }, widget.options.closeTimeout);
                        this.set('currentTimeOutID', timeOutID);
                    }
                    else {
                        this.hideActiveItem();
                        $(item).removeClass(widget.options.activeItemClass);
                        this.set('isMenuOpen', false);
                    }
                    widget.trigger(MENUITEMHIDE, { item: item });
                },

                hideActiveItem: function () {
                    var selector = widget.options.parentItems;
                    if (!$.cv.util.isNullOrWhitespace(widget.options.subCategoryMenuSectionSelector)) {
                        selector = widget.options.subCategoryMenuSectionSelector;
                    }
                    widget.element.find(selector).removeClass(widget.options.activeItemClass);
                },

                showDefaultMenu: function () {
                    if ($(widget.options.parentItems)[0]) {
                        this.showItem($(widget.options.parentItems)[0]);
                    }
                }

            });

            getDataView();
            initCurrentMenu();

            return viewModel;
        },

        _getDefaultViewTemplate: function () {
            var widget = this;
            // modify view template based on widget.options where applicable
            var html = "";

            return html;
        }
    }

    // register the widget

    $.cv.ui.widget(megaMenuWidget);

})(jQuery);